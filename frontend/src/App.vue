<script setup lang="ts">
import { getCurrentInstance, provide } from 'vue';
import { RouterView } from 'vue-router';
import { useUserStore } from './stores/user';
const userStore = useUserStore();

const internalInstance = getCurrentInstance();
const progress: any = internalInstance!!.appContext.config.globalProperties.$Progress;

provide('progress', progress);

progress.start();
</script>

<template>
  <div class="flex flex-col h-screen">
    <header class="container flex flex-row items-center justify-between mt-6 mb-2">
      <div>
        <h1>Steam Friends Library Compare</h1>
        <span class="block text-sm text-neutral-700 sm:inline">version 1.2.2</span>
      </div>
    </header>
    <template v-if="userStore.isLoggedIn">
      <nav class="container flex flex-row items-center justify-between gap-2 mb-6 sm:gap-4">
        <router-link to="/dashboard" class="uppercase btn btn-xs grow">Dashboard</router-link>
        <router-link to="/new" class="uppercase btn btn-xs grow">New comparison</router-link>
        <router-link to="/signout" class="uppercase btn btn-xs grow">Sign out</router-link>
      </nav>
    </template>

    <RouterView />
    <vue-progress-bar></vue-progress-bar>
  </div>
</template>
