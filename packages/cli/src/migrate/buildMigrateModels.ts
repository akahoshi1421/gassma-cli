import { extractMap } from "../generate/read/extractMap";
import { extractMapSheets } from "../generate/read/extractMapSheets";
import { extractRelations } from "../generate/read/extractRelations";
import { prismaReader } from "../generate/read/prismaReader";
import { stripIgnoreAttributes } from "./stripIgnoreAttributes";

type MigrateModelDefinition = {
  name: string;
  columns: string[];
};

const stripOptionalSuffix = (field: string): string =>
  field.endsWith("?") ? field.slice(0, -1) : field;

const toLowercaseFirst = (value: string): string =>
  value.charAt(0).toLowerCase() + value.slice(1);

const buildSheetModels = (schemaText: string): MigrateModelDefinition[] => {
  const parsed = prismaReader(stripIgnoreAttributes(schemaText));
  const map = extractMap(schemaText);
  const mapSheets = extractMapSheets(schemaText);

  return Object.keys(parsed).map((modelName) => ({
    name: mapSheets[modelName] ?? modelName,
    columns: Object.keys(parsed[modelName]).map((field) => {
      const codeName = stripOptionalSuffix(field);
      return map[modelName]?.[codeName] ?? codeName;
    }),
  }));
};

const buildThroughColumns = (
  modelName: string,
  to: string,
  through: { field: string; reference: string },
): string[] => {
  if (modelName === to) return [through.field, through.reference].sort();
  return [modelName, to].sort().map((name) => `${toLowercaseFirst(name)}Id`);
};

const buildThroughModels = (schemaText: string): MigrateModelDefinition[] => {
  const relations = extractRelations(schemaText);
  const seenSheets = new Set<string>();
  const models: MigrateModelDefinition[] = [];

  Object.keys(relations).forEach((modelName) => {
    Object.values(relations[modelName]).forEach((definition) => {
      if (definition.type !== "manyToMany") return;
      if (definition.through === undefined) return;
      if (seenSheets.has(definition.through.sheet)) return;
      seenSheets.add(definition.through.sheet);

      models.push({
        name: definition.through.sheet,
        columns: buildThroughColumns(
          modelName,
          definition.to,
          definition.through,
        ),
      });
    });
  });

  return models;
};

const buildMigrateModels = (schemaText: string): MigrateModelDefinition[] => [
  ...buildSheetModels(schemaText),
  ...buildThroughModels(schemaText),
];

export { buildMigrateModels };
export type { MigrateModelDefinition };
