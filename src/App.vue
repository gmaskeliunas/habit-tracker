<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router'

onMounted(() => {
  document.body.style.backgroundColor = '#252627';
});
</script>

<template>
  <main>
    <RouterView />
  </main>
</template>
