import type { RelationsConfig } from "../../read/extractRelations";

const getOneGassmaFindSelect = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const scalarFields = Object.keys(sheetContent).reduce((pre, columnName) => {
    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: true;\n`;
  }, "");

  const modelRelations = relations?.[sheetName];
  const hasRelations =
    modelRelations !== undefined && Object.keys(modelRelations).length > 0;

  let relationFields = "";
  if (hasRelations) {
    relationFields = Object.keys(modelRelations).reduce((pre, relationName) => {
      const targetModel = modelRelations[relationName].to;
      const target = `Gassma${schemaName}${targetModel}`;
      const optionsType = `{ select?: ${target}Select; omit?: ${target}Omit; where?: ${target}WhereUse; orderBy?: ${target}OrderBy; take?: number; skip?: number; include?: ${target}Include; _count?: ${target}CountValue }`;
      return `${pre}  "${relationName}"?: true | ${optionsType};\n`;
    }, "");
  }

  const countField = hasRelations
    ? `  "_count"?: Gassma${schemaName}${sheetName}CountValue;\n`
    : "";

  return `\nexport type Gassma${schemaName}${sheetName}FindSelect = {\n${scalarFields}${relationFields}${countField}};\n`;
};

export { getOneGassmaFindSelect };
