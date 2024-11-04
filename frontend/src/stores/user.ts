import { defineStore } from 'pinia';
import type { Comparison, User } from 'steam';
import { computed, ref } from 'vue';
import { useComparisonStore } from './comparison';

export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref({} as User | null);
    const friends = ref([] as User[]);
    const userGames = ref([] as any[]);

    const isLoggedIn = computed(() => {
      if (user.value === null) return false;
      if (user.value.steamid) {
        return true;
      }
      return false;
    });

    const login = (u: User) => {
      user.value = u;
      console.log('Signed in using:', user.value);
    };

    const fetchUserGames = (): Promise<void> => {
      return new Promise<void>(async (resolve, reject) => {
        try {
          if (userGames.value.length > 0) {
            resolve();
            return;
          }
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/steam/${user.value?.steamid}/games`,
            {
              credentials: 'include'
            }
          );
          const json = await response.json();
          userGames.value = json.data;
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    };

    const fetchFriends = (): Promise<void> => {
      // TODO: User can have a private friend list
      return new Promise<void>(async (resolve, reject) => {
        try {
          if (friends.value.length > 0) {
            console.log("Don't fetch friends, already fetched recently");
            resolve();
            return;
          }
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/steam/${user.value?.steamid}/friends`, {
            credentials: 'include'
          })
            .then(async (response) => {
              if (!response.ok) reject(response);
              const json = await response.json();
              friends.value = json.data;
              resolve();
            })
            .catch((e) => {
              console.log('Error fetching friends', e);
              reject(e);
            });
        } catch (error) {
          console.log('Error fetching friends', error);
          reject(error);
        }
      });
    };

    const resetFriends = () => {
      friends.value = [];
    };

    const signOut = () => {
      user.value = null;
      friends.value = [];
      userGames.value = [];

      const comparisonStore = useComparisonStore();
      comparisonStore.currentComparison = {} as Comparison;

      console.log('Signed out');
    };

    return {
      user,
      isLoggedIn,
      login,
      userGames,
      fetchUserGames,
      fetchFriends,
      friends,
      resetFriends,
      signOut
    };
  },
  {
    persist: true
  }
);
