<template>
  <div>
    <div class="container flashcards-container">
      <h2>Flashcards</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 10%;">Question</th>
              <th style="width: 15%;">Answer</th>
              <th style="width: 5%;">Previous Result</th>
              <th style="width: 5%;">Latest Result</th>
              <th style="width: 5%;">Latest Test</th>
              <th style="width: 5%;">Schedule</th>
              <th style="width: 5%;"></th> <!-- Edit ボタン用の列 -->
              <th style="width: 5%;"></th> <!-- Delete ボタン用の列 -->
            </tr>
          </thead>
        </table>
        <div class="tbody-container">
          <table>
            <tbody>
              <tr v-for="flashcard in flashcards" :key="flashcard.id" @click="displayAnswerWithLineBreaks(flashcard.id)">
                <td style="width: 10%;">
                  <input v-if="flashcard.id === editId" type="text" v-model="flashcard.question">
                  <span v-else>{{ flashcard.question }}</span>
                </td>
                <td style="width: 15%;"
                  :style="{ whiteSpace: (flashcard.id === answerWithLineBreaksId) ? 'pre-line' : 'nowrap' }">
                  <textarea v-if="flashcard.id === editId" type="text" v-model="flashcard.answer" class="answer-input"
                    @input="adjustAnswerInputHeight"></textarea>
                  <span v-else class="answer-text">{{ flashcard.answer }}</span>
                </td>
                <td style="width: 5%;"><i :class="resultIcon(flashcard.previous_result)"></i></td>
                <td style="width: 5%;"><i :class="resultIcon(flashcard.latest_result)"></i></td>
                <td style="width: 5%;">{{ formatDate(flashcard.latest_test_timestamp) }}</td>
                <td style="width: 5%;">{{ formatDate(flashcard.scheduled_test_timestamp) }}</td>
                <td style="width: 5%;">
                  <button class="edit-button" @click="editFlashcard($event, flashcard.id)"><i
                      :class="{ 'fas fa-save fa-fw': flashcard.id === editId, 'fas fa-edit fa-fw': flashcard.id !== editId }"></i></button>
                </td>
                <td style="width: 5%;">
                  <button class="delete-button" @click="deleteFlashcard($event, flashcard.id)"><i
                      :class="{ 'fas fa-times fa-fw': flashcard.id === editId, 'fas fa-trash fa-fw': flashcard.id !== editId }"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="container">
      <h2>Settings</h2>
      <table>
        <thead>
          <tr>
            <th>Remind Times</th>
            <th>Remind Nums</th>
            <th>Max Test Nums</th>
            <th></th> <!-- Edit ボタン用の列 -->
            <th></th> <!-- Delete ボタン用の列 -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="setting in settings" :key="setting.id">
            <td>{{ setting.remind_times }}</td>
            <td>{{ setting.remind_nums }}</td>
            <td>{{ setting.max_test_nums }}</td>
            <td>
              <button class="edit-button" @click="editSetting(setting.id)"></button>
            </td>
            <td>
              <button class="delete-button" @click="deleteSetting(setting.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 90%;
  margin: auto auto;
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  margin-top: 20px;
}

.table-container {
  height: 100%;
}

table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.tbody-container {
  max-height: 30vh;
  overflow: auto;
}

th {
  padding: 10px;
  text-align: left;
  border-bottom: 2px solid #ccc;
}

td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ccc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

th {
  background-color: #eaeaea;
  font-weight: bold;
}

tr {
  cursor: pointer;
}

tr:hover {
  background-color: #f2f2f2;
}

h2 {
  margin-top: 10px;
}

.edit-button,
.delete-button {
  border: none;
  border-radius: 4px;
  cursor: pointer;
}


.edit-button:hover,
.delete-button:hover {
  background-color: #b3b3b3;
}

.fa-circle,
.fa-check-circle,
.fa-save {
  color: #18AE79;
}

.fa-times {
  color: #D05700;
}

.fa-badge-check {
  color: #0077CC;
}

textarea,
input[type="text"] {
  padding: 10px;
  width: 100%;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s, box-shadow 0.3s;
}

textarea:hover,
input[type="text"]:hover {
  border-color: #aaa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

textarea:focus,
input[type="text"]:focus {
  outline: none;
  border-color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>


<script>
import axios from 'axios';
export default {
  data() {
    return {
      flashcards: [
        {
          id: 1,
          question: "Question 1",
          answer: "Answer 1",
          previous_result: "check",
          latest_result: "cross",
          latest_test_timestamp: "2023-06-03 17:51",
          scheduled_test_timestamp: "2023-06-03 19:00",
        },
        {
          id: 2,
          question: "Question 2",
          answer: "Answer 2",
          previous_result: "circle",
          latest_result: "cross",
          latest_test_timestamp: "2023-06-03 17:51",
          scheduled_test_timestamp: "2023-06-03 19:00",
        },
      ],
      settings: [],
      answerWithLineBreaksId: 0,
      editId: 0,
    };
  },
  mounted() {
    // データを取得する処理（例としてfetchData関数を呼び出す）
    // TODO fetchして表示する関数の作成
    // this.flashcards = this.generateTestData();
    this.openConfig();
  },
  methods: {
    displayAnswerWithLineBreaks(id) {
      if (this.editId === id) return;
      if (this.answerWithLineBreaksId === id) id = 0;
      this.answerWithLineBreaksId = id;
    },
    editFlashcard(event, id) {
      if (id === this.editId) {
        this.updateFlashcard();
      }
      event.stopPropagation();
      this.answerWithLineBreaksId = id;
      this.editId = id;
      this.$nextTick(() => {
        this.adjustAnswerInputHeight();
      });
    },
    updateFlashcard() {
      axios.post('http://localhost:3000/api/update_vocab', this.flashcards.find(i => i.id === this.editId))
        .then(response => {
          console.log('save flashcard, res: ', response.status, response.statusText);
          this.editId = 0;
        })
        .catch(error => {
          // エラーレスポンスの処理
          console.error('Error in request:', error);
        });
    },
    deleteFlashcard(event, id) {
      event.stopPropagation();
      if (id === this.editId) {
        this.editId = 0;
        this.answerWithLineBreaksId = 0;
      } else {
        axios.post('http://localhost:3000/api/delete_vocab', { id: id })
          .then(response => {
            console.log('delete vocab, res: ', response.status, response.statusText);
            this.openConfig();
          })
          .catch(error => {
            // エラーレスポンスの処理
            console.error('Error in request:', error);
          });
      }
    },
    openConfig() {
      axios.post('http://localhost:3000/api/open_config', { limit: 2 })
        .then(response => {
          console.log('open config, res: ', response.status, response.statusText);
          const { settings, flashcards } = response.data.data;
          this.settings = settings;
          this.flashcards = flashcards;
        })
        .catch(error => {
          // エラーレスポンスの処理
          console.error('Error in request:', error);
        });
    },
    resultIcon(result) {
      if (result === 'cross') return 'fas fa-times fa-fw';
      else if (result === 'circle') return 'far fa-circle fa-fw';
      else if (result === 'check') return 'fas fa-check-circle fa-fw';
      else if (result === 'done') return 'fas fa-badge-check fa-fw';
    },
    adjustAnswerInputHeight() {
      const textarea = document.getElementsByClassName('answer-input')[0];
      if (textarea) {
        console.log('adjusting...', textarea);
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${month}/${day}`;
    },
    generateTestData() {
      function padZero(value) {
        return value.toString().padStart(2, "0");
      }
      function generateTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = padZero(now.getMonth() + 1);
        const day = padZero(now.getDate());
        const hours = padZero(now.getHours());
        const minutes = padZero(now.getMinutes());

        return `${year}-${month}-${day} ${hours}:${minutes}`;
      }

      const previousResults = ["cross", "circle", "check", "done"];
      const data = [];

      for (let i = 1; i <= 50; i++) {
        const id = i;
        const question = `Question ${i}`;
        const answer = `Answer \n\nfasdfj;ldjas;lj\n\ndskafd;lakjdfs;ljfa;ljdflk;aj;jlka;ljkf\n${i}`;
        const previousResult =
          previousResults[Math.floor(Math.random() * previousResults.length)];
        const latestResult =
          previousResults[Math.floor(Math.random() * previousResults.length)];
        const latestTestTimestamp = generateTimestamp();
        const scheduledTestTimestamp = generateTimestamp();

        const item = {
          id,
          question,
          answer,
          previous_result: previousResult,
          latest_result: latestResult,
          latest_test_timestamp: latestTestTimestamp,
          scheduled_test_timestamp: scheduledTestTimestamp,
        };

        data.push(item);
      }

      return data;
    },
    // const testData = generateTestData();
  },
};
</script>