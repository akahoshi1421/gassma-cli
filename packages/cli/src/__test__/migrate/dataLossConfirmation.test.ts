import { Readable, Writable } from "stream";
import { describe, expect, it } from "vitest";
import {
  confirmDataLoss,
  findDroppedSheets,
} from "../../migrate/dataLossConfirmation";

const trailWith = (names: string[]): string => `function gassmaMigrate() {
  Gassma.migrateSheets({
    models: [
${names.map((name) => `      { name: "${name}", columns: ["id"] }`).join(",\n")}
    ]
  });
}
`;

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

const answerWith = (answer: string): Readable => Readable.from([answer]);

describe("findDroppedSheets", () => {
  it("should find nothing when there is no recorded migration", () => {
    expect(findDroppedSheets(undefined, ["User"])).toEqual([]);
  });

  it("should find the sheets that the schema no longer defines", () => {
    expect(findDroppedSheets(trailWith(["User", "Memo"]), ["User"])).toEqual([
      "Memo",
    ]);
  });

  it("should keep the recorded order when several sheets are dropped", () => {
    expect(
      findDroppedSheets(trailWith(["Memo", "User", "OldLog"]), ["User"]),
    ).toEqual(["Memo", "OldLog"]);
  });

  it("should find nothing when the schema only added sheets", () => {
    expect(findDroppedSheets(trailWith(["User"]), ["User", "Post"])).toEqual(
      [],
    );
  });

  it("should find nothing when the recorded migration cannot be read", () => {
    expect(findDroppedSheets("function gassmaMigrate( {", ["User"])).toEqual(
      [],
    );
  });
});

describe("confirmDataLoss", () => {
  it("should not ask without acceptDataLoss", async () => {
    const output = createOutput();

    const approved = await confirmDataLoss(
      {
        acceptDataLoss: false,
        previousTrail: trailWith(["User", "Memo"]),
        sheetNames: ["User"],
      },
      { input: answerWith("n\n"), output: output.stream, isTty: true },
    );

    expect(approved).toBe(true);
    expect(output.text()).toBe("");
  });

  it("should not ask when no sheet is dropped", async () => {
    const output = createOutput();

    const approved = await confirmDataLoss(
      {
        acceptDataLoss: true,
        previousTrail: trailWith(["User"]),
        sheetNames: ["User", "Post"],
      },
      { input: answerWith("n\n"), output: output.stream, isTty: true },
    );

    expect(approved).toBe(true);
    expect(output.text()).toBe("");
  });

  it("should not ask when there is no recorded migration", async () => {
    const output = createOutput();

    const approved = await confirmDataLoss(
      { acceptDataLoss: true, previousTrail: undefined, sheetNames: ["User"] },
      { input: answerWith("n\n"), output: output.stream, isTty: true },
    );

    expect(approved).toBe(true);
    expect(output.text()).toBe("");
  });

  it("should name every dropped sheet when asking", async () => {
    const output = createOutput();

    await confirmDataLoss(
      {
        acceptDataLoss: true,
        previousTrail: trailWith(["User", "Memo", "OldLog"]),
        sheetNames: ["User"],
      },
      { input: answerWith("y\n"), output: output.stream, isTty: true },
    );

    expect(output.text()).toContain("Memo");
    expect(output.text()).toContain("OldLog");
    expect(output.text()).not.toContain("User");
  });

  it("should say that the list comes from the recorded migrations, not the spreadsheet", async () => {
    const output = createOutput();

    await confirmDataLoss(
      {
        acceptDataLoss: true,
        previousTrail: trailWith(["User", "Memo"]),
        sheetNames: ["User"],
      },
      { input: answerWith("y\n"), output: output.stream, isTty: true },
    );

    expect(output.text()).toContain("gassma/migrations");
    expect(output.text()).toContain("db push");
  });

  it("should accept a yes answer", async () => {
    const output = createOutput();

    const approved = await confirmDataLoss(
      {
        acceptDataLoss: true,
        previousTrail: trailWith(["User", "Memo"]),
        sheetNames: ["User"],
      },
      { input: answerWith("y\n"), output: output.stream, isTty: true },
    );

    expect(approved).toBe(true);
  });

  it("should accept an uppercase yes answer", async () => {
    const output = createOutput();

    const approved = await confirmDataLoss(
      {
        acceptDataLoss: true,
        previousTrail: trailWith(["User", "Memo"]),
        sheetNames: ["User"],
      },
      { input: answerWith("YES\n"), output: output.stream, isTty: true },
    );

    expect(approved).toBe(true);
  });

  it("should refuse a no answer", async () => {
    const output = createOutput();

    const approved = await confirmDataLoss(
      {
        acceptDataLoss: true,
        previousTrail: trailWith(["User", "Memo"]),
        sheetNames: ["User"],
      },
      { input: answerWith("n\n"), output: output.stream, isTty: true },
    );

    expect(approved).toBe(false);
  });

  it("should refuse an empty answer", async () => {
    const output = createOutput();

    const approved = await confirmDataLoss(
      {
        acceptDataLoss: true,
        previousTrail: trailWith(["User", "Memo"]),
        sheetNames: ["User"],
      },
      { input: answerWith("\n"), output: output.stream, isTty: true },
    );

    expect(approved).toBe(false);
  });

  it("should refuse instead of hanging when stdin is closed", async () => {
    const output = createOutput();

    const approved = await confirmDataLoss(
      {
        acceptDataLoss: true,
        previousTrail: trailWith(["User", "Memo"]),
        sheetNames: ["User"],
      },
      { input: Readable.from([]), output: output.stream, isTty: true },
    );

    expect(approved).toBe(false);
  });

  it("should warn and continue without an interactive terminal", async () => {
    const output = createOutput();

    const approved = await confirmDataLoss(
      {
        acceptDataLoss: true,
        previousTrail: trailWith(["User", "Memo"]),
        sheetNames: ["User"],
      },
      { input: Readable.from([]), output: output.stream, isTty: false },
    );

    expect(approved).toBe(true);
    expect(output.text()).toContain("Memo");
    expect(output.text()).toContain("--accept-data-loss");
    expect(output.text()).toContain("gassma/migrations");
    expect(output.text()).not.toContain("(y/N)");
  });
});
