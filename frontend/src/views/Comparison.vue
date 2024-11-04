<script setup lang="ts">
import Games from '@/components/Games.vue';
import { useComparisonStore } from '@/stores/comparison';
import type { Game, User } from 'steam';
import { inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const comparisonStore = useComparisonStore();
const route = useRoute();
const router = useRouter();
const id = route.params.id;

const progress = inject('progress') as any;
progress.start();

let comparison = comparisonStore.pastComparisons.find((comparison) => comparison.id === id);
if (!comparison) {
  // TODO: Throw fancy error
  if (comparisonStore.currentComparison.id !== id) {
    console.error('Not found');
    router.push('/404');
  } else {
    comparison = comparisonStore.currentComparison;
  }
} else {
  comparisonStore.currentComparison = comparison;
}


const onGamesCalculated = (entries: { game: Game; users: User[] }[]) => {
  if (comparison) {
    comparison.calculated = entries;
  }
  // add the comparison into past comparisons if it doesn't exist
  if (!comparisonStore.pastComparisons.some((comparison) => comparison.id === id)) {
    comparisonStore.pastComparisons = [...comparisonStore.pastComparisons, JSON.parse(JSON.stringify(comparison!!))];
  } 
};
</script>

<template>
  <main class="container">
    <p class="text-xs text-neutral-700">{{ comparison?.id }}</p>
    <div class="flex flex-col justify-between gap-2 mb-6 sm:flex-row sm:gap-4">
      <h2>Comparing libraries of {{ comparison?.users.length }} users</h2>
    </div>
    <Suspense>
      <template #default>
        <Games :comparison="comparison!!" @on-games-calculated="onGamesCalculated" />
      </template>
      <template #fallback>
        <section class="mt-9">
          <section class="flex flex-col justify-between gap-1 mb-4 md:flex-row md:gap-4">
            <div class="grow">
              <div class="w-20 h-5 mb-1 suspense"></div>
              <div class="w-full h-6 suspense"></div>
            </div>
            <div class="grow">
              <div class="w-20 h-5 mb-1 suspense"></div>
              <div class="w-full h-6 suspense"></div>
            </div>
          </section>
          <section class="flex flex-row flex-wrap gap-4">
            <template v-for="i in 8" :key="i">
              <div class="h-40 suspense w-80 grow"></div>
            </template>
          </section>
        </section>
      </template>
    </Suspense>
  </main>
</template>
