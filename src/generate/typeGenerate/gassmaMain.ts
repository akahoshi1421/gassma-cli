const getGassmaMain = () => {
  const mainTypeDeclare = `declare namespace Gassma {
  class GassmaClient {
    constructor(id?: string);

    readonly sheets: GassmaSheet;
  }
}

`;

  return mainTypeDeclare;
};

export { getGassmaMain };
