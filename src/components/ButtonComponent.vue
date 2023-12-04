
<script setup>
import { defineProps } from 'vue';

const { btnId, label, onClick, isDisabled } = defineProps({
  btnId: String,
  label: String,
  onClick: Function,
  isDisabled: Boolean
});

</script>

<template>
  <button :id="btnId" @click="onClick" :disabled="isDisabled">{{ label }}</button>
</template>
