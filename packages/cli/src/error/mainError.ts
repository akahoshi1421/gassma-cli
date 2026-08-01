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
        "Please set datasource.url in gassma.config.ts or add a url to the datasource block in your schema.\n" +
        'Example:\n  datasource db {\n    provider = "gassma"\n    url      = "https://docs.google.com/spreadsheets/d/XXXX/edit"\n  }',
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

export {
  ArgumentError,
  NoModelsError,
  NoDatasourceUrlError,
  ConfigFileNotFoundError,
  GassmaConfigEnvError,
  GassmaConfigLoadError,
  MigrateOutputDirError,
  IgnoredRelationColumnError,
  ThroughSheetConflictError,
};
