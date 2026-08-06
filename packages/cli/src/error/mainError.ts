class ArgumentError extends Error {
  constructor() {
    super("GASsmaArgumentError: invalid argument");
  }
}

class NoModelsError extends Error {
  constructor(schemaLocation: string) {
    super(
      `GASsmaNoModelsError: You don't have any models defined in ${schemaLocation}, so nothing will be generated.\n` +
        "You can define a model like this:\n\n" +
        "model User {\n  id   Int    @id\n  name String\n}",
    );
  }
}

class NoDatasourceUrlError extends Error {
  constructor() {
    super(
      "GASsmaNoDatasourceUrlError: datasource url is not set.\n" +
        'Looked at the datasource block in your schema, datasource.url in gassma.config.ts, and "parentId" in .clasp.json, but none of them had one.\n' +
        "Please set datasource.url in gassma.config.ts or add a url to the datasource block in your schema.\n" +
        'Example:\n  datasource db {\n    provider = "gassma"\n    url      = "https://docs.google.com/spreadsheets/d/XXXX/edit"\n  }',
    );
  }
}

class InvalidClaspJsonError extends Error {
  constructor(claspJsonPath: string) {
    super(
      `GASsmaInvalidClaspJsonError: .clasp.json at ${claspJsonPath} is not a valid JSON object.\n` +
        "Please fix its contents, or remove the file if you are not using clasp.",
    );
  }
}

class ConfigFileNotFoundError extends Error {
  constructor(configPath: string) {
    super(
      `GASsmaConfigFileNotFoundError: config file not found at ${configPath}`,
    );
  }
}

class GassmaConfigEnvError extends Error {
  constructor(name: string) {
    super(`Cannot resolve environment variable: ${name}.`);
    this.name = "GassmaConfigEnvError";
  }
}

class GassmaConfigLoadError extends Error {
  constructor(configPath: string, reason: unknown) {
    const detail = reason instanceof Error ? reason.message : String(reason);
    super(
      `GASsmaConfigLoadError: Failed to load config file at ${configPath}.\n${detail}`,
    );
  }
}

class MigrateOutputDirError extends Error {
  constructor() {
    super(
      "GASsmaMigrateOutputDirError: could not determine where to write gassma-migration.js.\n" +
        "Pass --output <dir> (e.g. npx gassma migrate --output ./dist), " +
        'or run in a project whose .clasp.json has "rootDir".',
    );
  }
}

class MigrateConfirmationRequiredError extends Error {
  constructor() {
    super(
      "GASsmaMigrateConfirmationRequiredError: this migration deletes sheets or columns, " +
        "which has to be confirmed in an interactive terminal.\n" +
        'Run "gassma migrate dev" in a terminal to answer the confirmation, ' +
        'or run "gassma migrate deploy" to generate the latest recorded migration as it is.',
    );
  }
}

class NoMigrationTrailError extends Error {
  constructor(migrationsDir: string) {
    super(
      `GASsmaNoMigrationTrailError: no recorded migration was found in ${migrationsDir}.\n` +
        'Run "gassma migrate dev" first to record one.',
    );
  }
}

class IgnoredRelationColumnError extends Error {
  readonly details: string[];

  constructor(details: string[]) {
    super(
      "GASsmaIgnoredRelationColumnError: @relation uses a column marked @ignore.\n" +
        details.map((detail) => `  - ${detail}`).join("\n"),
    );
    this.details = details;
  }
}

class ThroughSheetConflictError extends Error {
  constructor(sheetName: string, firstPair: string, secondPair: string) {
    super(
      `GASsmaThroughSheetConflictError: the through sheet "${sheetName}" would be shared by two different model pairs: ${firstPair} and ${secondPair}.\n` +
        "An implicit many-to-many relation needs a through sheet of its own, so the two pairs would overwrite each other.\n" +
        'Please give one of them a different relation name, e.g. @relation("OtherName") on both sides.',
    );
  }
}

const describeUniqueFields = (fields: string[]): string =>
  fields.length === 1
    ? `\`@unique\` on ${fields[0]} is not supported.`
    : "`@unique` is not supported.\n" +
      fields.map((field) => `  - ${field}`).join("\n");

class UnsupportedAttributeError extends Error {
  readonly fields: string[];

  constructor(fields: string[]) {
    super(
      `GASsmaUnsupportedAttributeError: ${describeUniqueFields(fields)}\n` +
        "GASsma cannot enforce uniqueness on a spreadsheet.\n" +
        "Remove it, or check uniqueness in your code.",
    );
    this.fields = fields;
  }
}

export {
  ArgumentError,
  NoModelsError,
  NoDatasourceUrlError,
  InvalidClaspJsonError,
  ConfigFileNotFoundError,
  GassmaConfigEnvError,
  GassmaConfigLoadError,
  MigrateOutputDirError,
  MigrateConfirmationRequiredError,
  NoMigrationTrailError,
  IgnoredRelationColumnError,
  ThroughSheetConflictError,
  UnsupportedAttributeError,
};
