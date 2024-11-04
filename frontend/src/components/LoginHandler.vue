<template>
  <main class="container flex flex-grow items-center justify-center">
    <span class="loading loading-spinner loading-md mr-4"></span>
    <span>Logging in...</span>
  </main>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import type { User } from 'steam';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

fetch(`${import.meta.env.VITE_API_BASE_URL}/api/me`, {
  credentials: 'include',
  redirect: 'manual'
}).then(async (res) => {
  const status = res.status;
  const json = await res.json();
  if (status === 401) {
    // redirect to steam login
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}${json.redirect}`;
  } else if (status === 200) {
    userStore.login(json.user as User);
    if (userStore.isLoggedIn) {
      router.push({ name: 'dashboard' });
    }
  }
});
</script>
