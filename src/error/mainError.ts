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

export { ArgumentError, NoModelsError };
