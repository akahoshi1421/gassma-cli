import type { EnumsConfig } from "../read/extractEnums";

const generateClientDts = (schemaName: string, enums?: EnumsConfig): string => {
  let result = `export declare class GassmaClient<O extends Gassma${schemaName}GlobalOmitConfig = {}> {
  constructor(options?: Gassma${schemaName}ClientOptions<O>);
  readonly sheets: Gassma${schemaName}Sheet<O>;
}
`;

  if (enums && Object.keys(enums).length > 0) {
    Object.keys(enums).forEach((enumName) => {
      const entries = enums[enumName]
        .map((e) => `  readonly ${e.name}: "${e.value}";`)
        .join("\n");
      result += `\nexport declare const ${enumName}: {\n${entries}\n};\nexport type ${enumName} = (typeof ${enumName})[keyof typeof ${enumName}];\n`;
    });
  }

  return result;
};

export { generateClientDts };
