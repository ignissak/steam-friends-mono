<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { inject } from 'vue';

const userStore = useUserStore();
await userStore.fetchUserGames();

(inject('progress') as any).finish();
</script>

<template>
  <main class="container mb-6">
    <section id="profile" class="flex items-center gap-4">
      <div class="avatar">
        <div class="w-20 rounded">
          <img :src="userStore.user?.avatarfull" alt="Steam profile picture" />
        </div>
      </div>
      <div>
        <a
          :href="userStore.user?.profileurl"
          target="_blank"
          class="link text-lg text-neutral-100"
          >{{ userStore.user?.personaname }}</a
        >
        <p class="text-sm text-neutral-400">
          You own <span class="text-neutral-100">{{ userStore.userGames.length }} games</span>
        </p>
      </div>
    </section>
  </main>
</template>
