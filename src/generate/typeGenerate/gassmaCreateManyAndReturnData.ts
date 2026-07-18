import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaCreateManyAndReturnData } from "./gassmaCreateMany/oneGassmaCreateManyAndReturnData";

const getGassmaCreateManyAndReturnData = (
  sheetNames: string[],
  schemaName: string,
  strict?: boolean,
) => {
  const createManyAndReturnDeclare = sheetNames.reduce(
    (pre, currentSheetName) => {
      const removedSpaceCurrentSheetName =
        getRemovedCantUseVarChar(currentSheetName);

      return (
        pre +
        getOneGassmaCreateManyAndReturnData(
          schemaName,
          removedSpaceCurrentSheetName,
          strict,
        )
      );
    },
    "",
  );

  return createManyAndReturnDeclare;
};

export { getGassmaCreateManyAndReturnData };
