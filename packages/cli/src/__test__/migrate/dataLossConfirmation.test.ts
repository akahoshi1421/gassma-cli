import { Readable, Writable } from "stream";
import { describe, expect, it } from "vitest";
import { decideDataLoss } from "../../migrate/dataLossConfirmation";

const trailWith = (
  models: { name: string; columns: string[] }[],
): string => `function gassmaMigrate() {
  Gassma.migrateSheets({
    models: [
${models
  .map(
    (model) =>
      `      { name: "${model.name}", columns: [${model.columns
        .map((column) => `"${column}"`)
        .join(", ")}] }`,
  )
  .join(",\n")}
    ]
  });
}
`;

const recordedUserAndMemo = trailWith([
  { name: "User", columns: ["id", "age"] },
  { name: "Memo", columns: ["id"] },
]);

const userOnly = [{ name: "User", columns: ["id", "age"] }];

const createOutput = (): { stream: Writable; text: () => string } => {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(String(chunk));
      callback();
    },
  });
  return { stream, text: () => chunks.join("") };
};

const io = (
  answer: string,
  output: Writable,
  isTty: boolean,
): { input: Readable; output: Writable; isTty: boolean } => ({
  input: Readable.from(answer === "" ? [] : [answer]),
  output,
  isTty,
});

describe("decideDataLoss", () => {
  it("should continue without asking when there is no recorded migration", async () => {
    const output = createOutput();

    const outcome = await decideDataLoss(
      { recorded: undefined, models: userOnly },
      io("n\n", output.stream, true),
    );

    expect(outcome).toEqual({ proceed: true, acceptDataLoss: false });
    expect(output.text()).toBe("");
  });

  it("should continue without asking when nothing is dropped", async () => {
    const output = createOutput();

    const outcome = await decideDataLoss(
      { recorded: trailWith(userOnly), models: userOnly },
      io("n\n", output.stream, true),
    );

    expect(outcome).toEqual({ proceed: true, acceptDataLoss: false });
    expect(output.text()).toBe("");
  });

  it("should name every dropped sheet and column when asking", async () => {
    const output = createOutput();

    await decideDataLoss(
      {
        recorded: recordedUserAndMemo,
        models: [{ name: "User", columns: ["id"] }],
      },
      io("y\n", output.stream, true),
    );

    expect(output.text()).toContain('column "age" in sheet "User"');
    expect(output.text()).toContain('sheet "Memo"');
  });

  it("should say that the list comes from the recorded migrations, not the spreadsheet", async () => {
    const output = createOutput();

    await decideDataLoss(
      { recorded: recordedUserAndMemo, models: userOnly },
      io("y\n", output.stream, true),
    );

    expect(output.text()).toContain("gassma/migrations");
    expect(output.text()).toContain("db push");
  });

  it("should accept the deletion when the answer is yes", async () => {
    const output = createOutput();

    const outcome = await decideDataLoss(
      { recorded: recordedUserAndMemo, models: userOnly },
      io("y\n", output.stream, true),
    );

    expect(outcome).toEqual({ proceed: true, acceptDataLoss: true });
  });

  it("should accept an uppercase yes answer", async () => {
    const output = createOutput();

    const outcome = await decideDataLoss(
      { recorded: recordedUserAndMemo, models: userOnly },
      io("YES\n", output.stream, true),
    );

    expect(outcome).toEqual({ proceed: true, acceptDataLoss: true });
  });

  it("should decline when the answer is no", async () => {
    const output = createOutput();

    const outcome = await decideDataLoss(
      { recorded: recordedUserAndMemo, models: userOnly },
      io("n\n", output.stream, true),
    );

    expect(outcome).toEqual({ proceed: false, reason: "declined" });
  });

  it("should decline on an empty answer", async () => {
    const output = createOutput();

    const outcome = await decideDataLoss(
      { recorded: recordedUserAndMemo, models: userOnly },
      io("\n", output.stream, true),
    );

    expect(outcome).toEqual({ proceed: false, reason: "declined" });
  });

  it("should decline instead of hanging when stdin is closed", async () => {
    const output = createOutput();

    const outcome = await decideDataLoss(
      { recorded: recordedUserAndMemo, models: userOnly },
      io("", output.stream, true),
    );

    expect(outcome).toEqual({ proceed: false, reason: "declined" });
  });

  it("should stop without asking when there is no interactive terminal", async () => {
    const output = createOutput();

    const outcome = await decideDataLoss(
      { recorded: recordedUserAndMemo, models: userOnly },
      io("y\n", output.stream, false),
    );

    expect(outcome).toEqual({ proceed: false, reason: "no-terminal" });
    expect(output.text()).toContain('sheet "Memo"');
    expect(output.text()).not.toContain("(y/N)");
  });

  it("should warn and keep the deletion off when the recorded migration cannot be read", async () => {
    const output = createOutput();

    const outcome = await decideDataLoss(
      { recorded: "function gassmaMigrate( {", models: userOnly },
      io("y\n", output.stream, true),
    );

    expect(outcome).toEqual({ proceed: true, acceptDataLoss: false });
    expect(output.text()).toContain("could not be read");
    expect(output.text()).toContain("nothing will be deleted");
    expect(output.text()).not.toContain("(y/N)");
  });

  it("should warn about an unreadable migration without an interactive terminal too", async () => {
    const output = createOutput();

    const outcome = await decideDataLoss(
      { recorded: "function gassmaMigrate( {", models: userOnly },
      io("", output.stream, false),
    );

    expect(outcome).toEqual({ proceed: true, acceptDataLoss: false });
    expect(output.text()).toContain("could not be read");
  });
});
