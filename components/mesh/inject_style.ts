export function inject_style(style: string) {
  const styles = document.createElement("style");
  styles.setAttribute("type", "text/css");
  styles.textContent = style;
  document.head.appendChild(styles);
}
