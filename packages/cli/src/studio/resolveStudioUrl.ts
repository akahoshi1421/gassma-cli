import { loadConfig } from "../config/loadConfig";
import { resolveSchemaFiles } from "../config/resolveSchemaFiles";
import { NoDatasourceUrlError } from "../error/mainError";
import { mergeSchemaFiles } from "../generate/mergeSchemaFiles";
import { extractDatasourceUrl } from "../generate/read/extractDatasourceUrl";
import { buildSpreadsheetUrl } from "./buildSpreadsheetUrl";

type StudioUrlOptions = {
  config?: string;
};

const resolveStudioUrl = (options?: StudioUrlOptions): string => {
  const files = resolveSchemaFiles({ config: options?.config });
  const schemaText = mergeSchemaFiles(files.map((f) => f.filePath));
  const loaded = loadConfig(options?.config);
  const urlOrId =
    extractDatasourceUrl(schemaText) ?? loaded?.config.datasource?.url;

  if (urlOrId === undefined || urlOrId === null) {
    throw new NoDatasourceUrlError();
  }

  return buildSpreadsheetUrl(urlOrId);
};

export { resolveStudioUrl };
export type { StudioUrlOptions };
