import type { RelationsConfig } from "../../read/extractRelations";
import { skipUnion } from "../util/skipUnion";

const getOneGassmaFindSelect = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const scalarFields = Object.keys(sheetContent).reduce((pre, columnName) => {
    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: true${sk};\n`;
  }, "");

  const modelRelations = relations?.[sheetName];
  const hasRelations =
    modelRelations !== undefined && Object.keys(modelRelations).length > 0;

  let relationFields = "";
  if (hasRelations) {
    relationFields = Object.keys(modelRelations).reduce((pre, relationName) => {
      const targetModel = modelRelations[relationName].to;
      const target = `Gassma${schemaName}${targetModel}`;
      const optionsType = `{ select?: ${target}FindSelect${sk}; omit?: ${target}Omit${sk}; where?: ${target}WhereUse${sk}; orderBy?: ${target}OrderBy | ${target}OrderBy[]${sk}; take?: number${sk}; skip?: number${sk}; include?: ${target}Include${sk}; _count?: ${target}CountValue${sk} }`;
      return `${pre}  "${relationName}"?: true | ${optionsType}${sk};\n`;
    }, "");
  }

  const countField = hasRelations
    ? `  "_count"?: Gassma${schemaName}${sheetName}CountValue${sk};\n`
    : "";

  return `\nexport type Gassma${schemaName}${sheetName}FindSelect = {\n${scalarFields}${relationFields}${countField}};\n`;
};

export { getOneGassmaFindSelect };
