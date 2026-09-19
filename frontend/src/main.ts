import '@/styles/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.ts';
import router from '@/router/index.ts';

import App from '@/App.vue';

import en from '@/locales/en.json';
import ee from '@/locales/ee.json';

//import router from './router'

const i18n = createI18n({
    legacy: false,
    locale: 'ee',
    fallbackLocale: 'en',
    messages: {
        en,
        ee,
    },
});

const app = createApp(App);
const pinia = createPinia();

router.beforeEach(async (to) => {
    const authStore = useAuthStore(pinia);

    if (authStore.token && !authStore.user) {
        await authStore.fetchUser();
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return { name: 'Login' };
    }

    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        return { name: 'Home' };
    }
});

app.use(pinia).use(router).use(i18n);

app.mount('#app');
