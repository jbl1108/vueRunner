<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const selectedFile = ref<File | null>(null);
    const selectedFileName = ref<string>("");
    const weekNumber = ref<number | null>(null);
    const fileInput = ref<HTMLInputElement | null>(null);

    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    const handleFileChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file && file.name.endsWith(".csv")) {
        selectedFile.value = file;
        selectedFileName.value = file.name;
      } else {
        selectedFile.value = null;
        selectedFileName.value = "";
        alert("Vælg venligst en gyldig CSV fil.");
      }
    };

    const handleSubmit = () => {
      if (!selectedFile.value) {
        alert("Vælg venligst en fil før upload.");
        return;
      }
      if (!weekNumber.value) {
        alert("Indtast venligst et ugenummer.");
        return;
      }
      console.log("Fil:", selectedFile.value);
      console.log("Ugenummer:", weekNumber.value);
      alert(`Fil "${selectedFileName.value}" og ugenummer "${weekNumber.value}" er klar til upload.`);
    };

    return {
      selectedFile,
      selectedFileName,
      weekNumber,
      fileInput,
      triggerFileInput,
      handleFileChange,
      handleSubmit,
    };
  },
});

</script>

<template>
  <div>
    <h2>Upload CSV Fil</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="file">Vælg en CSV fil:</label>
        <input
          type="file"
          id="file"
          ref="fileInput"
          @change="handleFileChange"
          accept=".csv"
          style="display: none"
        />
        <button type="button" @click="triggerFileInput">Vælg fil</button>
        <input
          type="text"
          v-model="selectedFileName"
          placeholder="Intet filnavn valgt"
          readonly
        />
      </div>
      <div>
        <label for="weekNumber">Ugenummer:</label>
        <input
          type="number"
          id="weekNumber"
          v-model="weekNumber"
          placeholder="Indtast ugenummer"
          min="1"
          max="52"
        />
      </div>
      <button type="submit" :disabled="!selectedFile">Upload</button>
    </form>
  </div>
</template>





<style scoped>
div {
  margin-bottom: 1rem;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
