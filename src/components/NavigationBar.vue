<template>
  <div class="navigation-bar">
    <button @click="switchScreen('HelloWorld')" class="nav-button">HelloWorld</button>
    <button @click="switchScreen('FlashCards')" class="nav-button">FlashCards</button>
  </div>
</template>

<script>
export default {
  methods: {
    switchScreen(screen) {
      this.$emit('switch-screen', screen); // 親コンポーネントに画面切り替えのイベントを通知
    }
  }
};
</script>

<style scoped>
.navigation-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #333;
  height: 50px;
}

.nav-button {
  padding: 10px 20px;
  margin: 0 10px;
  color: #fff;
  background-color: #4caf50;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.nav-button:hover {
  background-color: #45a049;
}
</style>
