import { getOneGassmaCreateReturn } from "./gassmaCreateReturn/oneGassmaCreateReturn";

const getGassmaCreateReturn = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
) => {
  const createReturnTypeDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) =>
      pre +
      getOneGassmaCreateReturn(
        dictYaml[currentSheetName],
        schemaName,
        currentSheetName,
      ),
    "",
  );

  return createReturnTypeDeclare;
};

export { getGassmaCreateReturn };
