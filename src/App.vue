<template>
  <div class="home">
    <img :src="currentImage" alt="Image" :style="{width: 300}">
    <h1>Welcome to the Vocabulary App</h1>
    <h1>Let's Voccy!↓</h1>
    <p>Start learning and expanding your vocabulary!</p>
    <button @click="changeImage">Start Learning</button>
  </div>
</template>

<script>
import { createCompletion } from '@/api/api';
import image1 from '@/assets/afterVoccy.png';
import image2 from '@/assets/beforeVoccy.webp';

export default {
  data() {
    return {
      currentImage: image2,
      images: [
        image2,
        image1
      ],
      currentIndex: 0
    };
  },
  // async created() {
    // },
  methods: {
    changeImage() {
      this.currentIndex++;
      if (this.currentIndex >= this.images.length) {
        this.currentIndex = 0;
      }
      this.currentImage = this.images[this.currentIndex];
    },
    async startLearning() {
      console.log('start learning');
      const prompt = 'MY PROMPT HERE';
      const response = await createCompletion(prompt);
      console.log(response);
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
