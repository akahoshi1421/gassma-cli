# gassma-cli

This repository is an npm workspaces monorepo for the GASsma CLI and related packages.

## Packages

| Package | Path | Description |
| --- | --- | --- |
| [gassma](packages/cli/README.md) | `packages/cli` | CLI tool that generates GASsma type definitions and client JS files from `.prisma` files, similar to Prisma CLI. |
| [@gassma/gas-esbuild-plugin](packages/gas-esbuild-plugin/README.md) | `packages/gas-esbuild-plugin` | esbuild plugin that exposes exported functions as Google Apps Script top-level functions. |

## Development

```sh
npm install

# run scripts for a specific workspace
npm test -w packages/cli
npm test -w packages/gas-esbuild-plugin
```

## Detail reference

https://akahoshi1421.github.io/gassma-reference/

## License

MIT
