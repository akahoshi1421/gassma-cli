import { loadConfig } from "../config/loadConfig";
import { resolveSchemaFiles } from "../config/resolveSchemaFiles";
import { NoDatasourceUrlError } from "../error/mainError";
import { mergeSchemaFiles } from "../generate/mergeSchemaFiles";
import { extractDatasourceUrl } from "../generate/read/extractDatasourceUrl";
import { buildSpreadsheetUrl } from "./buildSpreadsheetUrl";
import { readClaspParentId } from "./readClaspParentId";

type StudioUrlOptions = {
  config?: string;
};

const configured = (value: string | null | undefined): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value : undefined;

const resolveStudioUrl = (options?: StudioUrlOptions): string => {
  const files = resolveSchemaFiles({ config: options?.config });
  const schemaText = mergeSchemaFiles(files.map((f) => f.filePath));
  const loaded = loadConfig(options?.config);
  const candidate =
    configured(extractDatasourceUrl(schemaText)) ??
    configured(loaded?.config.datasource?.url) ??
    configured(readClaspParentId(process.cwd()));

  const urlOrId = configured(candidate);
  if (urlOrId === undefined) {
    throw new NoDatasourceUrlError();
  }

  return buildSpreadsheetUrl(urlOrId);
};

export { resolveStudioUrl };
export type { StudioUrlOptions };
