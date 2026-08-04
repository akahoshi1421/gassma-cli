import { getOneGassmaController } from "./gassmaController/oneGassmaController";

const getGassmaController = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
) => {
  const controllerTypeDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) =>
      pre +
      getOneGassmaController(
        schemaName,
        currentSheetName,
        Object.keys(dictYaml[currentSheetName]),
      ),
    "",
  );

  return controllerTypeDeclare;
};

export { getGassmaController };
