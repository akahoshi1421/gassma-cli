import { getRemovedSpaceSheetNames } from "../util/getRemovedSpaceSheetName";

const getGassmaSheet = (sheetNames: string[]) => {
  const sheetTypeDeclare = sheetNames.reduce((pre, current) => {
    const removeedSpaceCurrentSheetName = getRemovedSpaceSheetNames(current);

    return `${pre}  "${current}": Gassma${removeedSpaceCurrentSheetName}Controller;\n`;
  }, "export type GassmaSheet = {\n");

  return sheetTypeDeclare + "};\n";
};

export { getGassmaSheet };
