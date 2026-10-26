// UX spec §6: text contrast is at least 4.5:1, using the named colour tokens.
import { describe, expect, it } from "vitest";
import { colors } from "@/lib/theme/tokens";
import { contrastRatio } from "@/lib/theme/contrast";

describe("S1 colour contrast", () => {
  it("S1 contrast calculator matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
    expect(contrastRatio("#777777", "#FFFFFF")).toBeCloseTo(4.48, 1);
  });

  const pairs: Array<[string, keyof typeof colors, keyof typeof colors]> = [
    ["body text on surface", "ink", "surface"],
    ["body text on page background", "ink", "paper"],
    ["secondary text on surface", "inkMuted", "surface"],
    ["secondary text on page background", "inkMuted", "paper"],
    ["button text on accent", "onAccent", "accent"],
    ["accent text on surface", "accent", "surface"],
  ];
  for (const [label, fg, bg] of pairs) {
    it(`S1 ${label} is at least 4.5:1`, () => {
      expect(contrastRatio(colors[fg], colors[bg])).toBeGreaterThanOrEqual(4.5);
    });
  }
});
