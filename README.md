# Voccy
- [x] something you want to achieve 
- [x] option + C to check the mark

## User Stories
### You can ask question like this (The answer will be created with ChatGPT API)
`Input: An English sentence, phrase or word.`
- [ ] Rephrase it.
- [ ] How can I say this in English?
- [ ] Does it sound natural?
- [ ] Is it correct in grammar?
- [ ] これはどういう意味、用法が使われてる？

`Input: An English sentence and the specific word or phrase inside. (In case you want to understand how to use a word in a certain context.)`
- [ ] What does this word/phrase mean in this sentence?
  - [ ] give some example sentences that the word/phrase is used in similar way.
- [ ] この文章でのこの単語/連語はどういう意味？

`Input: Some specific situation you face.`
- [ ] こんな時英語でなんて言う？
  - 形容詞での表現の幅が増えたり
  - 同じ事象を表現するのにも引き出しが増える
- [ ] この会話にどう返す？

`Input: New vocabulary or phrase.`
- [ ] Just give you an answer.


### Vocab test
- [ ] User can see vocabs
- [ ] User has a button to see the correct answer.
- [ ] User can submit the result with three options.
  - [ ] Immediate understand
  - [ ] Understand in a min.
  - [ ] Cannot understand.

### Reminder
- [ ] Reminds your vocab test in a certain days after.
- [ ] User can choose how many times in a day to have a set of tests.


### Pronunciation
- [ ] Put instructions how to pronunce it.

### Basic usage
- [ ] User can open a prompt with shortcut keys.
  - [ ] ^ + Space
  - [ ] ^ + ⇧ + Space: With a list of available questions.
  - [ ] ^ + ⌘ + Space: Automatically paste clipboard to the vocabulary section.
- [ ] Put answer when you press
  - [ ] ⌘ + Enter: English
  - [ ] ⌥ + Enter: Japanese
- [ ] Show rephrasing or other example sentences when the user presses [ + ]
- [ ] Submit the vocabulary when you press Command + Shift + Enter.

## Class definitions
- flashcards
  - id
  - question
  - answer
  - last_result
  - result
  - last_test_timestamp


## TODO
- [ ] 画面をどうするか
- [ ] 問題の方式、ただただanswerを隠せばいいのか、逆も用意したほうがいいのか
  - [ ] Vocab - Definitionというのを撤廃してQuestion - Answerの方式にする。
- [ ] caht GPTの質問方法について精度高めていかないと
- [ ] chat GPTへのアクセス方法について、/caht/completionも試してみる
- [ ] max_tokenの数とか
- [ ] play groundで試す
- [ ] インプットの覚え方としてはいいものになりそう、アウトプットが十分にできる？
- [x] クラス構成
- [ ] MVP
  - [x] アプリを開ける
  - [x] 汚くても画面がある
  - [x] 単語を入力、記憶ができる
  - [ ] テスト画面
  - [ ] それぞれのテストについてステータスを記憶できる
- [ ] flashcardsのリストを表示できる
  - [ ] 修正
  - [ ] 削除
- [ ] 名詞を画像と一緒に覚える
- [ ] アウトプットも大事だけどこのアプリで主に担うのはインプットの補助。アウトプット学習は日常から工夫することで補いたい

## MVP
- Basic pages.
- User can input a word.
- It can be stored in a db.
- User can do a test with the word.
- The result will also be stored into db.
- distribute an app with electron-forge

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
