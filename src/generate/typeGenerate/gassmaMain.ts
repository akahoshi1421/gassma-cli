const getGassmaMain = () => {
  const mainTypeDeclare = `export namespace Gassma {
  export class GassmaClient {
    constructor(id?: string);

    readonly sheets: GassmaSheet;
  }
}

`;

  return mainTypeDeclare;
};

export { getGassmaMain };
