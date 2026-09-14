import { describe, it, expect, vi } from "vitest";
import {
  get_diff,
  get_diff_chunks_changes,
  get_pull_info,
  ghRepoRegex,
  set_vars,
  all_good,
  sorry,
} from "../src/grading.js";

const ONE_FILE_DIFF = `diff --git a/actividades/actividad-3.md b/actividades/actividad-3.md
index e69de29..2b2f0a1 100644
--- a/actividades/actividad-3.md
+++ b/actividades/actividad-3.md
@@ -0,0 +1 @@
+| Alice | [PR#12](https://github.com/alice/myrepo/pull/12) | v1.2.3 |
`;

const ONE_FILE_ARROW_UP = `diff --git a/proyectos/objetivo-0.md b/proyectos/objetivo-0.md
index cb74908..37e3a1d 100644
--- a/proyectos/objetivo-0.md
+++ b/proyectos/objetivo-0.md
@@ -8,4 +8,4 @@ iniciales.

 | URL                                        | Versión | Alcanzado |
 |--------------------------------------------|---------|-----------|
-| https://github.com/JJ/dummy-IV/pull/11     | v0.0.3  ||
+| https://github.com/JJ/dummy-IV/pull/11     | v0.0.2  ||
`;

const TWO_FILE_DIFF = `diff --git a/a.md b/a.md
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

describe("get_diff", () => {
  it("fetches the PR diff URL and parses it into files", async () => {
    const octokit = { request: vi.fn().mockResolvedValue({ data: ONE_FILE_DIFF }) };
    const context = {
      payload: { pull_request: { diff_url: "https://example.com/pr.diff" } },
    };

    const files = await get_diff(context, octokit);
    console.log(files[0].chunks[0].changes);
    const changes = get_diff_chunks_changes(files[0].chunks[0].changes);
    expect(ghRepoRegex.exec(changes.added)).toBeTruthy();
    expect(ghRepoRegex.exec(changes.deleted)).toBeFalsy();
    expect(octokit.request).toHaveBeenCalledWith("https://example.com/pr.diff");
    expect(files).toHaveLength(1);
    expect(files[0].from).toBe("actividades/actividad-3.md");
    expect(files[0].additions).toBe(1);
  });

  it("fetches the PR diff URL and parses it into files", async () => {
    const octokit = {
      request: vi.fn().mockResolvedValue({ data: ONE_FILE_ARROW_UP }),
    };
    const context = {
      payload: { pull_request: { diff_url: "https://example.com/pr.diff" } },
    };

    const files = await get_diff(context, octokit);
    console.log(files[0].chunks[0].changes);
    expect(files).toHaveLength(1);
    expect(files[0].from).toBe("proyectos/objetivo-0.md");
    expect(files[0].additions).toBe(1);

    const changes = get_diff_chunks_changes(files[0].chunks[0].changes);
    expect(ghRepoRegex.exec(changes.added)).toBeTruthy();
    expect(ghRepoRegex.exec(changes.deleted)).toBeTruthy();
  });

  it("parses diffs touching multiple files", async () => {
    const octokit = { request: vi.fn().mockResolvedValue({ data: TWO_FILE_DIFF }) };
    const context = { payload: { pull_request: { diff_url: "https://example.com/pr.diff" } } };

    const files = await get_diff(context, octokit);

    expect(files).toHaveLength(2);
  });
});

describe("get_pull_info", () => {
  it("requests the pull URL and normalizes the response", async () => {
    const octokit = {
      request: vi.fn().mockResolvedValue({
        data: {
          title: "[IV-3] Entrega práctica 3",
          head: { label: "alice:practica-3" },
          state: "open",
          milestone: { number: 5 },
        },
      }),
    };

    const info = await get_pull_info(octokit, "alice", "myrepo", "12");

    expect(octokit.request).toHaveBeenCalledWith(
      "https://api.github.com/repos/alice/myrepo/pulls/12"
    );
    expect(info).toEqual({
      label: "alice:practica-3",
      state: "open",
      milestone_number: 5,
      pr_title: "[IV-3] Entrega práctica 3",
    });
  });

  it("leaves milestone_number undefined when there is no milestone", async () => {
    const octokit = {
      request: vi.fn().mockResolvedValue({
        data: { title: "t", head: { label: "main" }, state: "open", milestone: null },
      }),
    };

    const info = await get_pull_info(octokit, "alice", "myrepo", "12");

    expect(info.milestone_number).toBeUndefined();
  });
});

describe("set_vars", () => {
  it("both sets the output and exports the variable", () => {
    const core = { setOutput: vi.fn(), exportVariable: vi.fn() };

    set_vars(core, "rama", "practica-3");

    expect(core.setOutput).toHaveBeenCalledWith("rama", "practica-3");
    expect(core.exportVariable).toHaveBeenCalledWith("rama", "practica-3");
  });
});

describe("message helpers", () => {
  it("all_good decorates a success message", () => {
    expect(all_good("todo bien")).toBe("✅🍊️‍🔥 todo bien");
  });

  it("sorry decorates a failure message", () => {
    expect(sorry("algo falló")).toBe("🍋💥❌ algo falló");
  });
});
