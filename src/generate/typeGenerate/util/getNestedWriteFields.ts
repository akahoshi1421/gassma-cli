import type { RelationsConfig } from "../../read/extractRelations";

const isListRelation = (type: string): boolean =>
  type === "oneToMany" || type === "manyToMany";

const getNestedWriteFields = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
): string => {
  if (!relations) return "";
  const modelRelations = relations[sheetName];
  if (!modelRelations) return "";

  const fields = Object.keys(modelRelations).reduce((pre, relationName) => {
    const rel = modelRelations[relationName];
    const target = `Gassma${schemaName}${rel.to}`;
    const isList = isListRelation(rel.type);

    const createType = isList
      ? `${target}Use | ${target}Use[]`
      : `${target}Use`;
    const connectType = isList
      ? `${target}WhereUse | ${target}WhereUse[]`
      : `${target}WhereUse`;
    const connectOrCreateType = isList
      ? `{ where: ${target}WhereUse; create: ${target}Use } | { where: ${target}WhereUse; create: ${target}Use }[]`
      : `{ where: ${target}WhereUse; create: ${target}Use }`;

    return `${pre}    "${relationName}"?: { create?: ${createType}; connect?: ${connectType}; connectOrCreate?: ${connectOrCreateType} };\n`;
  }, "");

  return fields;
};

export { getNestedWriteFields };
