import { createXai } from '@ai-sdk/xai';
import { createGroq } from '@ai-sdk/groq';
import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from 'ai';
import { XAI_API_KEY, GROQ_API_KEY } from '$env/static/private';

const xai = createXai({ apiKey: XAI_API_KEY });
const groq = createGroq({ apiKey: GROQ_API_KEY });

export const myProvider = customProvider({
	languageModels: {
		'chat-model': groq('llama-3.3-70b-versatile'),
		'chat-model-reasoning': wrapLanguageModel({
			model: groq('deepseek-r1-distill-llama-70b'),
			middleware: extractReasoningMiddleware({ tagName: 'think' })
		}),
		'title-model': groq('llama-3.1-8b-instant'),
		'artifact-model': groq('llama-3.3-70b-versatile')
	},
	imageModels: {
		'small-model': xai.image('grok-2-image')
	}
});
