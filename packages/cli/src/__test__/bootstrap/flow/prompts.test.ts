import * as clack from "@clack/prompts";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BootstrapCancelledError,
  createAutoPrompter,
  createClackPrompter,
} from "../../../bootstrap/flow/prompts";

vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  note: vi.fn(),
  text: vi.fn(),
  confirm: vi.fn(),
  select: vi.fn(),
  isCancel: (value: unknown): value is symbol => typeof value === "symbol",
  log: { info: vi.fn(), warn: vi.fn() },
}));

describe("createAutoPrompter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should answer prompts with the default values", async () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    const prompter = createAutoPrompter();

    await expect(prompter.text("Title?", "my-app")).resolves.toBe("my-app");
    await expect(prompter.confirm("Sheets?", true)).resolves.toBe(true);
    await expect(
      prompter.select(
        "Style?",
        [
          { value: "export", label: "export" },
          { value: "global", label: "global" },
        ],
        "export",
      ),
    ).resolves.toBe("export");
  });

  it("should echo questions and chosen defaults", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const prompter = createAutoPrompter();

    await prompter.text("Project title?", "my-app");
    await prompter.confirm("Install?", false);

    expect(log).toHaveBeenCalledWith(expect.stringContaining("Project title?"));
    expect(log).toHaveBeenCalledWith(expect.stringContaining("no"));
  });
});

describe("createClackPrompter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should unwrap normal answers", async () => {
    vi.mocked(clack.text).mockResolvedValue("Answered");
    vi.mocked(clack.confirm).mockResolvedValue(false);
    const prompter = createClackPrompter();

    await expect(prompter.text("Title?", "fallback")).resolves.toBe("Answered");
    await expect(prompter.confirm("Sheets?", true)).resolves.toBe(false);
  });

  it("should pass default values to clack", async () => {
    vi.mocked(clack.text).mockResolvedValue("x");
    vi.mocked(clack.confirm).mockResolvedValue(true);
    const prompter = createClackPrompter();

    await prompter.text("Title?", "my-default");
    await prompter.confirm("Sheets?", true);

    expect(clack.text).toHaveBeenCalledWith(
      expect.objectContaining({ defaultValue: "my-default" }),
    );
    expect(clack.confirm).toHaveBeenCalledWith(
      expect.objectContaining({ initialValue: true }),
    );
  });

  it("should throw BootstrapCancelledError when the user cancels", async () => {
    vi.mocked(clack.text).mockResolvedValue(Symbol("cancel"));
    const prompter = createClackPrompter();

    await expect(prompter.text("Title?", "d")).rejects.toBeInstanceOf(
      BootstrapCancelledError,
    );
  });

  it("should forward select choices and initial value", async () => {
    vi.mocked(clack.select).mockResolvedValue("global");
    const prompter = createClackPrompter();

    const choices = [
      { value: "export", label: "export style" },
      { value: "global", label: "global style" },
    ];
    const result = await prompter.select("Style?", choices, "export");

    expect(result).toBe("global");
    expect(clack.select).toHaveBeenCalledWith(
      expect.objectContaining({ options: choices, initialValue: "export" }),
    );
  });
});

describe("createDryRunPrompter", () => {
  it("should prefix info and warn messages with [dry-run]", async () => {
    const { createDryRunPrompter } = await import(
      "../../../bootstrap/flow/prompts"
    );
    const infos: string[] = [];
    const warns: string[] = [];
    const base = createAutoPrompter();
    const prompter = createDryRunPrompter({
      ...base,
      info: (message: string) => {
        infos.push(message);
      },
      warn: (message: string) => {
        warns.push(message);
      },
    });

    prompter.info("Created package.json");
    prompter.warn("Something failed.");

    expect(infos).toEqual(["[dry-run] Created package.json"]);
    expect(warns).toEqual(["[dry-run] Something failed."]);
  });
});
