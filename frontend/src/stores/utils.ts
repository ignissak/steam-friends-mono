import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUtilsStore = defineStore('utils', () => {
  // TODO: Look into better solution
  const lastReloadNewCompare = ref(0);

  return { lastReloadNewCompare };
});
