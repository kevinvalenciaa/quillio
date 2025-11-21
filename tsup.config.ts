import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["electron/main.ts", "electron/preload.ts"],
  format: ["cjs"],
  target: "node18",
  platform: "node",
  outDir: "dist-electron",
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: !options.watch,
  external: ["electron", "better-sqlite3"],
  outExtension() {
    return { js: ".cjs" };
  },
  watch: options.watch,
}));
