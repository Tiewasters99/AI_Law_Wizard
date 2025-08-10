import { OpenAIEmbeddings } from '@langchain/openai';
import {Pinecone} from  '@pinecone-database/pinecone';

const pine  = new Pinecone({
    apiKey: process.env.PINE_CONE_API_KEY ?? 'api-key',
});


const pineIndex = pine.index('ai-wizard-open-ai');

const openapi = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPEN_API_KEY ?? 'api-key',
    modelName: 'text-embedding-3-small',
});

export {pineIndex, pine, openapi};