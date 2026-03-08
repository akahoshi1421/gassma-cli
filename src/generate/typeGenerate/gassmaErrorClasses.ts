import { errorClassDefinitions } from "./gassmaErrorClasses/errorClassDefinitions";

const getGassmaErrorClasses = () => {
  return errorClassDefinitions.reduce((pre, def) => {
    const ctorLine = def.params
      ? `    constructor(${def.params});\n`
      : `    constructor();\n`;

    return `${pre}  class ${def.name} extends ${def.extends} {\n${ctorLine}  }\n`;
  }, "");
};

export { getGassmaErrorClasses };
