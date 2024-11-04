<script setup lang="ts">
import { sort } from 'fast-sort';
import type { Comparison, Game, User } from 'steam';
/** @ts-ignore */
import VLazyImage from 'v-lazy-image';

const props = defineProps<{
  game: Game;
  comparison: Comparison;
  users: User[];
  filteredUsers: string[];
}>();

sort(props.users).asc((user) => user.personaname);

const headerImage = `https://cdn.akamai.steamstatic.com/steam/apps/${props.game.appid}/header.jpg`;
const storeLink = `https://store.steampowered.com/app/${props.game.appid}`;
</script>

<template>
  <div class="transition group card image-full max-h-52 grow bg-base-100 hover:scale-105 sm:w-80">
    <figure class="min-h-32">
      <v-lazy-image
        :src="headerImage"
        class="transition-opacity opacity-25 grow group-hover:opacity-75"
        alt="Game picture"
      />
    </figure>
    <div class="justify-between gap-4 card-body">
      <section>
        <div class="text-lg font-medium">
          <a
            :href="storeLink"
            target="_blank"
            class="link"
            v-if="game.name && game.name !== 'Unknown'"
            >{{ game.name.trim() }}</a
          >
          <h2 class="" v-else-if="game.name && game.name === 'Unknown'">Unknown</h2>
          <h2 class="" v-else><div class="w-full suspense h-7"></div></h2>
        </div>
        <span v-if="users.length === comparison.users.length" class="text-sm text-neutral-400"
          >All of you own this game!</span
        >
        <span v-else class="text-sm text-neutral-400"
          >{{ users.length }}/{{ comparison.users.length }} of you owns this game!</span
        >
      </section>
      <section class="flex gap-1">
        <template v-for="user in users" :key="user.steamid">
          <div
            class="avatar tooltip first:tooltip-right first:sm:tooltip-top"
            :class="{
              grayscale: filteredUsers.length > 0 && !filteredUsers.includes(user.steamid),
              'grayscale-0': filteredUsers.length > 0 && filteredUsers.includes(user.steamid)
            }"
            :data-tip="user.personaname"
          >
            <div class="w-6 rounded-full">
              <v-lazy-image :src="user.avatarmedium" :alt="user.personaname" />
            </div></div
        ></template>
      </section>
    </div>
  </div>
</template>
