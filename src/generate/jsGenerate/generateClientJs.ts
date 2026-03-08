import type { RelationsConfig } from "../read/extractRelations";

const generateClientJs = (
  relations: RelationsConfig,
  schemaName: string,
): string => {
  const lowerName = schemaName.charAt(0).toLowerCase() + schemaName.slice(1);
  const relationsJson =
    Object.keys(relations).length === 0
      ? "{}"
      : JSON.stringify(relations, null, 2);

  return `var ${lowerName}Relations = ${relationsJson};

var GassmaClient = (function () {
  function GassmaClient(options) {
    var mergedOptions = Object.assign({}, options, { relations: ${lowerName}Relations });
    var client = new Gassma.GassmaClient(mergedOptions);
    this.sheets = client.sheets;
  }
  return GassmaClient;
})();

exports.GassmaClient = GassmaClient;
`;
};

export { generateClientJs };
