import { getColumnType } from "../../util/getColumnType";

const getOneGassmaAnyUse = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
  optionalFields: string[] = [],
) => {
  const oneAnyUse = Object.keys(sheetContent).reduce((pre, columnName) => {
    const columnTypes = sheetContent[columnName];

    const now = getColumnType(columnTypes);

    const isNullable = columnName.at(-1) === "?";
    const baseName = isNullable
      ? columnName.substring(0, columnName.length - 1)
      : columnName;
    const isOmittable = optionalFields.indexOf(baseName) !== -1;
    const insertColumnName = isOmittable ? `"${baseName}"?` : `"${baseName}"`;
    const valueType = isNullable ? `${now} | null` : now;

    return `${pre}  ${insertColumnName}: ${valueType};\n`;
  }, `\nexport type Gassma${schemaName}${sheetName}Use = {\n`);

  return `${oneAnyUse}};\n`;
};

export { getOneGassmaAnyUse };
