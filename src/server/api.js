// import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios'

const http = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.VUE_APP_OPENAI_API_KEY}`,
    'OpenAI-Organization': process.env.VUE_APP_ORGANIZATION_ID,
  }
});

export async function createCompletion(prompt) {
  try {
    console.log("inside try");
    const res = await http.post('/completions', {
      "model": "text-davinci-003",
      "prompt": prompt,
      "temperature": 1.5,
      "max_tokens": 300
    })
    console.log(res);
    // res.value = response.data.choices[0].message.content
    console.log(res.data.choices[0].text);
  } catch (error) {
    console.log(error);
  }
}
