# @gassma/gas-esbuild-plugin

An esbuild plugin that exposes `export`ed functions as Google Apps Script (GAS) top-level functions.

GAS only recognizes top-level `function` declarations (the execution dropdown and triggers require them), so a plain esbuild bundle of `export { foo }` style code cannot be called from GAS. This plugin bundles your code as an iife kept in an internal global (`__gassmaExports`) and prepends a top-level function stub for every named export:

```js
function foo() { return __gassmaExports.foo.apply(this, arguments); }
```

## Usage

```sh
npm i -D @gassma/gas-esbuild-plugin esbuild
```

`esbuild.mjs`:

```js
import { build } from "esbuild";
import { gasEsbuildPlugin } from "@gassma/gas-esbuild-plugin";

await build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "dist/main.js",
  plugins: [gasEsbuildPlugin()],
});
```

`src/main.ts`:

```ts
export function main(): void {
  console.log("hi");
}
```

`dist/main.js` can be pushed to GAS as is (for example with clasp), and `main` shows up in the GAS function dropdown.

## Notes

- `outfile` is required because GAS expects a single bundled file. `outdir` is not supported.
- `format` is forced to `iife` and `globalName` is overwritten by the plugin.
- `write: false` is not supported.
- The `default` export and export names that cannot be top-level function names (invalid identifiers, reserved words) do not get stubs.
- To collect export names the plugin runs a second in-memory `format: "esm"` build with `metafile` enabled, because the metafile `exports` array is always empty for `iife` output. Other plugins are not applied to that analysis build.
