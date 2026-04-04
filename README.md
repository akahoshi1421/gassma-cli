# GASsma-cli

[日本語](docs/README.ja.md) | English

GASsma-cli is a CLI tool for [GASsma](https://github.com/akahoshi1421/gassma).

It generates type files and client JS files for GASsma from `.prisma` files, similar to Prisma CLI.

Without GASsma-cli, you need to manually write GASsma-specific configurations such as relations, default values, and other definitions. With GASsma-cli, you get almost the same development experience as Prisma by using `.prisma` files.

## Usage

1. Install GASsma-cli

```sh
npm i gassma
```

2. Execute init command

```sh
npx gassma init
```

It will generate `schema.prisma` and `gassma.config.ts` after executing the above command.

3. Write database definition and config

Example...

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"
}

model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String?
  age   Int
  profile Profile?
}

model Profile {
  id      Int     @id @default(autoincrement())
  bio     String?
  website String?
  userId  Int     @id
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

`schemaClient.js` and `schemaClient.d.ts` will be generated.

5. Development

You can develop with GASsma just like Prisma by importing the generated client file (`schemaClient.js`), which includes database relations and other definitions.

```ts
import { GassmaClient } from "../generated/gassma2/schemaClient";

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

Generate schema file and `gassma.config.ts` file.

#### options

|name|description|
|--|--|
|`--output <path>`|Custom output path for generated files|
|`--with-model`|Include a sample User model in the schema|

### generate

Generate type definition files and a client JS file with relation settings, autoincrement, default values, and more from .prisma files.

#### options

|name|description|
|--|--|
|`--schema <path>`|Path to a specific .prisma file to generate|
|`--watch`|Watch for changes and regenerate automatically|

### format

Format .prisma files.

#### options

|name|description|
|--|--|
|`--schema <path>`|Path to a specific .prisma file to format|
|`--check`|Check if files are formatted without modifying them|

### validate

Validate .prisma files.

#### options

|name|description|
|--|--|
|`--schema <path>`|Path to a specific .prisma file to validate|

## Detail reference

https://akahoshi1421.github.io/gassma-reference/docs/reference/type-generation/

## License

MIT