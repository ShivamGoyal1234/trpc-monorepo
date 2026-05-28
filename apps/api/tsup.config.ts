import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  bundle: true,
  splitting: false,
  clean: true,
  outDir: "./dist",
  platform: "node",
  target: "node20",
  format: ["cjs"],
  minify: false,
  sourcemap: true,
  // Single-file bundle: no node_modules needed in the Docker runner image
  noExternal: [/.*/],
});
