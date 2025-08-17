import { chunkTextWithOverlap, recomposeFromChunks } from "./chunking";

export function applyPatchesToFull(
  fileId: string,
  fullText: string,
  patches: { chunkIndex: number; replacement: string }[],
  maxChars = 2000,
  overlap = 200
) {
  const chunks = chunkTextWithOverlap(fileId, fullText, maxChars, overlap);
  const map = new Map<number, string>();
  for (const p of patches) map.set(p.chunkIndex, p.replacement);

  const edited = chunks.map((c) =>
    map.has(c.chunkIndex) ? { ...c, text: map.get(c.chunkIndex)! } : c
  );
  return recomposeFromChunks(edited, overlap);
}
