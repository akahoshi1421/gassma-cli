const generateClientDts = (schemaName: string): string => {
  return `export declare class GassmaClient {
  constructor(options?: Gassma${schemaName}ClientOptions);
  readonly sheets: Gassma${schemaName}Sheet;
}
`;
};

export { generateClientDts };
