<template>
  <div>
    <h2>Flashcards</h2>
    <ul>
      <li v-for="flashcard in flashcards" :key="flashcard.id">
        <div>{{ flashcard.question }}</div>
        <div>{{ flashcard.answer }}</div>
        <div>Previous Result: {{ flashcard.previous_result }}</div>
        <div>Latest Result: {{ flashcard.latest_result }}</div>
        <div>Latest Test Timestamp: {{ flashcard.latest_test_timestamp }}</div>
        <div>Scheduled Test Timestamp: {{ flashcard.scheduled_test_timestamp }}</div>
      </li>
    </ul>

    <h2>Settings</h2>
    <ul>
      <li v-for="setting in settings" :key="setting.id">
        <div>Remind Times: {{ setting.remind_times }}</div>
        <div>Remind Nums: {{ setting.remind_nums }}</div>
        <div>Max Test Nums: {{ setting.max_test_nums }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      flashcards: [],
      settings: []
    };
  },
  mounted() {
    // データを取得する処理（例としてfetchData関数を呼び出す）
    this.fetchData();
  },
  methods: {
    fetchData() {
      // flashcardsテーブルからデータを取得する処理（例としてgetFlashcards関数を呼び出す）
      this.flashcards = getFlashcards();

      // settingsテーブルからデータを取得する処理（例としてgetSettings関数を呼び出す）
      this.settings = getSettings();
    }
  }
};
</script>
