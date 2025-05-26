import type { Plugin } from "vite";
import compileChicory from "@chicory-lang/compiler"; // Assuming default export
import fs from "node:fs/promises";

// Define a type for the compiler output if not already available from the package
// This is a guess; adjust based on the actual output of @chicory-lang/compiler
interface ChicoryCompileResult {
  code: string;
  map?: any; // Or a more specific sourcemap type like `import { RawSourceMap } from 'source-map-js';`
}

const CHIC_EXTENSION = ".chic";
// We'll make Vite think .chic files are .chic.jsx files for processing purposes
const JSX_EXTENSION = ".jsx"; // Keep this to trigger JSX processing by Vite/SWC/esbuild

export default function chicory(): Plugin {
  return {
    name: "vite-plugin-chicory",
    enforce: "pre", // Crucial: run before Vite's internal JSX/TS transforms

    async resolveId(source, importer, options) {
      // If the source already ends with our virtual suffix, it means it was
      // already resolved by this plugin (e.g., an import within a .chic file to another .chic file).
      // We let Vite handle it further (it might be an absolute path already).
      if (source.endsWith(CHIC_EXTENSION + JSX_EXTENSION)) {
        // Potentially resolve it further if it's not an absolute path yet,
        // but usually, this isn't strictly needed if the first pass made it absolute.
        // However, to be safe and handle all import forms correctly:
        const furtherResolved = await this.resolve(source, importer, {
          ...options,
          skipSelf: true,
        });
        return furtherResolved;
      }

      if (source.endsWith(CHIC_EXTENSION)) {
        // Use Vite's built-in resolver to find the absolute path of the .chic file.
        const resolved = await this.resolve(source, importer, {
          ...options,
          skipSelf: true,
        });

        if (resolved && !resolved.external) {
          // resolved.id is the absolute path to the actual .chic file.
          // We return a new ID by appending our virtual .jsx suffix.
          // e.g., /path/to/MyComponent.chic -> /path/to/MyComponent.chic.jsx
          // This new ID will be used by Vite for the `load` hook and subsequent plugins.
          return {
            id: resolved.id + JSX_EXTENSION,
            // Carry over any other resolved properties, like meta
            meta: resolved.meta,
          };
        }
      }
      return null;
    },

    async load(id) {
      if (id.endsWith(CHIC_EXTENSION + JSX_EXTENSION)) {
        // Convert the ID back to the original .chic file path
        // e.g., /path/to/MyComponent.chic.jsx -> /path/to/MyComponent.chic
        const originalChicFilePath = id.slice(0, -JSX_EXTENSION.length);

        try {
          const chicSource = await fs.readFile(originalChicFilePath, "utf-8");
          const { code, map }: ChicoryCompileResult =
            compileChicory(chicSource);

          return {
            code,
            map,
          };
        } catch (error: any) {
          this.error(
            `Error compiling Chicory file ${originalChicFilePath}: ${error.message}`
          );
        }
      }
      // Let Vite handle loading other files
      return null;
    },
  };
}
