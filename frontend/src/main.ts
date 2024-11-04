import './assets/main.css';

import VueProgressBar from '@aacassandra/vue3-progressbar';
import VueTransitions from '@morev/vue-transitions';
import '@morev/vue-transitions/styles';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';

import App from './App.vue';
import router from './router';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(VueTransitions);

const options = {
  color: '#16a34a',
  failedColor: '#dc2626',
  thickness: '4px',
  transition: {
    speed: '0.2s',
    opacity: '0.6s',
    termination: 300
  },
  autoRevert: true,
  location: 'top',
  inverse: false,
  autoFinish: false
};

app.use(VueProgressBar, options);

app.mount('#app');
