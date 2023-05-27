import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  // apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function createCompletion(prompt) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    temperature: 0,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    stop: ['\n'],
  });

  return response;
}
