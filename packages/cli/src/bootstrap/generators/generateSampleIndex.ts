import type { FunctionStyle } from "../functionStyle";

const EXPORT_SAMPLE = `export const main = () => console.log("Hello GAS!");\n`;

const GLOBAL_SAMPLE = `const main = () => console.log("Hello GAS!");

interface Global {
  main: typeof main;
}

declare const global: Global;

global.main = main;
`;

const generateSampleIndex = (style: FunctionStyle): string =>
  style === "export" ? EXPORT_SAMPLE : GLOBAL_SAMPLE;

export { generateSampleIndex };
