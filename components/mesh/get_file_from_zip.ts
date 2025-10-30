import { BlobReader, BlobWriter, Entry, ZipReader } from "@zip.js/zip.js";
import * as THREE from "three";

// Narrow an Entry to a file entry (has getData)
type FileEntry = Entry & { getData: (writer: BlobWriter, options?: unknown) => Promise<Blob> };
function isFileEntry(e: Entry): e is FileEntry {
  return typeof (e as any)?.getData === "function";
}

const zip_entries: Record<string, Promise<Record<string, Entry>>> = {};

export async function get_texture_from_zip(url: string, filename: string) {
  const blob = await get_file_from_zip(url, filename);
  if (!blob) throw new Error("xx");
  return new THREE.TextureLoader().load(URL.createObjectURL(blob));
}

export async function get_file_from_zip(url: string, filename: string) {
  if (zip_entries[url] === undefined) {
    async function get_entries(url: string) {
      let zipReader;
      if (typeof url === "string") {
        zipReader = new ZipReader(
          new BlobReader(await (await fetch(url)).blob()),
        );
      } else {
        zipReader = new ZipReader(new BlobReader(url));
      }
      const entries = await zipReader.getEntries();
      const entry_map: Record<string, Entry> = {};
      for (let entry of entries) {
        console.log(entry.filename);

        entry_map[entry.filename] = entry;
      }
      await zipReader.close();
      return entry_map;
    }
    zip_entries[url] = get_entries(url);
  }
  const entry = (await zip_entries[url])[filename];
  if (!entry) console.error("file", filename, "not found in", url);

  if (entry?.filename === filename) {
    if (!isFileEntry(entry)) throw new Error(`"${filename}" in ${url} is not a file entry (likely a directory)`);
    const blob = await entry.getData(new BlobWriter());
    //if (return_type === "url") return URL.createObjectURL(blob);
    //if (return_type === "texture")
    //  return new THREE.TextureLoader().load(URL.createObjectURL(blob));
    return blob;
  }
}
