<template>
  <div class="test-container">
    <div class="card-container">
      <div class="card">
        <div class="card-content">
          <h1 class="question">{{ currentQuestion }}</h1>
          <div v-if="showingAnswer" class="answer-container">
            <h2 class="answer">{{ currentAnswer }}</h2>
          </div>
        </div>
      </div>
    </div>
    <!-- <button @click="showAnswer" class="answer-button">答え</button> -->
    <div class="choices-container">
      <button @click="submitAnswer(false)" class="choice-button wrong"><i class="fas fa-times fa-2x fa-fw" aria-hidden="true"></i></button>
      <button @click="submitAnswer(true)" class="choice-button correct"><i class="far fa-circle fa-2x fa-fw" aria-hidden="true"></i></button>
      <button @click="submitAnswer(true, true)" class="choice-button correct"><i class="fas fa-check-circle fa-2x fa-fw" aria-hidden="true"></i></button>
    </div>
  </div>
</template>

<style scoped>
.test-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-container {
  margin-top: 20px;
  text-align: center;
}

.card {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 20px;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.question {
  margin-bottom: 20px;
}

.answer-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.answer {
  font-size: 16px;
}

.answer-button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.answer-button:hover {
  background-color: #45a049;
}

.choices-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.choice-button {
  margin: 0 10px;
  padding: 10px 20px;
  color: #333;
  background-color: white;
  border: 0.5px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.choice-button:hover {
  background-color: #ebebeb;
}

.correct {
  color: #18AE79;
}

.wrong {
  color: #D05700;
}
</style>

<script>
export default {
  data() {
    return {
      currentQuestion: 'Sample Question',
      currentAnswer: 'Sample Answer',
      showingAnswer: false
    };
  },
  methods: {
    showAnswer() {
      this.showingAnswer = !this.showingAnswer;
    },
    submitAnswer(isCorrect, isPerfect = false) {
      console.log(isCorrect, isPerfect);
      this.getQuestion();
    },
    getQuestion() {
      // データ取得のロジックを追加する
      this.currentQuestion = 'Sample Question';
      this.currentAnswer = 'Sample Answer';
      this.showingAnswer = false;
    }
  },
  mounted() {
    this.getQuestion();
  }
};
</script>
