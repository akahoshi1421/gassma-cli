const generateClientDts = (schemaName: string): string => {
  return `export declare class GassmaClient<O extends Gassma${schemaName}GlobalOmitConfig = {}> {
  constructor(options?: Gassma${schemaName}ClientOptions<O>);
  readonly sheets: Gassma${schemaName}Sheet<O>;
}
`;
};

export { generateClientDts };
