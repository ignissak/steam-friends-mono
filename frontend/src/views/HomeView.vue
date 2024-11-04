<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { inject } from 'vue';
import { useRouter } from 'vue-router';

const progress = inject('progress') as any;
progress.finish();

const userStore = useUserStore();
const router = useRouter();
if (userStore.isLoggedIn) {
  router.push('/dashboard');
}
</script>

<template>
  <main class="container">
    <p class="mb-4 text-neutral-400">
      Discover shared gaming horizons with Steam Friends Library Compare. Seamlessly connect,
      compare collections, and elevate your gaming adventures with friends effortlessly!
    </p>
    <a href="/login">
      <img
        src="https://community.akamai.steamstatic.com/public/images/signinthroughsteam/sits_01.png"
      />
    </a>
  </main>
</template>
