import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'

import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
import { createPinia } from 'pinia';
import '@/style.css';

/* Theme variables */
import './theme/variables.css';

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(createPinia())
  .use(Toast, {
    position: POSITION.BOTTOM_CENTER,
    timeout: 3000,
    closeOnClick: true,
    pauseOnHover: true,
    transition: "Vue-Toastification__fade",
    maxToasts: 1
  });

router.isReady().then(() => {
  app.mount('#app');
});
