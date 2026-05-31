import type { RelationsConfig } from "../../read/extractRelations";

const getOneGassmaFindResult = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const prefix = `Gassma${schemaName}`;
  const self = `${prefix}${sheetName}`;
  const modelRelations = relations?.[sheetName] ?? {};
  const relNames = Object.keys(modelRelations);

  // select 指定時（FindSelect の true キーのみ）
  const selectResult = `{
      [K in keyof S as S[K] extends true
        ? K & keyof ${self}DefaultFindResult
        : never]: ${self}DefaultFindResult[K & keyof ${self}DefaultFindResult];
    }`;

  // 非 select 時（omit / globalOmit を反映した全スカラー）
  const omitResult = `{
      [K in keyof ${self}DefaultFindResult as K extends Gassma.ResolveOmitKeys<GO, QO>
        ? never
        : K]: ${self}DefaultFindResult[K];
    }`;

  const baseResult = `(S extends ${self}Select
  ? ${selectResult}
  : ${omitResult})`;

  // include の各リレーションを、ターゲットモデルの FindResult で再帰的に解決する。
  // I[K] が true / { select } / { include }（ネスト）いずれでも SelectOf/IncludeOf で吸収。
  const includeBranches = relNames
    .map((relationName) => {
      const def = modelRelations[relationName];
      const targetFR = `${prefix}${def.to}FindResult`;
      const inner = `${targetFR}<Gassma.SelectOf<I[K]>, Gassma.IncludeOf<I[K]>, Gassma.OmitOf<I[K]>, {}>`;
      const isList = def.type === "oneToMany" || def.type === "manyToMany";
      // manyToOne でも optional（FK が nullable）なら null 許容にする
      const isRequiredSingle = def.type === "manyToOne" && !def.optional;
      const result = isList
        ? `${inner}[]`
        : isRequiredSingle
          ? inner
          : `${inner} | null`;
      return `          K extends "${relationName}" ? ${result} :`;
    })
    .join("\n");

  const relKeyUnion =
    relNames.length > 0
      ? `${relNames.map((r) => `"${r}"`).join(" | ")} | "_count"`
      : `"_count"`;

  // include 部分: 指定された I のキーのみを合成。_count は { [リレーション名]: number }
  const includePart = `(I extends undefined
    ? {}
    : {
        [K in keyof I as K extends ${relKeyUnion} ? K : never]:
${includeBranches}
          K extends "_count" ? Gassma.CountResult<I[K]> :
          never;
      })`;

  return `
export type ${self}FindResult<S, I = undefined, QO = undefined, GO = {}> = ${baseResult} &
  ${includePart};
`;
};

export { getOneGassmaFindResult };
