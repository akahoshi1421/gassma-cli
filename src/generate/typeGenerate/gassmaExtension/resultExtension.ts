import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";

const getGassmaResultExtension = (sheetNames: string[], schemaName: string) => {
  const prefix = `Gassma${schemaName}`;
  const selfOf = (sheetName: string) =>
    `${prefix}${getRemovedCantUseVarChar(sheetName)}`;

  const scalarsBranches = sheetNames
    .map(
      (sheetName) =>
        `  M extends "${sheetName}" ? ${selfOf(sheetName)}DefaultFindResult :`,
    )
    .join("\n");
  const scalarsBody =
    sheetNames.length > 0
      ? `${scalarsBranches}\n  { [field: string]: unknown };`
      : "  { [field: string]: unknown };";

  const computedMapEntries = sheetNames
    .map(
      (sheetName) =>
        `  "${sheetName}": Gassma.MergeShape<Gassma.At<CMap, "${sheetName}">, Gassma.ComputedOf<R, "${sheetName}">>;`,
    )
    .join("\n");

  const extendedClientEntries = sheetNames
    .map((sheetName) => {
      const self = selfOf(sheetName);
      const go = `O extends { "${sheetName}": infer UO } ? UO extends ${self}Omit ? UO : {} : {}`;
      return `  "${sheetName}": ${self}Controller<${go}, O, Gassma.At<CMap, "${sheetName}">>;`;
    })
    .join("\n");

  return `
export type ${prefix}ResultScalars<M> =
${scalarsBody}

export type ${prefix}ResultShape = {
  [M in ${prefix}ModelName | "$allModels"]?: unknown;
};

export type ${prefix}ResultComputeSlots<RC_> = {
  [M in keyof RC_]?: { [F in keyof RC_[M]]?: { compute: RC_[M][F] } };
};

export type ${prefix}ResultComputedKeys<R_, CMap, M> =
  keyof Gassma.At<R_, M> | keyof Gassma.At<R_, "$allModels"> | keyof Gassma.At<CMap, M>;

export type ${prefix}ResultComputedTypes<RC_, CMap, M> = Gassma.MergeShape<
  Gassma.At<CMap, M>,
  Gassma.MergeShape<Gassma.SlotReturns<Gassma.At<RC_, "$allModels">>, Gassma.SlotReturns<Gassma.At<RC_, M>>>
>;

export type ${prefix}ResultExtension<R_, RC_, CMap> = {
  [M in keyof R_]: {
    [F in keyof R_[M]]?: Gassma.ResultField<${prefix}ResultScalars<M>, R_[M][F], ${prefix}ResultComputedKeys<R_, CMap, M>, ${prefix}ResultComputedTypes<RC_, CMap, M>>;
  };
};

export type ${prefix}ResultConfig = {
  [M in ${prefix}ModelName | "$allModels"]?: {
    [field: string]: {
      needs?: { [key: string]: boolean };
      compute: (record: any) => unknown;
    };
  };
};

export type ${prefix}ComputedMap<CMap, R> = {
${computedMapEntries}
};

export type ${prefix}ExtendsFn<O extends ${prefix}GlobalOmitConfig, CMap> = <R_ extends ${prefix}ResultShape = {}, RC_ extends ${prefix}ResultShape = {}, R extends ${prefix}ResultConfig = {}>(extension: {
  query?: ${prefix}QueryExtension<O>;
  result?: ${prefix}ResultExtension<R_, RC_, CMap> & ${prefix}ResultComputeSlots<RC_> & R;
}) => ${prefix}ExtendedClient<O, ${prefix}ComputedMap<CMap, R>>;

export type ${prefix}ExtendedClient<O extends ${prefix}GlobalOmitConfig = {}, CMap = {}> = {
${extendedClientEntries}
  $extends: ${prefix}ExtendsFn<O, CMap>;
};
`;
};

export { getGassmaResultExtension };
