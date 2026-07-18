import { loadConfig } from "../config/loadConfig";
import { resolveSchemaFiles } from "../config/resolveSchemaFiles";
import { NoDatasourceUrlError } from "../error/mainError";
import { mergeSchemaFiles } from "../generate/mergeSchemaFiles";
import { extractDatasourceUrl } from "../generate/read/extractDatasourceUrl";
import { buildSpreadsheetUrl } from "./buildSpreadsheetUrl";

const resolveStudioUrl = (): string => {
  const files = resolveSchemaFiles({});
  const schemaText = mergeSchemaFiles(files.map((f) => f.filePath));
  const config = loadConfig();
  const urlOrId = extractDatasourceUrl(schemaText) ?? config?.datasource?.url;

  if (urlOrId === undefined || urlOrId === null) {
    throw new NoDatasourceUrlError();
  }

  return buildSpreadsheetUrl(urlOrId);
};

export { resolveStudioUrl };
