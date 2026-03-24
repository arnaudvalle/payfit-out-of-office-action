import * as esbuild from "esbuild";

// node-ical (CJS) uses dynamic require(); ESM bundles otherwise get esbuild's throwing shim.
const cjsRequireBanner = `import { createRequire } from "module";
const require = createRequire(import.meta.url);
`;

await esbuild.build({
  banner: { js: cjsRequireBanner },
  bundle: true,
  entryPoints: ["src/index.ts"],
  format: "esm",
  outfile: "dist/index.mjs",
  platform: "node",
  sourcemap: true,
});
