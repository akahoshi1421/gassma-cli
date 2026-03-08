import { getColumnType } from "../../util/getColumnType";
import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";
import type { RelationsConfig } from "../../read/extractRelations";

const isListRelation = (type: string): boolean =>
  type === "oneToMany" || type === "manyToMany";

const getRelationFields = (
  sheetName: string,
  relations?: RelationsConfig,
): string => {
  if (!relations) return "";
  const modelRelations = relations[sheetName];
  if (!modelRelations) return "";

  return Object.keys(modelRelations).reduce((pre, relationName) => {
    const rel = modelRelations[relationName];
    const filterType = isListRelation(rel.type)
      ? "Gassma.RelationListFilter"
      : "Gassma.RelationSingleFilter";

    return `${pre}  "${relationName}"?: ${filterType};\n`;
  }, "");
};

const getOneGassmaWhereUse = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const oneWhereUse = Object.keys(sheetContent).reduce((pre, columnName) => {
    const columnTypes = sheetContent[columnName];
    const now = getColumnType(columnTypes);
    const removedSpaceCurrentColumnName = getRemovedCantUseVarChar(columnName);

    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: ${now}${isQuestionMark ? " | null" : ""} | Gassma${sheetName}${removedSpaceCurrentColumnName}FilterConditions;\n`;
  }, `\ndeclare type Gassma${sheetName}WhereUse = {\n`);

  const relationFields = getRelationFields(sheetName, relations);

  return `${oneWhereUse}${relationFields}
  AND?: Gassma${sheetName}WhereUse[] | Gassma${sheetName}WhereUse;
  OR?: Gassma${sheetName}WhereUse[];
  NOT?: Gassma${sheetName}WhereUse[] | Gassma${sheetName}WhereUse;
};
`;
};

export { getOneGassmaWhereUse };
