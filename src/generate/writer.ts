import fs from "fs";

const writer = (resultTypeString: string) => {
  fs.writeFileSync("./node_modules/gassma/index.d.ts", resultTypeString);
};

export { writer };
