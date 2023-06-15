<template>
  <Dialog v-model:visible="versionInfo" modal header="Update Info 🎊" :style="{ width: '75vw' }">
    <pre>{{ versionInfo }}</pre>
  </Dialog>
  <div class="form-container" ref="parent" style="opacity: 0; transition: opacity 0.25s;">
    <div class="input-block">
      <textarea v-model="questionInput" placeholder="Write a question" class="input-field input-question"
        :style="{ height: questionInputHeight }" ref="questionInput" @input="adjustQuestionInputHeight"></textarea>
      <button @click="toggleOptions" ref="optionsMenu" class="options-button">
        <i class="fa fa-spinner" :class="{ 'fa-spin': waitForResponse }"></i><!-- add fa-pulse to make it spin -->
      </button>
      <div v-if="showOptions" class="options-menu">
        <ul>
          <li tabindex="0" v-for="(option, index) in options" :key="index" @keydown.enter="selectOption(index)"
            @click="selectOption(index)">{{ option }}</li>
        </ul>
      </div>
    </div>
    <div class="input-block">
      <textarea v-model="answerInput" placeholder="Write an answer" class="input-field input-answer"></textarea>
    </div>
    <button @click="saveData" class="save-button">Save</button>
  </div>
</template>

<script>
import axios from 'axios';
import { createCompletion } from '@/server/api';
import Dialog from 'primevue/dialog';

export default {
  name: 'NewVocab',
  components: {
    Dialog
  },
  data() {
    return {
      questionInput: '',
      answerInput: '',
      questionInputHeight: 'auto',
      showOptions: false,
      waitForResponse: false,
      options: ['new word', 'word usage', 'sentence rephrase', 'これは英語で？', 'if native'],
      versionInfo: null
    };
  },
  methods: {
    saveData() {
      const data = {
        question: this.questionInput,
        answer: this.answerInput
      };

      axios.post('http://localhost:3307/api/add_vocab', data)
        .then(response => {
          console.log('open_app, res: ', response.status, response.statusText);
        })
        .catch(error => {
          // エラーレスポンスの処理
          console.error('Error in request:', error);
        });
      this.questionInput = '';
      this.answerInput = '';
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
      const optionsMenu = this.$refs.optionsMenu;
      if (!optionsMenu.contains(event.target)) {
        this.showOptions = false;
      }
    },
    async selectOption(index) {
      // 選択されたオプションの処理を追加
      console.log('Option selected:', this.options[index]);
      this.waitForResponse = true;
      const text = await createCompletion(this.options[index], this.questionInput);

      this.waitForResponse = false;
      this.answerInput = text.trimLeft();
    },
    getVersionInformation() {
      axios.post('http://localhost:3307/api/ver_info')
        .then(response => {
          console.log('ver_info, res: ', response.status, response.statusText);
          console.log(response.data);
          // update information, hasNotified
          this.versionInfo = response.data.data;
        })
        .catch(error => {
          // エラーレスポンスの処理
          console.error('Error in request:', error);
        });
    },
  },
  created() {
    window.addEventListener('click', this.handleGlobalClick);
  },
  mounted() {
    this.$nextTick(() => {
      this.adjustQuestionInputHeight();
      this.$refs.parent.style = "opacity: 1; transition: opacity 0.25s; transition-delay: 0.5s;"
    });
    this.getVersionInformation();
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
  font-size: 16px;
}

.options-button i {
  color: #333;
}

.options-button i.fa-pulse {
  animation: spin 1s infinite linear;
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

.options-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.options-menu li {
  padding: 5px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.options-menu li:hover {
  background-color: #f7f7f7;
}
</style>
