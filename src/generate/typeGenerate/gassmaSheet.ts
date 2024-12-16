const getGassmaSheet = (sheetNames: string[]) => {
  const sheetTypeDeclare = sheetNames.reduce((pre, current) => {
    const removeedSpaceCurrentSheetName = current
      .replace(" ", "")
      .replace("　", "");

    return `${pre}  "${current}": Gassma${removeedSpaceCurrentSheetName}Controller;\n`;
  }, "export type GassmaSheet = {\n");

  return sheetTypeDeclare + "\n" + "};\n";
};

export { getGassmaSheet };
