import { ChatXAI,  } from "@langchain/xai"; // replace with your real Grok client
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const grok = new ChatXAI({
    apiKey: process.env.GROK_API_KEY,
    model: 'grok-4',
    maxTokens: 4000,
    temperature: 0.3
  })

 
export type Patch = { fileId: string; chunkIndex: number; replacement: string };

export async function grokPatches(
  task: string,
  fileId: string,
  indices: number[],
  mergedTaggedText: string
): Promise<Patch[]> {
  const system = `You are a precise document editor.
- Modify only what the task requires.
- Keep unrelated text unchanged.
- Chunks are marked as [[CHUNK N]].
- Return ONLY JSON: [{"fileId":"...","chunkIndex":N,"replacement":"..."}]`;

  const user = `
Task:
${task}

Target file: ${fileId}

Context (adjacent chunks included):
${mergedTaggedText}

Return strictly JSON array.
`;

const messages = [
    new SystemMessage(system),
    new HumanMessage(user)
  ]

  const response = await grok.invoke(messages)
  const txt = response.content.toString().trim();
  console.log(txt);
  return JSON.parse(txt);
}
