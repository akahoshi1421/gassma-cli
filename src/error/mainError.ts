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

export {
  ArgumentError,
  NoModelsError,
  NoDatasourceUrlError,
  ConfigFileNotFoundError,
  GassmaConfigEnvError,
};
