<template>
  <div class="test-container">
    <div class="card-container" @click="showAnswer">
      <div class="card">
        <div class="card-content" ref="content">
          <h3 class="question" ref="question">{{ currentQuestion }}</h3>
          <h3 class="answer" :class="{'hidden': !showingAnswer}">{{ currentAnswer }}</h3>
        </div>
      </div>
    </div>
    <!-- <button @click="showAnswer" class="answer-button">Answer</button> -->
    <div class="choices-container">
      <button @click="submitAnswer(false)" class="choice-button wrong"><i class="fas fa-times fa-2x fa-fw" aria-hidden="true"></i></button>
      <button @click="submitAnswer(true)" class="choice-button correct"><i class="far fa-circle fa-2x fa-fw" aria-hidden="true"></i></button>
      <button @click="submitAnswer(true, true)" class="choice-button correct"><i class="fas fa-check-circle fa-2x fa-fw" aria-hidden="true"></i></button>
    </div>
  </div>
</template>

<style scoped>
.hidden {
  visibility: hidden;
}

.test-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-container {
  margin-top: 20px;
  text-align: center;
  position: relative;
  cursor: pointer;
  transition: height 0.3s ease;
}

.showing-answer {
  height: auto;
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
  margin: 0;
  transition: height 0.3s ease;
}

.card-content h3 {
  margin: 0;
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
  font-size: 20px;
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
      currentQuestion: '',
      currentAnswer: '',
      showingAnswer: false,
      questionAndAnswerHeight: 0
    };
  },
  methods: {
    showAnswer() {
      this.showingAnswer = !this.showingAnswer;
      this.updateHeight();
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
      this.$nextTick(() => {
        this.questionAndAnswerHeight = this.$refs.content.clientHeight;
        this.updateHeight();
      });
    },
    updateHeight() {
      console.log('update');
      const question = this.$refs.question;
      const content = this.$refs.content;
      const originalHeight = content.clientHeight;

      content.style.height = originalHeight + "px";
      content.offsetHeight; // 強制的にリフローを行い、変更したスタイルが反映されることを保証します

      content.style.transition = "height 0.3s ease";
      console.log(originalHeight);
      console.log(question.clientHeight);
      // TODO テキストのフェードも実装する
      if (this.showingAnswer) {
        content.style.height = this.questionAndAnswerHeight + "px";
      } else {
        content.style.height = question.clientHeight + "px";
      }
    }
  },
  mounted() {
    this.getQuestion();
  },
  
};
</script>
