<template>
  <div>
    <div v-if="showingCongratulations" class="congratulations-container">
      <h1 class="congratulations-text" style="white-space: pre-line;">{{ message }}</h1>
    </div>
  </div>
<div ref="parent" style="opacity: 0; transition: opacity 0.25s;">
  <div class="test-container">
    <div class="card-container">
      <div class="card" @click="showAnswer">
        <div class="card-content" ref="content" :key="currentAnswer"> <!-- question idにしたい -->
          <h3 class="question" ref="question">{{ currentQuestion }}</h3>
          <h3 class="answer" style="text-align: left;" :style="transitionDelay">{{ currentAnswer }}</h3>
        </div>
      </div>
    </div>
    <div class="choices-container">
      <button @click="submitAnswer('cross')" class="choice-button wrong"><i class="fas fa-times fa-2x fa-fw" aria-hidden="true"></i></button>
      <button @click="submitAnswer('circle')" class="choice-button correct"><i class="far fa-circle fa-2x fa-fw" aria-hidden="true"></i></button>
      <button @click="submitAnswer('check')" class="choice-button correct"><i class="fas fa-check-circle fa-2x fa-fw" aria-hidden="true"></i></button>
    </div>
  </div>
</div>
</template>

<script>
import axios from 'axios';
import { formatDateNow } from '@/server/logic'
export default {
  data() {
    return {
      message: 'Congratulations🎊\nYou have finished all the tasks!',
      showingCongratulations: false,
      currentQuestion: '',
      currentAnswer: '',
      currentId: null,
      showingAnswer: false,
      questionAndAnswerHeight: 0,
      count: 0,
      quizSets: [
        {id: 1,question: 'Sample Question1', answer: 'Sample Answer\n\n\najfld;jdsっっっっっっっっっdさあああああああああっffldkasj\n\nladsfjkk'},
        {id: 2,question: 'Sample Question2', answer: 'adfalkdj;lkajs;ldfa'},
        {id: 3,question: 'Sample Question3', answer: 'Sample Answer\n\n\najfld;jfldkasj\n\nladsfnswer\n\n\najfld;jfldkasj\n\nladsfjkk'},
        ],
    };
  },
  computed: {
    transitionDelay() {
      return this.showingAnswer ? 'transition-delay: 0.25s' : 'transition-delay: 0s; opacity: 0; pointer-events: none;';
    }
  },
  methods: {
    showAnswer() {
      this.showingAnswer = !this.showingAnswer;
      this.updateHeight();
    },
    hideAll() {
      this.$refs.parent.style = "opacity: 0; transition: opacity 0.25s;"
    },
    submitAnswer(status) {
      console.log(status);
      this.$refs.parent.style = "opacity: 0; transition: opacity 0.25s";
      const currentId = this.currentId;
      const targetFlashcard = this.quizSets.find(flashcard => flashcard.id === currentId);
      const recordBody = {id: targetFlashcard.id, latest_test_timestamp: formatDateNow()};
      recordBody.previous_result = targetFlashcard.latest_result;
      recordBody.latest_result = status;
      if (targetFlashcard.previous_result === 'check' && targetFlashcard.latest_result === 'check') {
        recordBody.latest_result = 'done';
      }
      console.log(recordBody);
      axios.post('http://localhost:3000/api/take_test', recordBody)
      .then(response => {
        console.log('take test, res: ', response.status, response.statusText);
      })
      .catch(error => {
        // エラーレスポンスの処理
        console.error('Error in request:', error);
      });
      setTimeout(() => {
        this.getQuestion();
      }, 250);
    },
    allDone() {
      this.showingCongratulations = true;
      this.currentAnswer = '';
      this.currentQuestion = '';
      this.currentId = null;
      this.$refs.parent.style = "display: none;";
    },
    getQuestion() {
      if (this.count >= this.quizSets.length) {
        this.allDone();
        return;
      }
      this.currentQuestion = this.quizSets[this.count].question;
      this.currentAnswer = this.quizSets[this.count].answer;
      this.currentId = this.quizSets[this.count].id;
      this.count++;
      this.showingAnswer = false;
      this.$nextTick(() => {
        this.questionAndAnswerHeight = this.$refs.content.clientHeight;
        this.updateHeight();
        this.$refs.parent.style = "opacity: 1; transition: opacity 0.25s; transition-delay: 0.5s;"
      });
    },
    updateHeight() {
      console.log('update');
      const question = this.$refs.question;
      const content = this.$refs.content;
      const originalHeight = content.clientHeight;

      content.style.height = originalHeight + "px";
      content.offsetHeight; // 強制的にリフローを行い、変更したスタイルが反映されることを保証します

      content.style.transition = "height 0.25s ease";
      console.log(originalHeight);
      console.log(question.clientHeight);
      // TODO テキストのフェードも実装する
      if (this.showingAnswer) {
        content.style.height = this.questionAndAnswerHeight + "px";
        question.style = 'border-bottom: 2px solid #ccc; transition-delay: 0.25s'
      } else {
        content.style.transitionDelay = '0.25s';
        content.style.height = question.clientHeight + "px";
        question.style = 'border-bottom: 2px solid #cccccc00'
      }
    }
  },
  async mounted() {
    this.quizSets = 
        await axios.post('http://localhost:3000/api/open_test')
        .then(response => {
          const { success, data } = response.data;
          console.log('open_test, res: ', response.status, response.statusText);
          console.log('this is response quizSets: ', data);
          if (success) return data;
          else console.log('some error occured in open_test');
        })
        .catch(error => {
          // エラーレスポンスの処理
          console.error('Error in request:', error);
        });
    this.getQuestion();
  },
  
};
</script>

<style scoped>
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
  transition: height 0.25s ease;
}

.showing-answer {
  height: auto;
}

.card {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  padding: 20px;
  max-width: 70vw;
  width: 100%;
  margin: 0 auto; /* 中央揃えのために必要なマージン設定 */
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  transition: height 0.25s ease;
}

.card-content h3 {
  margin: 0;
  padding: 5px;
  white-space: pre-line;
}

.question {
  margin-bottom: 20px;
  border-bottom: 2px solid #cccccc00; /*transparent*/
  transition: 0.25s;
}

.answer-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.answer {
  font-size: 16px;
  transition: opacity 0.25s;
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

.congratulations-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.congratulations-text {
  font-size: 32px;
  font-weight: bold;
  color: #4caf50;
  animation: fadeIn 1s ease;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
