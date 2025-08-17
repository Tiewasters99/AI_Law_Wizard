export type Chunk = {
    fileId: string;
    chunkIndex: number;
    text: string;
  };
  
  export function chunkTextWithOverlap(
    fileId: string,
    fullText: string,
    maxChars = 2000,
    overlap = 200
  ): Chunk[] {
    const chunks: Chunk[] = [];
    let i = 0;
    let idx = 0;
  
    while (i < fullText.length) {
      const start = Math.max(0, i - (idx ? overlap : 0));
      const end = Math.min(fullText.length, start + maxChars);
      chunks.push({ fileId, chunkIndex: idx++, text: fullText.slice(start, end) });
      i = end;
    }
    return chunks;
  }
  
  export function recomposeFromChunks(ordered: Chunk[], overlap = 200): string {
    if (!ordered.length) return "";
    let out = ordered[0].text;
    for (let i = 1; i < ordered.length; i++) out += ordered[i].text.slice(overlap);
    return out;
  }
  