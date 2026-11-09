/**
 * Load each page in headless Chrome over CDP and report console errors,
 * page exceptions, failed requests and how many WebGL canvases ended up
 * mounted. Used to check the landing page designs actually work rather than
 * just compiling.
 *
 *   node scripts/check_pages.mjs http://localhost:3100 /designs /designs/01-...
 */

import { spawn } from "node:child_process";

const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`;
const PORT = 9331;
const [base, ...paths] = process.argv.slice(2);
if (!base || paths.length === 0) {
  console.error("usage: node scripts/check_pages.mjs <base-url> <path> [path...]");
  process.exit(2);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  CHROME,
  [
    "--headless",
    "--disable-gpu",
    "--use-gl=swiftshader",
    "--enable-unsafe-swiftshader",
    "--no-sandbox",
    `--remote-debugging-port=${PORT}`,
    "--window-size=1440,1200",
    "about:blank",
  ],
  { stdio: "ignore" },
);

await sleep(2500);

async function connect() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((t) => t.type === "page");
  const sock = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (sock.onopen = r));
  return sock;
}

const sock = await connect();
let id = 0;
const pending = new Map();
const events = [];

sock.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result);
    pending.delete(m.id);
    return;
  }
  if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type)) {
    events.push({
      kind: m.params.type,
      text: m.params.args.map((a) => a.value ?? a.description ?? a.type).join(" "),
    });
  }
  if (m.method === "Runtime.exceptionThrown") {
    const d = m.params.exceptionDetails;
    events.push({ kind: "exception", text: d.exception?.description ?? d.text });
  }
  if (m.method === "Network.loadingFailed" && !m.params.canceled) {
    events.push({ kind: "request-failed", text: m.params.errorText });
  }
};

function send(method, params = {}, timeoutMs = 20000) {
  const mid = ++id;
  sock.send(JSON.stringify({ id: mid, method, params }));
  return new Promise((resolve) => {
    // a page that never settles must not hang the whole sweep
    const timer = setTimeout(() => {
      pending.delete(mid);
      resolve({ timedOut: true });
    }, timeoutMs);
    pending.set(mid, (result) => {
      clearTimeout(timer);
      resolve(result);
    });
  });
}

await send("Runtime.enable");
await send("Page.enable");
await send("Network.enable");

let failures = 0;
for (const path of paths) {
  events.length = 0;
  await send("Page.navigate", { url: base + path });
  await sleep(9000);
  // scroll through, so lazy sections and scroll-driven viewers actually run
  // Scroll the whole page and remember the most canvases ever mounted at once:
  // several designs mount their viewers lazily, so counting only at the top
  // would report zero for a page whose 3D works fine.
  await send(
    "Runtime.evaluate",
    {
      expression: `(async () => {
      window.__peakCanvases = document.querySelectorAll('canvas').length;
      const step = window.innerHeight;
      // capped: a sticky or growing layout can otherwise report a scroll
      // height that never ends
      for (let i = 0; i < 20; i++) {
        const y = i * step;
        if (y > document.body.scrollHeight) break;
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 300));
        window.__peakCanvases = Math.max(
          window.__peakCanvases, document.querySelectorAll('canvas').length);
      }
    })()`,
      awaitPromise: true,
    },
    40000,
  );
  await sleep(1500);

  const probe = await send("Runtime.evaluate", {
    expression: `JSON.stringify({
      canvases: window.__peakCanvases ?? document.querySelectorAll('canvas').length,
      height: document.body.scrollHeight,
      text: document.body.innerText.length,
      placeholder: /placeholder/i.test(document.body.innerText),
    })`,
    returnByValue: true,
  });
  if (!probe?.result?.value) {
    console.log(`FAIL ${path.padEnd(28)} page did not respond to the probe (timed out)`);
    failures++;
    continue;
  }
  const info = JSON.parse(probe.result.value);

  const errors = events.filter((e) => e.kind !== "warning");
  const status = errors.length === 0 && info.text > 400 ? "ok  " : "FAIL";
  if (status === "FAIL") failures++;
  console.log(
    `${status} ${path.padEnd(28)} canvases=${String(info.canvases).padStart(2)}` +
      ` height=${String(info.height).padStart(5)} chars=${String(info.text).padStart(5)}` +
      ` placeholderLabel=${info.placeholder ? "yes" : "no "}`,
  );
  for (const e of errors.slice(0, 4)) {
    console.log(`       ${e.kind}: ${e.text.slice(0, 150).replace(/\n/g, " ")}`);
  }
}

chrome.kill();
console.log(failures ? `\n${failures} page(s) with problems` : "\nall pages clean");
process.exit(failures ? 1 : 0);
