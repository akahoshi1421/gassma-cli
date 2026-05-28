import type { RelationsConfig } from "../../read/extractRelations";

const getOneGassmaFindResult = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const prefix = `Gassma${schemaName}`;
  const self = `${prefix}${sheetName}`;
  const modelRelations = relations?.[sheetName] ?? {};

  // include した各リレーションの結果型: list は配列、manyToOne は単体（必須）、oneToOne は null 許容
  const includeMapFields = Object.keys(modelRelations)
    .map((relationName) => {
      const def = modelRelations[relationName];
      const target = `${prefix}${def.to}DefaultFindResult`;
      const isList = def.type === "oneToMany" || def.type === "manyToMany";
      const resultType = isList
        ? `${target}[]`
        : def.type === "manyToOne"
          ? target
          : `${target} | null`;
      return `  ${relationName}: ${resultType};`;
    })
    .join("\n");

  const includeMap = `
export type ${self}IncludeMap = {
${includeMapFields}${includeMapFields ? "\n" : ""}  _count: { [key: string]: number };
};
`;

  const findResult = `
export type ${self}FindResult<S, I = undefined, QO = undefined, GO = {}> = (S extends ${self}Select
  ? {
      [K in keyof S as S[K] extends true
        ? K & keyof ${self}DefaultFindResult
        : never]: ${self}DefaultFindResult[K & keyof ${self}DefaultFindResult];
    }
  : {
      [K in keyof ${self}DefaultFindResult as K extends Gassma.ResolveOmitKeys<GO, QO>
        ? never
        : K]: ${self}DefaultFindResult[K];
    }) &
  (I extends undefined
    ? {}
    : {
        [K in keyof I as K extends keyof ${self}IncludeMap
          ? K
          : never]: ${self}IncludeMap[K & keyof ${self}IncludeMap];
      });
`;

  return includeMap + findResult;
};

export { getOneGassmaFindResult };
