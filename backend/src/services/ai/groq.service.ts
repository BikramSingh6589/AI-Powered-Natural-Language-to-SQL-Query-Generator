import Groq from 'groq-sdk';
import { AppError } from '../../utils/AppError';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const callGroq = async (systemPrompt: string, userPrompt: string) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: process.env.GROQ_MODEL || 'llama3-70b-8192',
      temperature: 0, // 0 for strict query generation
      max_tokens: 1024,
    });

    return chatCompletion.choices[0]?.message?.content || '';
  } catch (error: any) {
    throw new AppError(`Groq API Error: ${error.message}`, 502);
  }
};
