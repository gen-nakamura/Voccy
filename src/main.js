import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice';
import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primevue/resources/primevue.min.css";

createApp(App)
  .use(PrimeVue)
  .use(ToastService)
  .use(ConfirmationService)
  .mount('#app');
