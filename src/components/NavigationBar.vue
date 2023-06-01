<template>
  <div class="navigation-bar">
    <div class="nav-links">
      <button @click="switchScreen('NewVocab')" class="nav-button">NewVocab</button>
      <button @click="switchScreen('FlashcardsTest')" class="nav-button">FlashcardsTest</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    switchScreen(screen) {
      this.$emit('switch-screen', screen);
    }
  }
};
</script>

<style scoped>
.navigation-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: white;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.nav-links {
  display: flex;
  align-items: center;
}

.nav-button {
  padding: 10px 20px;
  margin: 0 10px;
  color: #333;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button:hover {
  background-color: #333;
  color: #fff;
}
</style>
