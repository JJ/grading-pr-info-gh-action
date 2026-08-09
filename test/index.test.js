import { describe, it, expect, vi, beforeEach } from "vitest";

const FILE_NAME = "actividades/actividad-3.md";
const GOOD_LINE = "| Alice | [PR#12](https://github.com/alice/myrepo/pull/12) | v1.2.3 |";

function makeDiff(lines) {
  const body = lines.map((l) => `+${l}`).join("\n");
  return `diff --git a/${FILE_NAME} b/${FILE_NAME}
index e69de29..2b2f0a1 100644
--- a/${FILE_NAME}
+++ b/${FILE_NAME}
@@ -0,0 +1,${lines.length} @@
${body}
`;
}

function makeTwoFileDiff() {
  return `diff --git a/a.md b/a.md
index e69de29..2b2f0a1 100644
--- a/a.md
+++ b/a.md
@@ -0,0 +1 @@
+one
diff --git a/b.md b/b.md
index e69de29..2b2f0a1 100644
--- a/b.md
+++ b/b.md
@@ -0,0 +1 @@
+two
`;
}

function makePrInfo({
  title = "[IV-3] Entrega práctica 3",
  label = "alice:practica-3",
  state = "open",
  milestone = 5,
} = {}) {
  return {
    title,
    head: { label },
    state,
    milestone: milestone == null ? null : { number: milestone },
  };
}

let core;
let octokitRequest;

beforeEach(() => {
  vi.resetModules();
  process.env.GITHUB_TOKEN = "fake-token";

  core = {
    getInput: vi.fn(() => "[IV-"),
    setFailed: vi.fn(),
    info: vi.fn(),
    setOutput: vi.fn(),
    exportVariable: vi.fn(),
  };
  octokitRequest = vi.fn();

  vi.doMock("@actions/core", () => core);
  vi.doMock("@actions/github", () => ({
    context: {
      payload: { pull_request: { diff_url: "https://example.com/pr.diff" } },
    },
    // regular function, not an arrow: src/index.js calls this with `new`
    getOctokit: vi.fn(function () {
      return { request: octokitRequest };
    }),
  }));
});

function failureMessages() {
  return core.setFailed.mock.calls.map((call) => call[0]);
}

describe("action entry point", () => {
  it("fails when more than one file is changed", async () => {
    octokitRequest.mockResolvedValueOnce({ data: makeTwoFileDiff() });

    await import("../src/index.js");

    expect(failureMessages().some((m) => m.includes("❌2❌"))).toBe(true);
    expect(octokitRequest).toHaveBeenCalledTimes(1);
  });

  it("fails when more than one line is changed in the file", async () => {
    octokitRequest.mockResolvedValueOnce({
      data: makeDiff([GOOD_LINE, "another added line"]),
    });

    await import("../src/index.js");

    expect(failureMessages().some((m) => m.includes("❌2❌"))).toBe(true);
    expect(octokitRequest).toHaveBeenCalledTimes(1);
  });

  it("fails when the added line has no PR URL", async () => {
    octokitRequest.mockResolvedValueOnce({
      data: makeDiff(["no url or version here"]),
    });

    await import("../src/index.js");

    expect(
      failureMessages().some((m) => m.includes("debe incluir el URL"))
    ).toBe(true);
    expect(octokitRequest).toHaveBeenCalledTimes(1);
  });

  it("fails when the PR title doesn't start with the required prefix", async () => {
    octokitRequest.mockResolvedValueOnce({ data: makeDiff([GOOD_LINE]) });
    octokitRequest.mockResolvedValueOnce({
      data: makePrInfo({ title: "Sin prefijo" }),
    });

    await import("../src/index.js");

    expect(
      failureMessages().some((m) => m.includes("Sin prefijo"))
    ).toBe(true);
  });

  it("fails when the PR branch is main", async () => {
    octokitRequest.mockResolvedValueOnce({ data: makeDiff([GOOD_LINE]) });
    octokitRequest.mockResolvedValueOnce({
      data: makePrInfo({ label: "main" }),
    });

    await import("../src/index.js");

    expect(
      failureMessages().some((m) => m.includes("no desde main"))
    ).toBe(true);
  });

  it("fails when the PR is not open", async () => {
    octokitRequest.mockResolvedValueOnce({ data: makeDiff([GOOD_LINE]) });
    octokitRequest.mockResolvedValueOnce({
      data: makePrInfo({ state: "closed" }),
    });

    await import("../src/index.js");

    expect(
      failureMessages().some((m) => m.includes("tiene que estar abierto"))
    ).toBe(true);
  });

  it("fails when the added line has no version string", async () => {
    octokitRequest.mockResolvedValueOnce({
      data: makeDiff([
        "| Alice | [PR#12](https://github.com/alice/myrepo/pull/12) |",
      ]),
    });
    octokitRequest.mockResolvedValueOnce({ data: makePrInfo() });

    await import("../src/index.js");

    expect(
      failureMessages().some((m) => m.includes("debe incluir la versión"))
    ).toBe(true);
  });

  it("sets all outputs and never fails on the happy path", async () => {
    octokitRequest.mockResolvedValueOnce({ data: makeDiff([GOOD_LINE]) });
    octokitRequest.mockResolvedValueOnce({ data: makePrInfo() });

    await import("../src/index.js");

    expect(core.setFailed).not.toHaveBeenCalled();

    const outputs = Object.fromEntries(
      core.setOutput.mock.calls.map(([k, v]) => [k, v])
    );
    expect(outputs).toMatchObject({
      file: FILE_NAME,
      objetivo: "3",
      URL: "github.com/alice/myrepo/pull/12",
      user: "alice",
      repo: "myrepo",
      pull_number: "12",
      checkout_repo: "alice/myrepo",
      rama: "practica-3",
      pr_milestone: 5,
      version: "v1.2.3",
    });
    expect(core.exportVariable.mock.calls).toEqual(core.setOutput.mock.calls);
  });

  it("resolves checkout_repo from the PR label when it targets a fork", async () => {
    octokitRequest.mockResolvedValueOnce({ data: makeDiff([GOOD_LINE]) });
    octokitRequest.mockResolvedValueOnce({
      data: makePrInfo({ label: "bob:practica-3" }),
    });

    await import("../src/index.js");

    const outputs = Object.fromEntries(
      core.setOutput.mock.calls.map(([k, v]) => [k, v])
    );
    expect(outputs.checkout_repo).toBe("bob/myrepo");
    expect(outputs.rama).toBe("practica-3");
  });
});
