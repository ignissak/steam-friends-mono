<script setup lang="ts">
import { useComparisonStore } from '@/stores/comparison';
import { useUserStore } from '@/stores/user';
import { useUtilsStore } from '@/stores/utils';
import { sort } from 'fast-sort';
import type { User } from 'steam';
import { v4 as uuidv4 } from 'uuid';
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';
/** @ts-ignore */
import VLazyImage from 'v-lazy-image';

const emit = defineEmits(['reloadComponent']);
const progress = inject('progress') as any;
let error = ref('');
const userStore = useUserStore();
const router = useRouter();

try {
  await userStore.fetchFriends();
  progress.increase(50);
} catch (e) {
  if ((e as any).status === 401) {
    progress.fail();
    await router.push('/signout');
  }
  error.value = 'Failed to fetch friends. Check if your friend list is public and try again later.';
  progress.fail();
}
const utilsStore = useUtilsStore();
const comparisonStore = useComparisonStore();

const MAX_SELECT = 9;

let friends = ref(userStore.friends);

let selectedFriends = ref([] as User[]);
let filter = '';
let sortBy: 'abc' | 'online' = 'abc';

const handleFilterChange = async () => {
  let value = friends.value;
  if (filter.length > 0) {
    console.debug('Filtering friends');
    value = userStore.friends.filter((friend) => {
      return (
        friend.personaname.toLowerCase().includes(filter.toLowerCase()) ||
        friend.realname?.toLowerCase().includes(filter.toLowerCase())
      );
    });
  } else {
    value = userStore.friends;
  }
  if (sortBy === 'abc') {
    console.debug('Sorting alphabetically');
    value = sort(value).asc((friend) => friend.personaname);
  } else if (sortBy === 'online') {
    console.debug('Sorting by online status');
    // personastate = 1 means online, 0 = offline, other is treated as 0
    value = sort(value).asc((friend) => {
      if (friend.personastate === 1) {
        return -1;
      } else {
        return 1;
      }
    });
  }
  // sort if selected
  if (selectedFriends.value.length > 0) {
    console.debug('Sorting selected friends to top');
    value = sort(value).asc((friend) => {
      if (selectedFriends.value.includes(friend)) {
        return -1;
      } else {
        return 1;
      }
    });
  }
  friends.value = value;
};

const handleSelect = async (friend: User) => {
  if (selectedFriends.value.length >= MAX_SELECT && !selectedFriends.value.includes(friend)) {
    shakeFooter();
    return;
  }
  if (selectedFriends.value.includes(friend)) {
    selectedFriends.value = selectedFriends.value.filter((f) => f !== friend);
  } else {
    selectedFriends.value.push(friend);
  }
  handleFilterChange();
};

handleFilterChange().then(() => {
  progress.finish();
});

const reset = async () => {
  filter = '';
  sortBy = 'abc';
  selectedFriends.value = [];
  handleFilterChange();
};

const reloadComponent = async () => {
  if (
    utilsStore.lastReloadNewCompare === 0 ||
    Date.now() - utilsStore.lastReloadNewCompare > 60 * 10 * 1000
  ) {
    utilsStore.lastReloadNewCompare = Date.now();
    userStore.resetFriends();
    emit('reloadComponent');
  }
};

const submit = async () => {
  try {
    comparisonStore.currentComparison.id = uuidv4();
    comparisonStore.currentComparison.users = [userStore.user!!, ...selectedFriends.value];
    comparisonStore.currentComparison.createdAt = Date.now();
    comparisonStore.currentComparison.calculated = [];
    router.push('/comparison/' + comparisonStore.currentComparison.id);
  } catch (e) {
    console.error(e);
  }
};

let shake = ref(false);
const shakeFooter = () => {
  if (shake.value) return;
  shake.value = true;
  setTimeout(() => {
    shake.value = false;
  }, 1000);
};
</script>

<template>
  <main class="container">
    <div class="mb-4">
      <h2 class="">Select friends you want to compare with (up to {{ MAX_SELECT }})</h2>
      <p
        class="text-sm text-neutral-400"
        v-if="Date.now() - utilsStore.lastReloadNewCompare > 60 * 10 * 1000"
      >
        Friend list may be not updated. If you wish to manually refresh, please click
        <span class="link" @click="reloadComponent">here</span>.
      </p>
    </div>
    <section
      id="filters"
      class="flex flex-col items-end justify-between gap-1 mb-4 md:flex-row md:gap-4"
    >
      <!-- Name filter -->
      <div class="items-end w-full join grow">
        <label class="w-full form-control join-item">
          <div class="label">
            <span class="label-text">Filter names</span>
          </div>
          <input
            type="text"
            v-model="filter"
            placeholder="Type here"
            class="w-full input input-bordered input-sm"
            @input="handleFilterChange"
          />
        </label>
        <button
          @click="
            () => {
              filter = '';
              handleFilterChange();
            }
          "
          class="btn btn-outline btn-primary join-item btn-sm"
          :disabled="filter.length === 0"
        >
          Clear
        </button>
      </div>
      <!-- Sort by-->
      <label class="w-full form-control grow">
        <div class="label">
          <span class="label-text">Sort by</span>
        </div>
        <select
          class="w-full select select-bordered select-sm"
          v-model="sortBy"
          @change="handleFilterChange"
        >
          <option value="abc">Alphabetically</option>
          <option value="online">Online status</option>
        </select>
      </label>
      <!-- Reset button -->
      <button class="btn btn-sm" @click="reset">Reset all</button>
    </section>

    <p v-if="error" class="py-2 text-center bg-red-500 rounded-lg text-neutral-100">{{ error }}</p>

    <section class="flex flex-row flex-wrap gap-4 mb-16">
      <template v-for="friend in friends" :key="friend.steamid">
        <div
          class="flex flex-row items-center w-full gap-3 p-2 text-left transition-all border rounded indicator border-neutral-900 hover:bg-neutral-950 sm:w-56 sm:grow md:grow-0"
          :class="{
            'bg-neutral-950': selectedFriends.includes(friend),
            'cursor-pointer':
              selectedFriends.length < MAX_SELECT ||
              (selectedFriends.includes(friend) && selectedFriends.length >= MAX_SELECT),
            'cursor-not-allowed opacity-50':
              !selectedFriends.includes(friend) && selectedFriends.length >= MAX_SELECT
          }"
          @click="handleSelect(friend)"
        >
          <button
            :class="{
              hidden: !selectedFriends.includes(friend)
            }"
            class="badge indicator-item"
          >
            -
          </button>
          <!-- TODO: Remove from selection -->
          <div class="avatar indicator">
            <span
              class="w-2 h-2 bg-green-600 rounded-full indicator-item"
              v-if="friend.personastate === 1"
            ></span>
            <div class="w-12 rounded">
              <v-lazy-image :src="friend.avatarfull" alt="" />
            </div>
          </div>
          <div class="select-none">
            <h2 class="text-sm truncate max-w-36 text-neutral-100">{{ friend.personaname }}</h2>
            <p class="text-xs text-gray-500 truncate max-w-36">{{ friend.realname }}</p>
          </div>
        </div>
      </template>
    </section>
  </main>
  <transition-slide :offset="[0, 32]">
    <footer
      class="container bg-transparent btm-nav bg-gradient-to-t from-base-100 to-transparent"
      v-if="selectedFriends.length > 0"
      :class="{ shake: shake }"
    >
      <button class="btn" @click="submit">
        Continue with {{ selectedFriends.length }}/{{ MAX_SELECT }} friends selected →
      </button>
    </footer>
  </transition-slide>
</template>

<style>
.shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
