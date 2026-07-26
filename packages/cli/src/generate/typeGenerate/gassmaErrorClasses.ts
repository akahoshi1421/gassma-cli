import { errorClassDefinitions } from "./gassmaErrorClasses/errorClassDefinitions";

const getGassmaErrorClasses = () => {
  return errorClassDefinitions.reduce((pre, def) => {
    const ctorLine = def.params
      ? `    constructor(${def.params});\n`
      : `    constructor();\n`;
    const memberLines = (def.members ?? [])
      .map((member) => `    ${member};\n`)
      .join("");

    return `${pre}  class ${def.name} extends ${def.extends} {\n${ctorLine}${memberLines}  }\n`;
  }, "");
};

export { getGassmaErrorClasses };
