import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";

const getGassmaGlobalOmitConfig = (sheetNames: string[]) => {
  const body = sheetNames.reduce((pre, sheetName) => {
    const cleanName = getRemovedCantUseVarChar(sheetName);
    return `${pre}  "${sheetName}"?: Gassma${cleanName}Omit;\n`;
  }, "");

  return `declare type GassmaGlobalOmitConfig = {\n${body}};\n`;
};

const getGassmaClientOptions = () => {
  return `declare type GassmaClientOptions = {
  id?: string;
  relations?: Gassma.RelationsConfig;
  omit?: GassmaGlobalOmitConfig;
};\n`;
};

const getGassmaMain = (sheetNames: string[]) => {
  const mainTypeDeclare = `declare namespace Gassma {
  class GassmaClient {
    constructor(idOrOptions?: string | GassmaClientOptions);

    readonly sheets: GassmaSheet;
  }
}

`;

  return (
    mainTypeDeclare +
    getGassmaGlobalOmitConfig(sheetNames) +
    getGassmaClientOptions()
  );
};

export { getGassmaMain };
