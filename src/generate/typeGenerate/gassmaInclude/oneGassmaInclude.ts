import type { RelationsConfig } from "../../read/extractRelations";

const getOneGassmaInclude = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
): string => {
  const modelRelations = relations?.[sheetName];
  if (!modelRelations || Object.keys(modelRelations).length === 0) {
    return `\ndeclare type Gassma${schemaName}${sheetName}Include = {};\n`;
  }

  const fields = Object.keys(modelRelations).reduce((pre, relationName) => {
    const targetModel = modelRelations[relationName].to;
    const target = `Gassma${schemaName}${targetModel}`;
    const optionsType = `{ select?: ${target}Select; omit?: ${target}Omit; where?: ${target}WhereUse; orderBy?: ${target}OrderBy; take?: number; skip?: number; include?: ${target}Include; _count?: ${target}CountValue }`;
    return `${pre}  "${relationName}"?: true | ${optionsType};\n`;
  }, "");

  const countField = `  "_count"?: Gassma${schemaName}${sheetName}CountValue;\n`;

  return `\ndeclare type Gassma${schemaName}${sheetName}Include = {\n${fields}${countField}};\n`;
};

export { getOneGassmaInclude };
