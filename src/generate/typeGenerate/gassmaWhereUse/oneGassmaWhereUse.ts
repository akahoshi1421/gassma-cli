import { getColumnType } from "../../util/getColumnType";
import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";
import type { RelationsConfig } from "../../read/extractRelations";
import { skipUnion } from "../util/skipUnion";

const isListRelation = (type: string): boolean =>
  type === "oneToMany" || type === "manyToMany";

const getRelationFields = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
  strict?: boolean,
): string => {
  if (!relations) return "";
  const modelRelations = relations[sheetName];
  if (!modelRelations) return "";

  const sk = skipUnion(strict);

  return Object.keys(modelRelations).reduce((pre, relationName) => {
    const rel = modelRelations[relationName];
    const targetWhere = `Gassma${schemaName}${rel.to}WhereUse`;
    const filterType = isListRelation(rel.type)
      ? `{ some?: ${targetWhere}${sk}; every?: ${targetWhere}${sk}; none?: ${targetWhere}${sk} }`
      : `{ is?: ${targetWhere} | null${sk}; isNot?: ${targetWhere} | null${sk} }`;

    return `${pre}  "${relationName}"?: ${filterType}${sk};\n`;
  }, "");
};

const getOneGassmaWhereUse = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const oneWhereUse = Object.keys(sheetContent).reduce((pre, columnName) => {
    const columnTypes = sheetContent[columnName];
    const now = getColumnType(columnTypes);
    const removedSpaceCurrentColumnName = getRemovedCantUseVarChar(columnName);

    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: ${now}${isQuestionMark ? " | null" : ""} | Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions${sk};\n`;
  }, `\nexport type Gassma${schemaName}${sheetName}WhereUse = {\n`);

  const relationFields = getRelationFields(
    schemaName,
    sheetName,
    relations,
    strict,
  );

  return `${oneWhereUse}${relationFields}
  AND?: Gassma${schemaName}${sheetName}WhereUse[] | Gassma${schemaName}${sheetName}WhereUse${sk};
  OR?: Gassma${schemaName}${sheetName}WhereUse[]${sk};
  NOT?: Gassma${schemaName}${sheetName}WhereUse[] | Gassma${schemaName}${sheetName}WhereUse${sk};
};
`;
};

export { getOneGassmaWhereUse };
