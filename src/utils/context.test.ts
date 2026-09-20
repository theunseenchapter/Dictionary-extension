import { describe, expect, it } from "vitest";
import { extractSentence } from "./context";
import { normaliseWord } from "./word";

describe("extractSentence", () => {
  it("extracts a simple sentence", () => expect(extractSentence("The quick brown fox jumps over the lazy dog.", "brown")).toBe("The quick brown fox jumps over the lazy dog."));
  it("chooses the sentence containing the selected word", () => expect(extractSentence("First sentence. The word ephemeral appears here. Another sentence.", "ephemeral")).toBe("The word ephemeral appears here."));
  it("supports punctuation and hyphenated words", () => expect(extractSentence("A state-of-the-art tool changed everything.", "state-of-the-art")).toBe("A state-of-the-art tool changed everything."));
});

describe("normaliseWord", () => {
  it("accepts regular, contracted, and hyphenated words", () => { expect(normaliseWord("ephemeral,")).toBe("ephemeral"); expect(normaliseWord("don't")).toBe("don't"); expect(normaliseWord("state-of-the-art")).toBe("state-of-the-art"); });
  it("rejects empty and URL-like selections", () => { expect(normaliseWord(" ")).toBeNull(); expect(normaliseWord("https://example.com")).toBeNull(); });
});
