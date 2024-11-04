<script setup lang="ts">
import PastCompares from '@/components/PastCompares.vue';
import Profile from '@/components/Profile.vue';
import { inject } from 'vue';

const progress = inject('progress') as any;
progress.start();
</script>
<template>
  <Suspense>
    <template #default>
      <Profile />
    </template>
    <template #fallback>
      <main class="container mb-6">
        <section id="profile" class="flex items-center gap-4">
          <div class="avatar">
            <div class="suspense h-20 w-20"></div>
          </div>
          <div>
            <div class="suspense mb-2 h-6 w-40"></div>
            <div class="suspense h-4 w-20"></div>
          </div>
        </section>
      </main>
    </template>
  </Suspense>
  <PastCompares />
</template>
