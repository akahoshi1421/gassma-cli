import type {
  RelationDefinition,
  RelationsConfig,
} from "../../read/extractRelations";
import { getNestedWriteFields } from "./getNestedWriteFields";
import { skipOptionalWrap, skipUnion } from "./skipUnion";

const buildFkXorPart = (
  schemaName: string,
  use: string,
  relationName: string,
  rel: RelationDefinition,
  strict?: boolean,
): string => {
  const sk = skipUnion(strict);
  const target = `Gassma${schemaName}${rel.to}`;
  const targetCreate = skipOptionalWrap(`${target}Use`, strict);
  const ops = `create?: ${targetCreate}${sk}; connect?: ${target}WhereUse${sk}; connectOrCreate?: { where: ${target}WhereUse; create: ${targetCreate} }${sk}`;

  return `(Pick<${use}, "${rel.field}"> | { "${relationName}": { ${ops} } })`;
};

const buildCreateDataType = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
  strict?: boolean,
): string => {
  const use = `Gassma${schemaName}${sheetName}Use`;
  const modelRelations = relations?.[sheetName] ?? {};
  const fkRelationNames = Object.keys(modelRelations).filter(
    (name) => modelRelations[name].type === "manyToOne",
  );
  const nestedFields = getNestedWriteFields(
    schemaName,
    sheetName,
    relations,
    "create",
    strict,
  );

  const fkFieldsUnion = fkRelationNames
    .map((name) => `"${modelRelations[name].field}"`)
    .join(" | ");
  const baseType =
    fkRelationNames.length > 0
      ? skipOptionalWrap(`Omit<${use}, ${fkFieldsUnion}>`, strict)
      : skipOptionalWrap(use, strict);
  const xorParts = fkRelationNames.map((name) =>
    buildFkXorPart(schemaName, use, name, modelRelations[name], strict),
  );
  const nestedParts = nestedFields ? [`{\n${nestedFields}  }`] : [];

  return [baseType, ...xorParts, ...nestedParts].join(" & ");
};

export { buildCreateDataType };
