<template>
  <ConfirmDialog></ConfirmDialog>
  <Toast />
  <div id="page">
    <div class="container flashcards-container"
      :style="{ height: (editId === 0 && answerWithLineBreaksId === 0) ? '60%' : '90%' }">
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

    <div class="container settings-container">
      <h2>Settings</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 10%">Notification</th>
            <th style="width: 20%">Remind Times</th>
            <th style="width: 10%">Max Test Nums</th>
            <th style="width: 5%"></th>
            <th style="width: 5%"></th>
            <th style="width: 5%"></th>
          </tr>
        </thead>
        <tbody>
          <tr class="settings">
            <td style="width: 10%">
              <InputSwitch v-model="notificationEnabled" :disabled="!editSettings" />
            </td>
            <td style="width: 20%">
              <textarea v-if="editSettings" type="text" v-model="settings.remind_times"></textarea>
              <span v-else :style="{ opacity: !notificationEnabled ? '0.5' : '1' }">{{ settings.remind_times }}</span>
            </td>
            <td style="width: 10%">
              <input v-if="editSettings" type="text" v-model="settings.max_test_nums">
              <span v-else :style="{ opacity: !notificationEnabled ? '0.5' : '1' }">{{ settings.max_test_nums }}</span>
            </td>
            <td style="width: 5%"></td>
            <td style="width: 5%">
              <button class="edit-button" @click="changeSettings()"><i
                  :class="{ 'fas fa-save fa-fw': editSettings === true, 'fas fa-edit fa-fw': editSettings !== true }"></i></button>
            </td>
            <td style="width: 5%">
              <button v-if="editSettings" @click="() => { editSettings = false; openConfig(); }" class="delete-button">
                <i class="fas fa-times fa-fw"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
#page {
  height: 95%;
}

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

.settings-container {
  height: 30%;
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
  max-height: calc(100% - 120px);
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

.settings td {
  white-space: pre-line;
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
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import InputSwitch from 'primevue/inputswitch';

export default {
  components: {
    ConfirmDialog,
    Toast,
    InputSwitch
  },
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
      settings: { remind_enabled: 1 },
      answerWithLineBreaksId: 0,
      editId: 0,
      editSettings: false,
      notificationEnabled: true
    };
  },
  mounted() {
    this.openConfig();
    // this.flashcards = this.generateTestData();
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
      axios.post('http://localhost:3307/api/update_vocab', this.flashcards.find(i => i.id === this.editId))
        .then(response => {
          console.log('save flashcard, res: ', response.status, response.statusText);
          this.editId = 0;
          this.openConfig();
          this.$toast.add({ severity: 'success', summary: 'Saved!', detail: 'Your data was saved successfully', life: 2000 });
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
        this.answerWithLineBreaksId = id;
        this.openConfig();
      } else {
        this.$confirm.require({
          message: 'Are you sure you want to delete?',
          header: 'Confirmation',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            axios.post('http://localhost:3307/api/delete_vocab', { id: id })
              .then(response => {
                console.log('delete vocab, res: ', response.status, response.statusText);
                this.openConfig();
                this.$toast.add({ severity: 'success', summary: 'Deleted', detail: 'You deleted your data successfully', life: 2000 });
              })
              .catch(error => {
                // エラーレスポンスの処理
                console.error('Error in request:', error);
              });
          }
        });
      }
    },
    async changeSettings() {
      if (this.editSettings) {
        if (!this.isInteger(this.settings.max_test_nums)) {
          this.$toast.add({ severity: 'error', summary: 'Type Error', detail: 'the input must be an integer', life: 2000 });
        } else if (!this.isValidFormat(this.settings.remind_times)) {
          this.$toast.add({ severity: 'error', summary: 'Type Error', detail: 'the REMIND TIMES must follow a certain format.\n- Enclosed with []\n- Each time has to be enclosed with ""\n- All the times have to be split by ,', life: 5000 });
        }
        else {
          this.settings.remind_enabled = this.notificationEnabled ? 1 : 0;
          await axios.post('http://localhost:3307/api/change_settings', this.settings)
            .then(response => {
              console.log('edit settings, res: ', response.status, response.statusText);
              this.editSettings = false;
              this.openConfig();
              this.$toast.add({ severity: 'success', summary: 'Saved!', detail: 'Your data was saved successfully', life: 2000 });
            })
            .catch(error => {
              // エラーレスポンスの処理
              console.error('Error in request:', error);
            });
        }
      } else {
        this.editSettings = true;
      }
    },
    openConfig() {
      axios.post('http://localhost:3307/api/open_config', { limit: 10000000 })
        .then(response => {
          console.log('open config, res: ', response.status, response.statusText);
          const { settings, flashcards } = response.data.data;
          delete settings.id;
          console.log(response.data);
          this.settings = settings;
          this.flashcards = flashcards;
          this.notificationEnabled = Boolean(settings.remind_enabled);
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
    isInteger(value) {
      return !isNaN(Number(value)) && (Number.isInteger(Number(value)));
    },
    isValidFormat(jsonString) {
      try {
        const parsedData = JSON.parse(jsonString);
        if (!Array.isArray(parsedData)) {
          return false;
        }

        for (let i = 0; i < parsedData.length; i++) {
          const timeRegex = /^\d{1,2}:\d{2}$/;
          if (typeof parsedData[i] !== 'string' || !timeRegex.test(parsedData[i])) {
            return false;
          }
        }

        return true;
      } catch (error) {
        return false;
      }
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