const generateClientDts = (schemaName: string): string => {
  return `declare function createGassma${schemaName}Client(options?: Gassma${schemaName}ClientOptions): Gassma.GassmaClient<"${schemaName}">;
`;
};

export { generateClientDts };
