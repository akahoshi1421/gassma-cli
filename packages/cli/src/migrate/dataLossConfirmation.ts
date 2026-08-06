import readline from "readline";
import type { MigrateModelDefinition } from "./buildMigrateModels";
import { findDrops } from "./findDrops";
import type { Drop } from "./findDrops";
import { readTrailDefinition } from "./readTrailDefinition";

type DataLossIo = {
  input: NodeJS.ReadableStream;
  output: NodeJS.WritableStream;
  isTty: boolean;
};

type DataLossRequest = {
  recorded: string | undefined;
  models: MigrateModelDefinition[];
};

type DataLossOutcome =
  | { proceed: true; acceptDataLoss: boolean }
  | { proceed: false; reason: "declined" | "no-terminal" };

const CONTINUE_WITHOUT_DELETION: DataLossOutcome = {
  proceed: true,
  acceptDataLoss: false,
};

const describeDrop = (drop: Drop): string =>
  drop.kind === "sheet"
    ? `    • sheet "${drop.sheet}"`
    : `    • column "${drop.column}" in sheet "${drop.sheet}"`;

const buildDropReport = (drops: Drop[]): string =>
  [
    "\n⚠️ The following are recorded in gassma/migrations but are no longer in your schema:",
    ...drops.map(describeDrop),
    "  Generating this migration deletes them together with every value they hold.",
    "  This is based on the recorded migrations, not on the spreadsheet itself:",
    '  sheets and columns changed by "gassma db push" or by hand are not reflected here.',
    "",
  ].join("\n");

const UNREADABLE_REPORT = [
  "\n⚠️ The latest migration in gassma/migrations could not be read,",
  "  so deleted sheets and columns could not be checked.",
  "  This migration is generated without deletion: nothing will be deleted.",
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

const decideDataLoss = async (
  request: DataLossRequest,
  io: DataLossIo,
): Promise<DataLossOutcome> => {
  if (request.recorded === undefined) return CONTINUE_WITHOUT_DELETION;

  const recorded = readTrailDefinition(request.recorded);
  if (recorded === undefined) {
    io.output.write(UNREADABLE_REPORT);
    return CONTINUE_WITHOUT_DELETION;
  }

  const drops = findDrops(recorded, request.models);
  if (drops.length === 0) return CONTINUE_WITHOUT_DELETION;

  io.output.write(buildDropReport(drops));
  if (!io.isTty) return { proceed: false, reason: "no-terminal" };

  const approved = await askYesNo(io);
  return approved
    ? { proceed: true, acceptDataLoss: true }
    : { proceed: false, reason: "declined" };
};

export { decideDataLoss };
export type { DataLossIo, DataLossOutcome, DataLossRequest };
