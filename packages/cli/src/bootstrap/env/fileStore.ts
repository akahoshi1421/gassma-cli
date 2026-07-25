import fs from "fs";
import path from "path";

type FileStore = {
  exists: (filePath: string) => boolean;
  read: (filePath: string) => string;
  write: (filePath: string, content: string) => void;
};

const createFsFileStore = (): FileStore => ({
  exists: (filePath) => fs.existsSync(filePath),
  read: (filePath) => fs.readFileSync(filePath, "utf-8"),
  write: (filePath, content) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, "utf-8");
  },
});

export { createFsFileStore };
export type { FileStore };
