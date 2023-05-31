<template>
  <div>
    <button @click="switchScreen('Screen1')">Screen 1</button>
    <button @click="switchScreen('Screen2')">Screen 2</button>
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
