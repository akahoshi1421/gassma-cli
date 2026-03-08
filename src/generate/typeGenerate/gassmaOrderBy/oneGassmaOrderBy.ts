import type { RelationsConfig } from "../../read/extractRelations";

const getOneGassmaOrderBy = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const scalarFields = Object.keys(sheetContent).reduce((pre, columnName) => {
    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: "asc" | "desc" | Gassma.SortOrderInput;\n`;
  }, `\ndeclare type Gassma${sheetName}OrderBy = {\n`);

  const modelRelations = relations?.[sheetName];
  const relationFields = modelRelations
    ? Object.keys(modelRelations).reduce((pre, relationName) => {
        return `${pre}  "${relationName}"?: Gassma.RelationOrderBy;\n`;
      }, "")
    : "";

  const countField =
    modelRelations && Object.keys(modelRelations).length > 0
      ? '  "_count"?: Gassma.RelationOrderBy;\n'
      : "";

  return `${scalarFields}${relationFields}${countField}};\n`;
};

export { getOneGassmaOrderBy };
