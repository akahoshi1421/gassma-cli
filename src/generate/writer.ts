import fs from "fs";

const writer = (resultTypeString: string) => {
  fs.writeFileSync("index.d.ts", resultTypeString);
};

export { writer };
