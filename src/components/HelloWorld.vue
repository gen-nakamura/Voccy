<template>
    <h1>{{ msg }}aaa</h1>
    <div class="form-container">
      <input type="text" v-model="questionInput" placeholder="Question" class="input-field">
      <input type="text" v-model="answerInput" placeholder="Answer" class="input-field">
      <button @click="saveData" class="save-button">Save</button>
    </div>
</template>

<script>
import axios from 'axios';


export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      questionInput: 'sampleQuestion',
      answerInput: 'sampleAnswer'
    };
  },
  methods: {
    saveData() {
      const data = {
        questionInput: this.questionInput,
        answerInput: this.answerInput
      };

      axios.post('http://localhost:3000/api/data', data)
        .then(response => {
          console.log(response.data);
          // Handle the response as needed
        })
        .catch(error => {
          console.error('Error sending data:', error);
        });
    }
  }
};
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.input-field {
  width: 300px;
  height: 30px;
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.save-button {
  width: 100px;
  height: 30px;
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-button:hover {
  background-color: #45a049;
}
</style>
