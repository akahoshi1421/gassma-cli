import { isNumberColumn } from "../../util/isNumberColumn";
import { skipUnion } from "./skipUnion";

const numberOperationPart = (
  sheetContent: Record<string, unknown[]>,
): string => {
  const numberKeys = Object.keys(sheetContent)
    .filter((columnName) => isNumberColumn(sheetContent[columnName]))
    .map((columnName) =>
      columnName.at(-1) === "?"
        ? columnName.substring(0, columnName.length - 1)
        : columnName,
    );

  if (numberKeys.length === 0) return "";

  const keyUnion = numberKeys.map((key) => `"${key}"`).join(" | ");
  return ` | (K extends ${keyUnion} ? Gassma.NumberOperation : never)`;
};

const buildUpdateDataType = (
  use: string,
  sheetContent: Record<string, unknown[]>,
  strict?: boolean,
): string => {
  const numOp = numberOperationPart(sheetContent);
  const sk = skipUnion(strict);

  if (numOp === "" && sk === "") return `Partial<${use}>`;
  return `Partial<{ [K in keyof ${use}]: ${use}[K]${numOp}${sk} }>`;
};

export { buildUpdateDataType };
