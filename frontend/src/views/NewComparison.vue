<script setup lang="ts">
import SelectableFriendList from '@/components/SelectableFriendList.vue';
import { inject, ref, watch } from 'vue';

let id = ref(0);
const progress = inject('progress') as any;
progress.start();

watch(id, () => {
  progress.start();
});
</script>

<template>
  <Suspense :key="id">
    <template #default>
      <SelectableFriendList @reloadComponent="id++" />
    </template>
    <template #fallback>
      <main class="container">
        <div class="suspense mb-1 h-7 w-64"></div>
        <div class="suspense mb-4 h-10 w-80 sm:h-5 sm:w-96"></div>
        <section class="mb-4 flex flex-col justify-between gap-4 md:flex-row">
          <div class="suspense h-8 w-full"></div>
          <div class="suspense h-8 w-full"></div>
        </section>
        <section class="mb-4 flex flex-row flex-wrap gap-4">
          <template v-for="i in 9" :key="i">
            <div class="suspense h-16 w-full sm:w-56 sm:grow md:grow-0"></div>
          </template>
        </section>
      </main>
    </template>
  </Suspense>
</template>
