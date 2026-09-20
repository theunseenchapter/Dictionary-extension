const MAX_CONTEXT_LENGTH = 800;

/** Returns the smallest sentence-like span containing the selected character. */
export function extractSentence(text: string, selectedWord: string, offsetHint = 0): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean || !selectedWord) return "";

  const lower = clean.toLocaleLowerCase();
  let index = lower.indexOf(selectedWord.toLocaleLowerCase(), Math.max(0, offsetHint));
  if (index === -1) index = lower.indexOf(selectedWord.toLocaleLowerCase());
  if (index === -1) return clean.slice(0, MAX_CONTEXT_LENGTH);

  const before = clean.slice(0, index);
  const boundaries = [...before.matchAll(/[.!?]+(?:["'”’)]*)\s+/g)];
  const lastBoundary = boundaries.at(-1);
  const start = lastBoundary?.index === undefined ? 0 : lastBoundary.index + lastBoundary[0].length;
  const after = clean.slice(index);
  const endMatch = /[.!?]+(?:["'”’)]*)?(?=\s|$)/.exec(after);
  const end = endMatch?.index === undefined ? clean.length : index + endMatch.index + endMatch[0].length;
  const sentence = clean.slice(start, end).trim();
  return sentence.length <= MAX_CONTEXT_LENGTH ? sentence : sentence.slice(0, MAX_CONTEXT_LENGTH - 1).trimEnd() + "…";
}

function nearestTextContainer(node: Node): Element | null {
  const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
  return element?.closest("p, li, blockquote, dd, dt, td, th, article, section, main, div") ?? element ?? null;
}

export function contextFromSelection(range: Range, word: string): string {
  const container = nearestTextContainer(range.commonAncestorContainer);
  const text = container?.textContent ?? range.commonAncestorContainer.textContent ?? "";
  const before = range.cloneRange();
  before.selectNodeContents(container ?? range.commonAncestorContainer);
  before.setEnd(range.startContainer, range.startOffset);
  return extractSentence(text, word, before.toString().replace(/\s+/g, " ").length);
}
