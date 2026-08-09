import { describe, it, expect, vi } from "vitest";
import {
  get_diff,
  get_pull_info,
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

    expect(octokit.request).toHaveBeenCalledWith("https://example.com/pr.diff");
    expect(files).toHaveLength(1);
    expect(files[0].from).toBe("actividades/actividad-3.md");
    expect(files[0].additions).toBe(1);
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
