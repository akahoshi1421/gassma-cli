const getGassmaMain = () => {
  const mainTypeDeclare = `
export declare namespace Gassma {
  class GassmaClient {
    constructor(id?: string);

    readonly sheets: GassmaSheet;
  }
}

`;

  return mainTypeDeclare;
};

export { getGassmaMain };
