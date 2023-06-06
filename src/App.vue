<template>
  <NavigationBar @switch-screen="handleSwitchScreen" />
  <div class="home">
    <component :is="currentScreen"></component>
    <!-- <HelloWorld /> -->
  </div>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue';
import NewVocab from './components/NewVocab.vue';
import FlashcardsTest from './components/FlashcardsTest.vue';
import ConfigurationEdit from './components/ConfigurationEdit.vue';
// import axios from 'axios';

export default {
  data() {
    return {
      currentScreen: 'NewVocab' // 最初に表示する画面を指定
    };
  },
  components: {
    NavigationBar,
    NewVocab,
    FlashcardsTest,
    ConfigurationEdit
  },
  methods: {
    handleSwitchScreen(screen) {
      this.currentScreen = screen; // 画面を切り替える
    },
  },
};
</script>

<style scoped>
.app {
  position: relative;
}

.home {
  margin-top: 50px;
  /* ナビゲーションバーの高さ分だけ下にスペースを空ける */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background-color: #f8f8f8;
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
