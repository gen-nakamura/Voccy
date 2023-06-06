<template>
  <div>
    <div class="container flashcards-container">
      <h2>Flashcards</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Question</th>
              <th>Answer</th>
              <th>Previous Result</th>
              <th>Latest Result</th>
              <th>Latest Test Timestamp</th>
              <th>Scheduled Test Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="flashcard in flashcards" :key="flashcard.id">
              <td>{{ flashcard.question }}</td>
              <td>{{ flashcard.answer }}</td>
              <td>{{ flashcard.previous_result }}</td>
              <td>{{ flashcard.latest_result }}</td>
              <td>{{ flashcard.latest_test_timestamp }}</td>
              <td>{{ flashcard.scheduled_test_timestamp }}</td>
            </tr>
          </tbody>
        </table>
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
          </tr>
        </thead>
        <tbody>
          <tr v-for="setting in settings" :key="setting.id">
            <td>{{ setting.remind_times }}</td>
            <td>{{ setting.remind_nums }}</td>
            <td>{{ setting.max_test_nums }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


<style scoped>
.container {
  max-width: 90%;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.flashcards-container {
  max-height: 60vh;
  overflow: auto;
}

.table-container {
  height: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ccc;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

tr:last-child td {
  border-bottom: none;
}

h2 {
  margin-top: 30px;
}
</style>

<script>
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
    };
  },
  mounted() {
    // データを取得する処理（例としてfetchData関数を呼び出す）
    this.flashcards = this.generateTestData();
  },
  methods: {
    fetchData() {
      // flashcardsテーブルからデータを取得する処理（例としてgetFlashcards関数を呼び出す）
      //   this.flashcards = getFlashcards();
      // settingsテーブルからデータを取得する処理（例としてgetSettings関数を呼び出す）
      //   this.settings = getSettings();
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

      const previousResults = ["cross", "circle", "check"];
      const data = [];

      for (let i = 1; i <= 50; i++) {
        const id = i;
        const question = `Question ${i}`;
        const answer = `Answer ${i}`;
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