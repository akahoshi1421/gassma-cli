import type { RelationsConfig } from "../../read/extractRelations";

const getOneGassmaOrderBy = (
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

    return `${pre}  "${removedQuestionMark}"?: "asc" | "desc" | Gassma.SortOrderInput;\n`;
  }, `\ndeclare type Gassma${schemaName}${sheetName}OrderBy = {\n`);

  const modelRelations = relations?.[sheetName];
  const relationFields = modelRelations
    ? Object.keys(modelRelations).reduce((pre, relationName) => {
        const targetModel = modelRelations[relationName].to;
        return `${pre}  "${relationName}"?: Gassma${schemaName}${targetModel}OrderBy | { _count: "asc" | "desc" };\n`;
      }, "")
    : "";

  const countField =
    modelRelations && Object.keys(modelRelations).length > 0
      ? `  "_count"?: { ${Object.keys(modelRelations)
          .map((name) => `"${name}"?: "asc" | "desc"`)
          .join("; ")} };\n`
      : "";

  return `${scalarFields}${relationFields}${countField}};\n`;
};

export { getOneGassmaOrderBy };
