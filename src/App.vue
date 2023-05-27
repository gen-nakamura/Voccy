<template>
  <div class="home">
    <h1>Welcome to the Vocabulary App</h1>
    <p>Start learning and expanding your vocabulary!</p>
    <button @click="startLearning">Start Learning</button>
  </div>
</template>

<script>
export default {
  methods: {
    startLearning() {
      // Start learning logic
      // ボキャブラリーアプリの学習を開始する処理
    },
  },
};
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

button {
  padding: 0.8rem 1.5rem;
  font-size: 1.2rem;
  border: none;
  background-color: #4caf50;
  color: #fff;
  cursor: pointer;
}
</style>
