import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  noExternal: [/@repo\//],
  splitting: false,
  bundle: true,
  outDir: "./dist",
  clean: true,
  platform: "node",
  target: "node20",
  format: ["cjs"],
  minify: false,
  sourcemap: true,
});
