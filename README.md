# Voccy
- [x] something you want to achieve 
- [x] option + C to check the mark

## User Stories
### You can ask question like this (The answer will be created with ChatGPT API)
`Input: An English phrase or word.`
- [x] All in one:
  - [x] Rephrase it.
  - [x] Give some example sentences
- [x] definition


`Input: An English sentence`
- [x] All in one
  - [x] Does it sound natural?
  - [x] Is it correct in grammar?
  - [x] Rephrase it.

- [ ] これはどういう意味、用法が使われてる？ respond in
  - [ ] English
  - [ ] Japanese


`Input: A Japanese sentence, phrase or word.`
- [x] How can I say this in English?

`Input: An English sentence and the specific word or phrase inside. (In case you want to understand how to use a word in a certain context.)`
- [ ] What does this word/phrase mean in this sentence?
  - [ ] give some example sentences that the word/phrase is used in similar way.
- [ ] この文章でのこの単語/連語はどういう意味？
  - [ ] その他の例文

`Input: Some specific situation you face.`
- [x] こんな時英語でなんて言う？
  - 形容詞での表現の幅が増えたり
  - 同じ事象を表現するのにも引き出しが増える
- [ ] この会話にどう返す？

`Input: New vocabulary or phrase.`
- [ ] Just give you an answer.


### Vocab test
- [x] User can see vocabs
- [x] User has a button to see the correct answer.
- [x] User can submit the result with three options.
  - [x] Immediate understand
  - [x] Understand in a min.
  - [x] Cannot understand.

### Reminder
- [x] Reminds your vocab test in a certain days after.
- [x] User can choose how many times in a day to have a set of tests.


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

- [x] when you open the app (app.ready)
  - [x] create flashcards
  - [x] create settings
  - [x] insert first settings value
  - [x] set process.env
  - [ ] create test_records
  - [ ] create quota_failures
- [x] when you add a new vocab
  - [x] insert QnA
  - [x] update the scheduled test timestamp
- [ ] when you change the settings
  - [x] update settings
  - [x] set process.env
  - [x] update all the scheduled test timestamp
- [x] when you open the flashcards test
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
- [ ] when you open the list of flashcards and settings (open config)
  - [x] show
  - [x] delete
  - [x] update

## TODO
- [x] 画面をどうするか
- [x] 問題の方式、ただただanswerを隠せばいいのか、逆も用意したほうがいいのか
  - [x] Vocab - Definitionというのを撤廃してQuestion - Answerの方式にする。
- [x] caht GPTの質問方法について精度高めていかないと
- [x] chat GPTへのアクセス方法について、/caht/completionも試してみる
- [x] max_tokenの数とか
- [x] play groundで試す
- [x] インプットの覚え方としてはいいものになりそう、アウトプットが十分にできる？
- [x] クラス構成
- [x] MVP
  - [x] アプリを開ける
  - [x] 汚くても画面がある
  - [x] 単語を入力、記憶ができる
  - [x] テスト画面
  - [x] それぞれのテストについてステータスを記憶できる
  - [x] chatGPTの翻訳を最低限
- [x] doneのステータス
- [x] getQuizzes関数で今テストするべきものを取り出す
- [x] アウトプットも大事だけどこのアプリで主に担うのはインプットの補助。アウトプット学習は日常から工夫することで補いたい
- [x] reminder時間を計算する関数
  - [x] configがアップデートされる度に呼び出す
  - [ ] 時間トリガーも変更する
- [ ] 時間でトリガー発生させる
- [ ] 名詞を画像と一緒に覚える
- [ ] どのくらいやったかの記録、時間帯の判定
- [ ] ノルマクリアのステータス
  - [ ] 通知と同時にその時間をバツにする
  - [ ] バツが複数ある時に警告（スキップorやる）
  - [ ] doneと同時にノルマステータスを削除
  - [ ] Congratulationsにいつの分が終わったのが記載する
- [ ] dbの一括操作
- [ ] flashcardsのリストを表示できる
  - [ ] 修正
  - [ ] 削除
  - [ ] テストする機能
- [ ] カード学習で戻る機能
- [ ] 発音記号
- [ ] 音声
- [ ] 品詞の指定　
- [ ] 初期のチュートリアル値の設定
- [ ] ショートカットキーの実装
- [ ] 回答後のエフェクト

- [x] download the app, initialize
- [ ] update settings
- [x] put some words
- [x] do a test
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

Python ver 2 is no longer supported by mac os
```
nvm use 16
which python
export PYTHON_PATH=/Library/Frameworks/Python.framework/Versions/2.7/bin/python
npm run electron:build
```
### When build/distribution
add self sign
`export CSC_NAME=VOCCY_SELF_SIGN`