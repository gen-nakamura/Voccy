import axios from 'axios'

const new_word =
`Provide a brief definition of the phrase or word.
Show whether the one is used in formal, real-life conversation or both situations.
Give 2 example sentences which are shorter than 20 words used in the situation above. If used in both situations, the example sentences would be 2 each, 4 in total.
Then provide the 2 most frequently used expressions that can be used instead; Rephrasing.
All the responses should be provided in the format shown with the back quote below.
format: \`
Definition: A BRIEF DEFINITION

Use: [formal, real-life conversation, both] ONE OF THESE

formal: 
• EXAMPLE SENTENCE 1
• EXAMPLE SENTENCE 2

real-life conversation:
• EXAMPLE SENTENCE 3
• EXAMPLE SENTENCE 4
(Be sure that you don't always need to provide 4 sentences.)

Rephrasing: 
• REPHRASE WORD/PHRASE 1
• REPHRASE WORD/PHRASE 2
\`
The phrase or word: `

const word_usage =
`Provide the 3 most frequently used expressions that can be used instead; Rephrasing.
Give 3 example sentences shorter than 20 words by using the rephrased word and the original word.
All the responses should be provided in the format shown with the back quote below.
format: \`
Rephrasing: 
• REPHRASE WORD/PHRASE 1
• REPHRASE WORD/PHRASE 2
• REPHRASE WORD/PHRASE 3

Examples:
• EXAMPLE SENTENCE 1
• EXAMPLE SENTENCE 2
• EXAMPLE SENTENCE 3
• EXAMPLE SENTENCE WITH THE ORIGINAL WORD
\`
The phrase or word: `

const sentence_rephrase =
`Make sure the provided sentence is correct in grammar.
Also, make sure the provided sentence is an expression commonly used by native speakers.
If it has any problems above, show the improved sentence, fluent and grammarly correct.
Then provide the 2 rephrased sentences.
All the responses should be provided in the format shown with the back quote below.
format: \`
Grammar: [Good, Needs to be improved] ONE OF THESE
Fluency: [Fluent, Sounds natural, formal, casual, a bit weird, childish, etc...]

Correct sentence:
SHOW IMPROVED SENTENCE (Be sure that you can skip this section if the given sentence is correct.)

Rephrasing: 
• REPHRASE SENTENCE 1
• REPHRASE SENTENCE 2
\`
The sentence: `

const in_english =
`How can I say this Japanese sentence in English?
Give 3 example sentences shorter than 50 words.
All the responses should be provided in the format shown with the back quote below.
format: \`
Examples:
• EXAMPLE SENTENCE 1
• EXAMPLE SENTENCE 2
• EXAMPLE SENTENCE 3
\`
The sentence: `

const if_native =
`What would English native speakers say in the situation given in Japanese? 
Give 3 example sentences shorter than 50 words.
All the responses should be provided in the format shown with the back quote below.
format: \`
Examples:
• EXAMPLE SENTENCE 1
• EXAMPLE SENTENCE 2
• EXAMPLE SENTENCE 3
\`
The situation: `

const http = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.VUE_APP_OPENAI_API_KEY}`,
    'OpenAI-Organization': process.env.VUE_APP_ORGANIZATION_ID,
  }
});

export async function createCompletion(option, prompt) {
  try {
    console.log("inside try");
    const res = await http.post('/completions', {
      "model": "text-davinci-003",
      "prompt": createChatGPTCommand(option, prompt),
      "temperature": 0,
      "max_tokens": 150
    })
    console.log(res);
    const text = res.data.choices[0].text;
    console.log(text);
    return text;
  } catch (error) {
    console.log(error);
  }
}

function createChatGPTCommand(option, prompt) {
  if (option === 'new_word') return new_word+`"${prompt}"`;
  else if (option === 'word_usage') return word_usage+`"${prompt}"`;
  else if (option === 'sentence_rephrase') return sentence_rephrase+`"${prompt}"`;
  else if (option === 'これは英語で？') return in_english+`"${prompt}"`;
  else if (option === 'if_native') return if_native+`"${prompt}"`;
  else return null;
}
