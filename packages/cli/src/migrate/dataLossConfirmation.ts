import readline from "readline";
import { readTrailSheetNames } from "./readTrailSheetNames";

type DataLossIo = {
  input: NodeJS.ReadableStream;
  output: NodeJS.WritableStream;
  isTty: boolean;
};

type DataLossRequest = {
  acceptDataLoss: boolean;
  previousTrail: string | undefined;
  sheetNames: string[];
};

const findDroppedSheets = (
  previousTrail: string | undefined,
  sheetNames: string[],
): string[] => {
  if (previousTrail === undefined) return [];

  const recorded = readTrailSheetNames(previousTrail);
  if (recorded === undefined) return [];

  const kept = new Set(sheetNames);
  return recorded.filter((name) => !kept.has(name));
};

const buildWarning = (dropped: string[]): string =>
  [
    "\n⚠️ The following sheets are recorded in gassma/migrations but are no longer in your schema:",
    ...dropped.map((name) => `    • ${name}`),
    '  Running "gassmaMigrate" will delete them together with every row they hold.',
    "  This is based on the recorded migrations, not on the spreadsheet itself:",
    '  sheets changed by "gassma db push" or by hand are not reflected here.',
    "",
  ].join("\n");

const isYes = (answer: string): boolean =>
  ["y", "yes"].includes(answer.trim().toLowerCase());

const askYesNo = (io: DataLossIo): Promise<boolean> =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: io.input, output: io.output });
    rl.once("line", (answer) => {
      resolve(isYes(answer));
      rl.close();
      io.input.pause();
    });
    rl.once("close", () => resolve(false));
    io.output.write("Continue? (y/N) ");
  });

const confirmDataLoss = async (
  request: DataLossRequest,
  io: DataLossIo,
): Promise<boolean> => {
  if (!request.acceptDataLoss) return true;

  const dropped = findDroppedSheets(request.previousTrail, request.sheetNames);
  if (dropped.length === 0) return true;

  io.output.write(buildWarning(dropped));
  if (io.isTty) return askYesNo(io);

  io.output.write(
    "No interactive terminal detected; continuing because --accept-data-loss was given.\n",
  );
  return true;
};

export { confirmDataLoss, findDroppedSheets };
export type { DataLossIo, DataLossRequest };
