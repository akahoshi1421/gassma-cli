import type { EnumsConfig } from "../read/extractEnums";
import { getClientDocs } from "../typeGenerate/tsdoc/clientDocs";

const generateClientDts = (
  schemaName: string,
  enums?: EnumsConfig,
  sheetNames?: string[],
): string => {
  const docs = getClientDocs(schemaName, sheetNames ?? []);

  let result = `${docs.transactionClient}export type Gassma${schemaName}TransactionClient<O extends Gassma.StrictGlobalOmit<O, Gassma${schemaName}GlobalOmitConfig> = {}> = Gassma${schemaName}Sheet<O> & {
${docs.extends}  $extends: Gassma${schemaName}ExtendsFn<O, {}>;
};
${docs.client}export interface GassmaClient<O extends Gassma.StrictGlobalOmit<O, Gassma${schemaName}GlobalOmitConfig> = {}> extends Gassma${schemaName}Sheet<O> {
${docs.extends}  $extends: Gassma${schemaName}ExtendsFn<O, {}>;
${docs.transaction}  $transaction<T>(fn: (tx: Gassma${schemaName}TransactionClient<O>) => T, options?: Gassma.GassmaTransactionOptions): T;
}
${docs.client}export declare class GassmaClient<O extends Gassma.StrictGlobalOmit<O, Gassma${schemaName}GlobalOmitConfig> = {}> {
${docs.constructor}  constructor(options?: Gassma${schemaName}ClientOptions<O>);
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
