import { createRouter, createWebHistory } from 'vue-router';

import MyHome from '@/views/MyHome.vue';
import MyNews from '@/views/MyNews.vue';
import MyMovies from '@/views/MyMovies.vue';
import MyCinemas from '@/views/MyCinemas.vue';
import MyEvents from '@/views/MyEvents.vue';
import MyTickets from '@/views/MyTickets.vue';
import MySettings from '@/views/MySettings.vue';
import My404Error from '@/views/My404Error.vue';
import MyMovieDetails from '@/views/MyMovieDetails.vue';
import MyPurchase from '@/views/MyPurchase.vue';
import MyEventTickets from '@/views/MyEventTickets.vue';
import MyEventPurchase from '@/views/MyEventPurchase.vue';
import MyNewsDetails from '@/views/MyNewsDetails.vue';
import MyAdminView from '@/views/MyAdminView.vue';
import MyLogin from '@/views/auth/MyLogin.vue';
import MyRegister from '@/views/auth/MyRegister.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'Home', component: MyHome },
        { path: '/News', name: 'News', component: MyNews },
        { path: '/Movies', name: 'Movies', component: MyMovies },
        { path: '/Cinemas', name: 'Cinemas', component: MyCinemas },
        { path: '/Events', name: 'Events', component: MyEvents },

        { path: '/Movie/tickets/:id', name: 'Tickets', component: MyTickets, props: true },
        { path: '/Movies/:id', name: 'MovieDetails', component: MyMovieDetails, props: true },
        { path: '/Movie/:id/purchase', name: 'Purchase', component: MyPurchase, props: true },

        {
            path: '/Event/tickets/:id',
            name: 'EventTickets',
            component: MyEventTickets,
            props: true,
        },
        {
            path: '/Event/:id/purchase',
            name: 'EventPurchase',
            component: MyEventPurchase,
            props: true,
        },

        { path: '/News/:id', name: 'NewsDetails', component: MyNewsDetails, props: true },

        { path: '/Settings', name: 'Settings', component: MySettings },

        {
            path: '/Admin',
            name: 'Admin',
            component: MyAdminView,
            meta: { requiresAuth: true, requiresAdmin: true },
        },

        {
            path: '/login',
            name: 'Login',
            component: MyLogin,
            meta: { requiresAuth: false, requiresAdmin: false },
        },
        {
            path: '/register',
            name: 'Register',
            component: MyRegister,
            meta: { requiresAuth: false, requiresAdmin: false },
        },

        { path: '/:pathMatch(.*)*', name: '404error', component: My404Error },
    ],
    scrollBehavior() {
        return { top: 0, left: 0 };
    },
});

export default router;
