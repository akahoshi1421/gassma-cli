import type { MigrateModelDefinition } from "./buildMigrateModels";

type MigrateSheetsDefinition = {
  spreadsheetId?: string;
  models: MigrateModelDefinition[];
};

type PatchMigrationScriptOptions = {
  userSymbol: string;
  definition: MigrateSheetsDefinition;
};

const quote = (value: string): string => JSON.stringify(value);

const renderModel = (model: MigrateModelDefinition): string => {
  const columns = model.columns.map(quote).join(", ");
  return `{ name: ${quote(model.name)}, columns: [${columns}] }`;
};

const renderDefinition = (definition: MigrateSheetsDefinition): string => {
  const spreadsheetIdLines =
    definition.spreadsheetId === undefined
      ? []
      : [`    spreadsheetId: ${quote(definition.spreadsheetId)},`];
  const lastIndex = definition.models.length - 1;
  const modelLines = definition.models.map(
    (model, index) =>
      `      ${renderModel(model)}${index === lastIndex ? "" : ","}`,
  );

  return [
    "{",
    ...spreadsheetIdLines,
    "    models: [",
    ...modelLines,
    "    ]",
    "  }",
  ].join("\n");
};

const patchMigrationScript = (
  template: string,
  options: PatchMigrationScriptOptions,
): string =>
  template
    .replace(
      "Gassma.migrateSheets",
      () => `${options.userSymbol}.migrateSheets`,
    )
    .replace("({})", () => `(${renderDefinition(options.definition)})`);

export { patchMigrationScript };
export type { MigrateSheetsDefinition, PatchMigrationScriptOptions };
