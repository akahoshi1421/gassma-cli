# GASsma-cli

[日本語](docs/README.ja.md) | English

GASsma-cli is a CLI tool for [GASsma](https://github.com/akahoshi1421/gassma).

It generates type files and client JS files for GASsma from `.prisma` files, similar to Prisma CLI.

Without GASsma-cli, you need to manually write GASsma-specific configurations such as relations, default values, and other definitions. With GASsma-cli, you get almost the same development experience as Prisma by using `.prisma` files.

## Usage

> Starting a new project? `npx gassma bootstrap` sets up a local GAS development environment (clasp + esbuild + TypeScript + GASsma) in one command. See [bootstrap](#bootstrap) below. The following steps are for adding GASsma to an existing project.

1. Install GASsma-cli

```sh
npm i gassma
```

2. Execute init command

```sh
npx gassma init
```

It will generate `gassma/schema.prisma` and `gassma.config.ts` after executing the above command.

3. Write database definition and config

Example...

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./src/generated/gassma"
}

model User {
  id      Int      @id @default(autoincrement())
  name    String
  email   String?
  age     Int
  profile Profile?
}

model Profile {
  id      Int     @id @default(autoincrement())
  bio     String?
  website String?
  userId  Int     @unique
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)
}
```

```ts
import { defineConfig } from "gassma/config";

export default defineConfig({
  schema: "gassma/schema.prisma",
  datasource: {
    url: "", // If you operate a spreadsheet that is not bound to GAS, enter the spreadsheet URL here.
  },
});
```

[NOTE] GASsma-cli also has `format` and `validate` commands, similar to Prisma.

4. Execute generating command

```sh
npx gassma generate
```

`schemaClient.js` and `schemaClient.d.ts` will be generated in the `output` directory of the generator block.

The file name is derived from the schema file name (`schema.prisma` -> `schemaClient.*`). You can also split the schema into multiple `.prisma` files in the same directory; they are merged automatically, and the file name is then derived from the directory name (`gassma/` -> `gassmaClient.*`).

5. Development

You can develop with GASsma just like Prisma by importing the generated client file (`schemaClient.js`), which includes database relations and other definitions.

```ts
import { GassmaClient } from "./generated/gassma/schemaClient";

const gassma = new GassmaClient();

function myFunction() {
  const result = gassma.User.findMany({
    where: {
      id: { gte: 10 }
    }
  });

  console.log(result);
}
```

## CLI commands reference

### init

Generate `gassma/schema.prisma` and a `gassma.config.ts` file.

#### options

|name|description|
|--|--|
|`--output <path>`|Custom output path for generated files|
|`--with-model`|Include a sample User model in the schema|

### generate

Generate type definition files and a client JS file with relation settings, autoincrement, default values, and more from `.prisma` files.

#### options

|name|description|
|--|--|
|`--schema <path>`|Path to a specific .prisma file to generate|
|`--config <path>`|Custom path to your GASsma config file|
|`--watch`|Watch for changes and regenerate automatically|

### format

Format `.prisma` files.

#### options

|name|description|
|--|--|
|`--schema <path>`|Path to a specific .prisma file to format|
|`--config <path>`|Custom path to your GASsma config file|
|`--check`|Check if files are formatted without modifying them|

### validate

Validate `.prisma` files.

#### options

|name|description|
|--|--|
|`--schema <path>`|Path to a specific .prisma file to validate|
|`--config <path>`|Custom path to your GASsma config file|

### bootstrap

Interactively set up a local GAS development environment (clasp + esbuild + TypeScript + GASsma). It creates an Apps Script project via clasp, registers the GASsma library, generates project files (`package.json`, `esbuild.mjs`, `tsconfig.json`, `.gitignore`, a sample `src/index.ts`), runs `gassma init`, and installs dependencies.

```sh
npx gassma bootstrap my-app   # create my-app/ and set up inside it
npx gassma bootstrap          # ask for a directory first
npx gassma bootstrap .        # set up in the current directory
```

Requires [clasp](https://github.com/google/clasp): `npm install -g @google/clasp`, then `clasp login`. See the [bootstrap reference](https://akahoshi1421.github.io/gassma-reference/en/docs/reference/bootstrap) for details.

#### arguments

|name|description|
|--|--|
|`[directory]`|Directory to set up the project in (`.` for the current directory). Omitting it prompts for one|

#### options

|name|description|
|--|--|
|`--yes`|Answer all prompts with their default values|
|`--skip-install`|Skip dependency installation|
|`--dry-run`|Show planned actions without writing files or running commands|

### studio

Open the datasource spreadsheet in your default browser.

#### options

|name|description|
|--|--|
|`--config <path>`|Custom path to your GASsma config file|

### debug

Print information helpful for debugging and bug reports (runtime, config, schema, clasp, and more).

#### options

|name|description|
|--|--|
|`--schema <path>`|Path to a specific .prisma file to inspect|
|`--config <path>`|Custom path to your GASsma config file|

### version

Display the current version of GASsma CLI.

#### options

|name|description|
|--|--|
|`--json`|Output version information as JSON|

## Config file

The config file is searched in the current directory in the order `gassma.config.{js,ts,mjs,cjs,mts,cts}`, then `.config/gassma.{js,ts,mjs,cjs,mts,cts}`. `--config <path>` overrides the search. The `env("NAME")` helper from `gassma/config` reads environment variables in the config file.

The schema also supports `previewFeatures = ["strictUndefinedChecks"]` in the generator block. See the [strictUndefinedChecks reference](https://akahoshi1421.github.io/gassma-reference/en/docs/reference/config/strict-undefined-checks) for details.

## Detail reference

https://akahoshi1421.github.io/gassma-reference/en/docs/reference/type-generation/

## License

MIT
