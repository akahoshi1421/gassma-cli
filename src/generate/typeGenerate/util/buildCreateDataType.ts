import type {
  RelationDefinition,
  RelationsConfig,
} from "../../read/extractRelations";
import { getNestedWriteFields } from "./getNestedWriteFields";

const buildFkXorPart = (
  schemaName: string,
  use: string,
  relationName: string,
  rel: RelationDefinition,
): string => {
  const target = `Gassma${schemaName}${rel.to}`;
  const ops = `create?: ${target}Use; connect?: ${target}WhereUse; connectOrCreate?: { where: ${target}WhereUse; create: ${target}Use }`;

  return `(Pick<${use}, "${rel.field}"> | { "${relationName}": { ${ops} } })`;
};

const buildCreateDataType = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
): string => {
  const use = `Gassma${schemaName}${sheetName}Use`;
  const modelRelations = relations?.[sheetName] ?? {};
  const fkRelationNames = Object.keys(modelRelations).filter(
    (name) => modelRelations[name].ownsFk === true,
  );
  const nestedFields = getNestedWriteFields(
    schemaName,
    sheetName,
    relations,
    "create",
  );

  const fkFieldsUnion = fkRelationNames
    .map((name) => `"${modelRelations[name].field}"`)
    .join(" | ");
  const baseType =
    fkRelationNames.length > 0 ? `Omit<${use}, ${fkFieldsUnion}>` : use;
  const xorParts = fkRelationNames.map((name) =>
    buildFkXorPart(schemaName, use, name, modelRelations[name]),
  );
  const nestedParts = nestedFields ? [`{\n${nestedFields}  }`] : [];

  return [baseType, ...xorParts, ...nestedParts].join(" & ");
};

export { buildCreateDataType };
