<script setup lang="ts">
import logo from '@/assets/logo.svg';
import ee from '@/assets/flags/ee.svg';
import en from '@/assets/flags/en.svg';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { locale } = useI18n();

const currentFlag = ref(ee);
const authStore = useAuthStore();

function changeLocale(str: string, img: string) {
    locale.value = str;
    currentFlag.value = img;
}
</script>

<template>
    <div class="navbar bg-primary text-primary-content">
        <router-link class="flex flex-shrink-0 items-center mr-4" to="/">
            <img class="w-auto h-10" :src="logo" alt="Logo" />
            <span class="hidden xl:block text-2xl font-bold ml-2">{{ $t('welcome') }}</span>
        </router-link>

        <div class="flex flex-grow">
            <div class="join join-vertical lg:join-horizontal flex-grow flex">
                <router-link to="/Movies" class="btn btn-ghost no-animation join-item flex-grow">{{
                    $t('nav.movies')
                }}</router-link>
                <router-link to="/Cinemas" class="btn btn-ghost no-animation join-item flex-grow">{{
                    $t('nav.cinemas')
                }}</router-link>
                <router-link to="/Events" class="btn btn-ghost no-animation join-item flex-grow">{{
                    $t('nav.events')
                }}</router-link>
                <router-link to="/News" class="btn btn-ghost no-animation join-item flex-grow">{{
                    $t('nav.news')
                }}</router-link>
            </div>
        </div>

        <div class="flex flex-col lg:flex-row-reverse gap-2 justify-end">
            <div class="form-control">
                <input
                    type="text"
                    :placeholder="$t('nav.search')"
                    class="input input-bordered w-24 md:w-auto"
                />
            </div>
            <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-square avatar">
                    <div class="w-auto h-10">
                        <svg
                            class="fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                            width="48"
                            height="48"
                            viewBox="0, 0, 480, 500"
                        >
                            <g id="svgg">
                                <path
                                    d="M161.486 61.974 C 108.220 85.157,88.795 164.580,125.102 210.736 L 141.870 232.054 117.796 249.196 C 90.346 268.742,66.667 313.116,66.667 345.009 C 66.667 377.575,81.513 371.040,91.462 334.095 C 121.524 222.450,278.476 222.450,308.538 334.095 C 318.487 371.040,333.333 377.575,333.333 345.009 C 333.333 313.203,309.678 268.759,282.417 249.348 L 258.556 232.357 276.248 208.428 C 334.792 129.242,251.412 22.836,161.486 61.974 M232.573 87.107 C 314.089 129.260,254.185 251.495,171.289 212.158 C 116.924 186.360,113.776 115.735,165.734 87.497 C 193.620 72.341,203.904 72.281,232.573 87.107 "
                                    stroke="none"
                                ></path>
                            </g>
                        </svg>
                    </div>
                </div>
                <ul
                    tabindex="0"
                    class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
                >
                    <li v-if="authStore.isAuthenticated">
                        <router-link to="/Settings">{{ $t('nav.settings') }}</router-link>
                    </li>
                    <li v-if="!authStore.isAuthenticated">
                        <router-link to="/login">{{ $t('nav.login') }}</router-link>
                    </li>
                    <li v-if="authStore.isAuthenticated">
                        <a @click.prevent="authStore.logout">{{ $t('nav.logout') }}</a>
                    </li>
                    <li v-if="authStore.isAdmin">
                        <router-link to="/admin">{{ $t('nav.admin') }}</router-link>
                    </li>
                </ul>
            </div>
            <label class="swap swap-rotate btn btn-ghost px-1">
                <!-- this hidden checkbox controls the state -->
                <input type="checkbox" class="theme-controller" value="darky" />

                <!-- sun icon -->
                <svg
                    class="swap-off h-10 w-10 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                >
                    <path
                        d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"
                    />
                </svg>

                <!-- moon icon -->
                <svg
                    class="swap-on h-10 w-10 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                >
                    <path
                        d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
                    />
                </svg>
            </label>
            <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost p-0">
                    <div class="w-12 h-auto shadow-lg object-contain mx-1">
                        <img alt="current locale" :src="currentFlag" />
                    </div>
                </div>
                <ul
                    tabindex="0"
                    class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-20 p-1 shadow"
                >
                    <li @click="changeLocale('en', en)" class="">
                        <img alt="English" :src="en" class="w-20 h-auto" />
                    </li>
                    <li @click="changeLocale('ee', ee)">
                        <img alt="Eesti" :src="ee" class="w-20 h-auto" />
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
