import { getManyColumnType } from "./oneGassmaAnyUse/getManyColumType";
import { getOneColumnType } from "./oneGassmaAnyUse/getOneColumnType";

const getOneGassmaAnyUse = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string
) => {
  const oneAnyUse = Object.keys(sheetContent).reduce((pre, columName) => {
    const columnTypes = sheetContent[columName];

    const now =
      columnTypes.length === 1
        ? `${getOneColumnType(columnTypes[0])}`
        : `${getManyColumnType(columnTypes)}`;

    return `${pre}  "${columName}": ${now};\n`;
  }, `\nexport type Gassma${sheetName}Use = {\n`);

  return `${oneAnyUse}};\n`;
};

export { getOneGassmaAnyUse };
