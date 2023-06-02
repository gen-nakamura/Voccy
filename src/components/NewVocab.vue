<template>
  <div class="form-container" ref="parent" style="opacity: 0; transition: opacity 0.25s;">
    <div class="input-block">
      <textarea v-model="questionInput" placeholder="Write a question" class="input-field input-question" :style="{ height: questionInputHeight }" ref="questionInput" @input="adjustQuestionInputHeight"></textarea>
      <button @click="toggleOptions" ref="optionsMenu" class="options-button"><i class="fa fa-spinner"></i></button> <!-- add fa-pulse to make it spin -->
      <div v-if="showOptions" class="options-menu">
        <!-- オプションメニューの内容を追加 -->
      </div>
    </div>
    <div class="input-block">
      <textarea v-model="answerInput" placeholder="Answer" class="input-field input-answer"></textarea>
    </div>
    <button @click="saveData" class="save-button">Save</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'NewVocab',
  props: {
    msg: String
  },
  data() {
    return {
      questionInput: 'sampleQuestion',
      answerInput: 'sampleAnswer',
      questionInputHeight: 'auto',
      showOptions: false
    };
  },
  methods: {
    saveData() {
      const data = {
        questionInput: this.questionInput,
        answerInput: this.answerInput
      };

      axios.post('http://localhost:3000/api/data', data)
        .then(response => {
          console.log(response.data);
          // Handle the response as needed
        })
        .catch(error => {
          console.error('Error sending data:', error);
        });
    },
    toggleOptions() {
      this.showOptions = !this.showOptions;
    },
    adjustQuestionInputHeight() {
      const textarea = this.$refs.questionInput;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    },
    handleGlobalClick(event) {
      // クリックされた要素がオプションメニューでない場合に showOptions を false に設定する
      const optionsMenu = this.$refs.optionsMenu;
      if (!optionsMenu.contains(event.target)) {
        this.showOptions = false;
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.adjustQuestionInputHeight();
      this.$refs.parent.style = "opacity: 1; transition: opacity 0.25s; transition-delay: 0.5s;"
    });
  },
  created() {
    window.addEventListener('click', this.handleGlobalClick);
  },
  beforeUnmount() {
    window.removeEventListener('click', this.handleGlobalClick);
  },
};
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.input-block {
  margin-bottom: 10px;
  position: relative;
}

.input-field {
  width: 500px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.input-question {
  resize: none;
  background-color: #f7f7f7;
  overflow: hidden;
}

.input-answer {
  height: 200px;
  background-color: #fff;
}

.save-button {
  width: 100px;
  height: 30px;
  background-color: #56CCF2;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-button:hover {
  background-color: #4BAEDB;
}

.options-button {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.options-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 10px;
  width: 200px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
}
</style>
