import type { RelationsConfig } from "../../read/extractRelations";

const getOneGassmaCountValue = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
): string => {
  const modelRelations = relations?.[sheetName];
  if (!modelRelations || Object.keys(modelRelations).length === 0) {
    return `\ndeclare type Gassma${schemaName}${sheetName}CountValue = true;\n`;
  }

  const fields = Object.keys(modelRelations).reduce((pre, relationName) => {
    const targetModel = modelRelations[relationName].to;
    return `${pre}    "${relationName}"?: true | { where?: Gassma${schemaName}${targetModel}WhereUse };\n`;
  }, "");

  return `\ndeclare type Gassma${schemaName}${sheetName}CountValue = true | { select: {\n${fields}  } };\n`;
};

export { getOneGassmaCountValue };
