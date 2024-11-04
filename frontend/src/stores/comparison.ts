import { defineStore } from 'pinia';
import type { Comparison } from 'steam';
import { ref } from 'vue';

export const useComparisonStore = defineStore(
  'comparison',
  () => {
    const pastComparisons = ref([] as Comparison[]);
    const currentComparison = ref({} as Comparison);

    return { pastComparisons, currentComparison };
  },
  {
    persist: true
  }
);
