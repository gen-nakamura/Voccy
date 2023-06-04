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

## DB definitions
- flashcards
  - id
  - question
  - answer
  - previous_result
  - latest_result
  - latest_test_timestamp
  - scheduled_test_timestamp

- settings
  - id
  - remind_times
  - remind_nums
  - max_test_nums

- test_records
  - time

- quota_failures
  - time

- [ ] when you open the app (app.ready)
  - [x] create flashcards
  - [x] create settings
  - [x] insert first settings value
  - [x] set process.env
  - [ ] create test_records
  - [ ] create quota_failures
- [ ] when you add a new vocab
  - [x] insert QnA
  - [x] update the scheduled test timestamp
- [ ] when you change the settings
  - [x] update settings
  - [x] set process.env
  - [x] update all the scheduled test timestamp
- [ ] when you open the flashcards test
  - [ ] show quota_failures
  - [x] get quizsets
- [ ] when you take the flashcards test
  - [x] record status
  - [x] update the scheduled test timestamp
  - [ ] record the time you did
- [ ] when you've done all the flashcards test
  - [ ] delete the time of quota_failures
- [ ] when the app notifies you about the test schedule
  - [ ] add time to quota_failures 
- [ ] when you open the list of flashcards
  - [x] show
  - [x] delete
  - [x] update
- [ ] when you update the schedule test time


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
  - [x] テスト画面
  - [ ] それぞれのテストについてステータスを記憶できる
  - [ ] chatGPTの翻訳を最低限
- [ ] flashcardsのリストを表示できる
  - [ ] 修正
  - [ ] 削除
  - [ ] テストする機能
- [ ] dbの一括操作
- [ ] getQuizzes関数で今テストするべきものを取り出す
- [ ] これらを時間でトリガー発生させる
- [ ] reminder時間を計算する関数
  - [ ] configがアップデートされる度に呼び出す
  - [ ] 時間トリガーも変更する
- [ ] 名詞を画像と一緒に覚える
- [ ] どのくらいやったかの記録、時間帯の判定
- [ ] アウトプットも大事だけどこのアプリで主に担うのはインプットの補助。アウトプット学習は日常から工夫することで補いたい
- [ ] ノルマクリアのステータス
  - [ ] 通知と同時にその時間をバツにする
  - [ ] バツが複数ある時に警告（スキップorやる）
  - [ ] doneと同時にノルマステータスを削除
  - [ ] Congratulationsにいつの分が終わったのが記載する
- [ ] doneのステータス

- [ ] download the app, initialize
- [ ] update settings
- [ ] put some words
- [ ] do a test
- [ ] edit some words
- [ ] delete some words

- create F table
- insert, update, delete F records
- create S table
- update S record
- read all the F records
- read the F records with some conditions
- change status of a record

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
