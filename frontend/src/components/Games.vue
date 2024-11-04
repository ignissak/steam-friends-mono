<script setup lang="ts">
import { sort } from 'fast-sort';
import type { Comparison, Game, User } from 'steam';
import { inject, onMounted, ref, toRaw } from 'vue';
import GameCard from './GameCard.vue';
/** @ts-ignore */
import VLazyImage from 'v-lazy-image';

const props = defineProps<{
  comparison: Comparison;
}>();

const emit = defineEmits(['onGamesCalculated']);

const progress = inject('progress') as any;

const comparison = toRaw(props.comparison); // we don't need this to be reactive
let initialSortedGames: { game: Game; users: User[] }[] = [];
const users = comparison.users;
if (comparison.calculated.length === 0) {
  const allGames: Record<string, Game[]> = {};
  for (const user of users) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/steam/${user.steamid}/games`,
        {
          credentials: 'include'
        }
      );
      const json = await response.json();
      const games = json.data;
      allGames[user.steamid] = games;
      // user fetching section should take maximum of 25% of progress
      progress.increase(25 / users.length);
    } catch (e) {
      console.error('User not found?', e);
      allGames[user.steamid] = [];
    }
  }

  // we want to find games that are in all users' libraries
  // also we want to track how many users have a certain game
  // map it as a dictionary where key is app id and value is an object containing count and game info
  const gamesInCommon: Record<string, { game: Game; users: User[] }> = {};
  for (const user of users) {
    if (!allGames[user.steamid]) {
      console.warn('No games for user', user.steamid);
      continue;
    }
    for (const game of allGames[user.steamid]) {
      if (!game.appid) continue;
      if (gamesInCommon[game.appid]) {
        gamesInCommon[game.appid].users.push(user);
      } else {
        gamesInCommon[game.appid] = {
          users: [user],
          game
        };
      }
    }
    progress.increase(25 / users.length);
  }

  // sort by count
  initialSortedGames = sort(Object.values(gamesInCommon)).desc((entry) => entry.users.length);
} else {
  initialSortedGames = comparison.calculated;
}
const sortedGames = ref(initialSortedGames);

// emit event to parent
emit('onGamesCalculated', sortedGames.value);

onMounted(async () => {
  // fetch every name that is missing for games
  const appIds = [];
  for (const entry of sortedGames.value) {
    if (entry.game.name) continue;
    appIds.push(entry.game.appid);
  }
  if (appIds.length === 0) {
    progress.finish();
    return;
  }
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/steam/games`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ appIds, liveData: true })
    });
    const json = await response.json();

    // update game names
    for (const entry of sortedGames.value) {
      if (entry.game.name) continue;
      if (json.data[entry.game.appid!!] && json.data[entry.game.appid!!].name) {
        entry.game.name = json.data[entry.game.appid!!].name;
      } else {
        entry.game.name = 'Unknown';
      }
    }
    progress.finish();
  } catch (e) {
    console.error('Failed to fetch game names', e);
    progress.finish();
  }
});

let nameFilter = '';
// TODO: User filter
let userFilter = ref([] as string[]);

const selectUser = async (user: User) => {
  let value = userFilter.value;
  if (value.includes(user.steamid)) {
    value = value.filter((entry) => entry !== user.steamid);
  } else {
    value.push(user.steamid);
  }
  userFilter.value = value;
  handleFilterChange();
};

const handleFilterChange = async () => {
  let value = sortedGames.value;
  if (nameFilter.length > 0) {
    console.debug('Filtering games', nameFilter);
    value = initialSortedGames.filter((entry) => {
      return entry.game.name?.toLowerCase().includes(nameFilter.toLowerCase());
    });
  } else {
    value = initialSortedGames;
  }
  if (nameFilter.length === 0) {
    console.debug('Sorting by initial count');
    value = initialSortedGames;
  } else {
    console.debug('Sorting by count');
    value = sort(value).desc((entry) => entry.users.length);
  }
  // filter with user filter, using for loop
  // only keep games that have all users in user filter
  if (userFilter.value.length > 0) {
    console.debug('Filtering games by user filter');
    const filteredGames = [];
    for (const entry of value) {
      let hasAllUsers = true;
      for (const user of userFilter.value) {
        if (!entry.users.find((entry) => entry.steamid === user)) {
          hasAllUsers = false;
          break;
        }
      }
      if (hasAllUsers) {
        filteredGames.push(entry);
      }
    }
    value = filteredGames;
  }
  sortedGames.value = value;
};

const reset = async () => {
  nameFilter = '';
  userFilter.value = [];
  handleFilterChange();
};

handleFilterChange();
</script>

<template>
  <section
    id="filters"
    class="flex flex-col items-center justify-between gap-1 mb-4 sm:flex-row sm:items-end sm:gap-4"
  >
    <div class="items-end w-full join grow">
      <label class="w-full form-control join-item">
        <div class="label">
          <span class="label-text">Game name</span>
        </div>
        <input
          type="text"
          v-model="nameFilter"
          placeholder="Type here"
          class="w-full input input-bordered input-sm"
          @input="handleFilterChange"
        />
      </label>
      <button
        @click="
          () => {
            nameFilter = '';
            handleFilterChange();
          }
        "
        class="btn btn-outline btn-primary join-item btn-sm"
        :disabled="nameFilter.length === 0"
      >
        Clear
      </button>
    </div>
    <div class="w-full mb-3 form-control grow sm:mb-auto sm:w-auto">
      <div class="label">
        <span class="label-text">Filter by user</span>
      </div>
      <div class="flex items-center gap-1">
        <template v-for="user in users" :key="user.steamid">
          <button
            class="avatar tooltip first:tooltip-right sm:first:tooltip-top"
            :data-tip="user.personaname"
            @click="selectUser(user)"
          >
            <div
              class="w-8 transition-all rounded-full hover:grayscale-0"
              :class="{
                'border-2 border-blue-400 grayscale-0': userFilter.includes(user.steamid),
                grayscale: !userFilter.includes(user.steamid)
              }"
            >
              <v-lazy-image :src="user.avatarmedium" :alt="user.personaname"></v-lazy-image>
            </div>
          </button>
        </template>
      </div>
    </div>
    <button
      @click="reset"
      class="w-full btn btn-outline btn-primary join-item btn-sm grow sm:w-auto"
      :disabled="nameFilter.length === 0 && userFilter.length === 0"
    >
      Reset all
    </button>
  </section>

  <section class="flex flex-row flex-wrap gap-4 mb-16" id="games">
    <template v-for="entry in sortedGames" :key="entry.game.appid!!">
      <GameCard
        :game="entry.game"
        :users="entry.users"
        :comparison="props.comparison"
        :filtered-users="userFilter"
      />
    </template>
  </section>
</template>
