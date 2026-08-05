import type { AutoincrementConfig } from "../read/extractAutoincrement";
import { getOneGassmaController } from "./gassmaController/oneGassmaController";

const getGassmaController = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
  autoincrement: AutoincrementConfig = {},
) => {
  const controllerTypeDeclare = Object.keys(dictYaml).reduce(
    (pre, currentSheetName) =>
      pre +
      getOneGassmaController(
        schemaName,
        currentSheetName,
        Object.keys(dictYaml[currentSheetName]),
        autoincrement[currentSheetName] ?? [],
      ),
    "",
  );

  return controllerTypeDeclare;
};

export { getGassmaController };
