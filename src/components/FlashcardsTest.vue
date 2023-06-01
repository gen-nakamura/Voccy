<template>
  <div class="test-container">
    <div class="question-container">
      <h1>{{ currentQuestion }}</h1>
      <button @click="showAnswer">答え</button>
      <div v-if="showingAnswer" class="answer-container">
        <h2>{{ currentAnswer }}</h2>
      </div>
    </div>
    <div class="choices-container">
      <button @click="submitAnswer(false)">×</button>
      <button @click="submitAnswer(true)">○</button>
      <button @click="submitAnswer(true, true)">◎</button>
    </div>
  </div>
</template>

<script>
// import axios from 'axios';

export default {
  data() {
    return {
      currentQuestion: 'Sample Question',
      currentAnswer: 'Sample Answer',
      showingAnswer: false
    };
  },
  mounted() {
    this.getQuestion();
  },
  methods: {
    getQuestion() {
      // axios.get('/api/question')
      //   .then(response => {
      //     this.currentQuestion = response.data.question;
      //     this.currentAnswer = response.data.answer;
      //     this.showingAnswer = false;
      //   })
      //   .catch(error => {
      //     console.error('Error getting question:', error);
      //   });
    },
    showAnswer() {
      this.showingAnswer = !this.showingAnswer;
    },
    submitAnswer(isCorrect, isPerfect = false) {
      // フロントエンドからサーバーサイドに回答を送信するロジックを追加する
      // isCorrect: 正解かどうか（true/false）
      // isPerfect: 完全正解かどうか（true/false）
      // サーバーサイドのAPIエンドポイントにリクエストを送信し、回答を保存する
      // 例：axios.post('/api/answer', { isCorrect, isPerfect })
      console.log(isCorrect, isPerfect);

      // 新しい問題を取得する
      this.getQuestion();
    }
  }
};
</script>

<style scoped>
.test-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.question-container {
  margin-top: 20px;
  text-align: center;
}

.answer-container {
  margin-top: 20px;
}

.choices-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

button {
  margin: 0 10px;
  padding: 10px 20px;
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
