import type { RelationsConfig } from "../../read/extractRelations";
import { skipUnion } from "../util/skipUnion";

const getOneGassmaInclude = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
  strict?: boolean,
): string => {
  const modelRelations = relations?.[sheetName];
  if (!modelRelations || Object.keys(modelRelations).length === 0) {
    return `\nexport type Gassma${schemaName}${sheetName}Include = {};\n`;
  }

  const sk = skipUnion(strict);
  const fields = Object.keys(modelRelations).reduce((pre, relationName) => {
    const targetModel = modelRelations[relationName].to;
    const target = `Gassma${schemaName}${targetModel}`;
    const optionsType = `{ select?: ${target}FindSelect${sk}; omit?: ${target}Omit${sk}; where?: ${target}WhereUse${sk}; orderBy?: ${target}OrderBy | ${target}OrderBy[]${sk}; take?: number${sk}; skip?: number${sk}; include?: ${target}Include${sk}; _count?: ${target}CountValue${sk} }`;
    return `${pre}  "${relationName}"?: true | ${optionsType}${sk};\n`;
  }, "");

  const countField = `  "_count"?: Gassma${schemaName}${sheetName}CountValue${sk};\n`;

  return `\nexport type Gassma${schemaName}${sheetName}Include = {\n${fields}${countField}};\n`;
};

export { getOneGassmaInclude };
