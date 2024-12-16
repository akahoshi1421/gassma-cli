import { CANT_USE_VAR_CHAR } from "../const/cantUseVarChar";

const getRemovedSpaceSheetNames = (sheetName: string) => {
  let nowSheetName = sheetName;

  CANT_USE_VAR_CHAR.forEach((char) => {
    nowSheetName = nowSheetName.replace(char, "");
  });

  return nowSheetName;
};

export { getRemovedSpaceSheetNames };
