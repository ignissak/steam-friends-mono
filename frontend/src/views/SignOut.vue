<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useCookies } from '@vueuse/integrations/useCookies';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const useRoute = useRouter();

console.log('Signing out');
const { remove } = useCookies(['steam-session']);
remove('steam-session', { expires: new Date(0), domain: 'localhost' });
remove('steam-session', { expires: new Date(0), domain: 'steam.bordas.sk' });

userStore.signOut();
useRoute.push('/');
</script>
