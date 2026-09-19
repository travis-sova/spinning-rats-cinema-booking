<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

import type { User } from '@/types/user.ts';
import type { ProfileFields } from '@/types/profilefields.ts';

const auth = useAuthStore();

const user = ref<User | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const passwordDialog = ref<HTMLDialogElement | null>(null);

const fetchData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
        const token = localStorage.getItem('token');
        const [UserRes] = await Promise.all([
            axios.get<User>('http://localhost:3000/api/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
        ]);

        user.value = UserRes.data;

        email.value = user.value.email ?? '';
        number.value = String(user.value.number ?? '');
        name.value = user.value.fname + ' ' + user.value.sname;
        dob.value = user.value.dob;
        newsletter.value = user.value.newsletter === 1;

        savedProfile.value = getProfileFields();
    } catch (err) {
        error.value = axios.isAxiosError(err)
            ? err.response?.data?.error || err.message
            : 'Failed to fetch data';
        console.error('Error fetching data:', err);
    } finally {
        isLoading.value = false;
    }
};

const name = ref('');
const dob = ref();
const newsletter = ref(false);

const isDisabled = ref(true);
const isHidden = ref(true);
const email = ref('');

const savedProfile = ref<ProfileFields | null>(null);
const isSaving = ref(false);

function getProfileFields(): ProfileFields {
    return {
        email: email.value,
        number: number.value,
        newsletter: newsletter.value,
    };
}

const changes = computed(() => {
    const saved = savedProfile.value;
    if (!saved) return false;

    return (
        email.value !== saved.email ||
        number.value !== saved.number ||
        newsletter.value !== saved.newsletter
    );
});

function toggleInput() {
    isDisabled.value = !isDisabled.value;
    isHidden.value = !isHidden.value;
}

function saveEmail() {
    isDisabled.value = true;
    isHidden.value = true;
}

const isDisabled1 = ref(true);
const isHidden1 = ref(true);
const number = ref('');

function toggleInput1() {
    isDisabled1.value = !isDisabled1.value;
    isHidden1.value = !isHidden1.value;
}

function saveNumber() {
    isDisabled1.value = true;
    isHidden1.value = true;
}

const isDisabled2 = ref(true);
const password = ref('Parool');

function msg(text: string) {
    alert(text);
}

const deletion = async () => {
    try {
        await auth.deleteUser();
    } catch {
        // Error is already handled by the auth store
    }
};

const update = async () => {
    if (!changes.value || isSaving.value) return;

    const submitted = getProfileFields();
    isSaving.value = true;

    try {
        await auth.updateUser(submitted.email, submitted.number, submitted.newsletter);

        if (!auth.error) {
            savedProfile.value = submitted;
        }
    } finally {
        isSaving.value = false;
    }
};

const oldPassword = ref('');
const newPassword = ref('');
const newPasswordConfirm = ref('');

const changePassword = async () => {
    try {
        await auth.changePassword(oldPassword.value, newPassword.value, newPasswordConfirm.value);
        if (!auth.modalError && passwordDialog.value) {
            passwordDialog.value.close();
        }
    } catch {
        // Error is already handled by the auth store
    }
};

onMounted(() => {
    fetchData();
});
</script>

<template>
    <div v-if="isLoading" class="flex flex-col items-center justify-center p-8 text-gray-500 my-">
        <div
            class="w-10 h-10 border-4 border-gray-200 border-l-blue-600 rounded-full animate-spin mb-4"
        ></div>
        <p>{{ $t('settings.loading') }}</p>
    </div>

    <div
        v-if="error"
        class="p-8 bg-red-50 text-red-600 rounded-lg text-center max-w-2xl mx-auto mt-8 font-medium"
    >
        {{ error }}
    </div>

    <div
        v-if="auth.error"
        class="p-8 bg-red-50 text-red-600 rounded-lg text-center max-w-2xl mx-auto mt-8 font-medium"
    >
        {{ auth.error }}
    </div>

    <div
        v-if="auth.message"
        class="p-8 bg-green-50 text-green-600 rounded-lg text-center max-w-2xl mx-auto mt-8 font-medium"
    >
        {{ auth.message }}
    </div>

    <div v-if="user">
        <div class="py-20">
            <!-- back -->
            <div
                class="mx-auto bg-base-300 w-2/4 px-5 py-5 border border-primary-content rounded-3xl"
            >
                <h1 class="text-center text-2xl font-bold text-primary-content mb-5">
                    {{ $t('settings.settings') }}
                </h1>
                <!-- Mingi profiilikaart -->
                <div class="flex flex-row justify-center h-content pb-5 text-primary-content">
                    <div class="flex flex-col items-center">
                        <h1>{{ name }}</h1>
                        <div class="flex flex-row items-center">
                            <img src="@/assets/star.png" alt="star" class="w-auto h-5 mr-1" />
                            <h1>{{ $t('settings.club') }}</h1>
                        </div>
                    </div>
                    <div class="divider divider-horizontal divider-primary"></div>
                    <!-- Profiilipilt -->
                    <div
                        class="flex flex-col items-center tooltip tooltip-accent hover:bg-accent cursor-pointer"
                        data-tip="Click to change profile picture"
                        @click="msg('Use your imagination')"
                    >
                        <svg
                            class="fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                            width="48"
                            height="48"
                            viewBox="0, 0, 400, 400"
                            preserveAspectRatio="xMidYMid meet"
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

                <!-- erinevad lahtrid -->
                <div
                    class="grid grid-cols-1 md:grid-cols-2 justify-around text-primary-content gap-4"
                >
                    <!-- emaili lahter -->
                    <div>
                        <div class="flex flex-row items-center">
                            <svg
                                version="1.0"
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-6 w-6 fill-current mr-1 mb-1"
                                viewBox="0 0 512 512"
                            >
                                <g
                                    transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                                    stroke="none"
                                >
                                    <path
                                        d="M340 4344 c-30 -8 -59 -19 -65 -25 -11 -11 2161 -2190 2207 -2215 35 -18 121 -18 156 0 46 25 2218 2204 2207 2215 -6 6 -37 17 -70 25 -53 14 -298 16 -2220 15 -1871 0 -2167 -2 -2215 -15z"
                                    />
                                    <path
                                        d="M23 4048 c-17 -50 -18 -123 -18 -1488 0 -1365 1 -1438 18 -1487 10 -29 22 -53 25 -53 4 0 354 347 777 770 l770 770 -770 770 c-423 424 -773 770 -777 770 -3 0 -15 -24 -25 -52z"
                                    />
                                    <path
                                        d="M4295 3330 l-770 -770 770 -770 c423 -423 773 -770 777 -770 3 0 15 24 25 53 17 49 18 122 18 1487 0 1365 -1 1438 -18 1488 -10 28 -22 52 -25 52 -4 0 -354 -346 -777 -770z"
                                    />
                                    <path
                                        d="M1030 1575 c-495 -495 -761 -768 -755 -774 6 -6 37 -17 70 -25 53 -14 299 -16 2215 -16 1916 0 2162 2 2215 16 33 8 64 19 70 25 6 6 -260 279 -757 776 l-767 767 -238 -235 c-218 -216 -245 -239 -317 -275 l-80 -39 -126 0 -126 0 -80 39 c-72 36 -100 60 -315 273 -129 128 -237 233 -240 233 -2 0 -348 -344 -769 -765z"
                                    />
                                </g>
                            </svg>
                            <span class="text-lg">{{ $t('settings.email') }}</span>
                        </div>
                        <div class="flex flex-row items-center">
                            <button
                                class="btn mr-1 text-primary-content"
                                @click="saveEmail"
                                :disabled="isDisabled"
                                v-if="!isHidden"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-6 w-6 fill-current"
                                    viewBox="0 0 1024 1024"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M730.585 78.77v267.815c0 19.692-15.754 37.415-37.416 37.415H273.723c-19.692 0-37.415-15.754-37.415-37.415V78.769h-78.77c-43.323 0-78.769 35.446-78.769 78.77v708.923c0 43.323 35.446 78.769 78.77 78.769h708.923c43.323 0 78.769-35.446 78.769-78.77V220.555L803.446 78.769zM868.43 829.045c0 19.692-15.754 37.416-37.416 37.416h-636.06c-19.692 0-37.416-15.754-37.416-37.416v-328.86c0-19.693 15.754-37.416 37.416-37.416h636.061c19.693 0 37.416 15.754 37.416 37.416zm-380.062-561.23c0 19.692 15.754 37.415 37.416 37.415h90.584c19.693 0 37.416-15.754 37.416-37.416V78.77H490.338z"
                                    />
                                </svg>
                            </button>
                            <button
                                class="btn mr-1 text-primary-content"
                                @click="toggleInput"
                                v-if="isHidden"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-6 w-6 fill-current"
                                    viewBox="0 0 512 512"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M 421.500 4.721 C 417.100 6.251, 411.025 9.172, 408 11.211 C 404.916 13.290, 351.176 66.261, 285.648 131.813 L 168.796 248.707 153.433 304.104 C 144.984 334.572, 138.055 361.231, 138.035 363.346 C 137.969 370.515, 143.329 376, 150.400 376 C 153.542 376, 257.434 347.801, 264 345.166 C 265.375 344.614, 319.636 290.913, 384.579 225.831 C 494.035 116.142, 502.888 107.020, 505.804 100.928 C 510.778 90.538, 512.279 83.152, 511.775 71.560 C 510.985 53.388, 506.223 44.280, 487.972 26.028 C 469.165 7.221, 460.578 2.881, 441 2.288 C 430.502 1.970, 428.803 2.182, 421.500 4.721 M 428.162 30.155 C 424.189 31.681, 420.403 34.545, 413.360 41.353 L 403.897 50.500 433.756 80.302 L 463.615 110.103 472.383 101.008 C 482.364 90.654, 485.092 85.553, 485.749 76.016 C 486.099 70.945, 485.706 68.169, 483.978 63.500 C 482.056 58.305, 480.064 55.805, 469.129 44.871 C 458.320 34.062, 455.666 31.936, 450.712 30.121 C 443.381 27.434, 435.212 27.446, 428.162 30.155 M 51.365 52.493 C 30.878 56.949, 15.367 69.050, 6.496 87.500 C 4.116 92.450, 1.681 98.885, 1.084 101.799 C -0.440 109.249, -0.440 453.751, 1.084 461.201 C 2.732 469.254, 10.161 483.736, 15.961 490.203 C 22.829 497.861, 34.227 505.311, 44.285 508.718 L 52.500 511.500 241.500 511.500 C 396.949 511.500, 431.476 511.260, 436 510.148 C 458.402 504.640, 476.829 486.816, 483.712 464 C 485.160 459.199, 485.419 450.687, 485.746 397 C 485.952 363.175, 485.851 334.051, 485.521 332.279 C 484.684 327.790, 479.259 322.327, 474.809 321.492 C 470.219 320.631, 464.802 323.067, 461.730 327.373 L 459.500 330.500 459 394.023 L 458.500 457.546 455.250 464.146 C 451.397 471.970, 445.119 478.116, 437.175 481.840 L 431.500 484.500 242.500 484.500 L 53.500 484.500 47.782 481.692 C 39.912 477.828, 33.507 471.291, 29.686 463.225 L 26.500 456.500 26.236 283.554 C 25.942 91.157, 25.462 105.169, 32.727 94.224 C 36.976 87.823, 43.180 82.882, 50.847 79.794 C 56.487 77.522, 56.646 77.516, 118.924 77.203 C 179.719 76.897, 181.422 76.836, 184.189 74.865 C 192.198 69.162, 191.533 57.436, 182.938 52.827 C 179.740 51.112, 175.786 51.005, 118.516 51.079 C 71.628 51.141, 56.079 51.468, 51.365 52.493 M 292.744 161.756 L 199.996 254.508 229.752 284.252 L 259.508 313.996 352.256 221.244 L 445.004 128.492 415.248 98.748 L 385.492 69.004 292.744 161.756 M 178.661 311.630 C 173.857 329.027, 170.107 343.440, 170.327 343.660 C 170.739 344.072, 233.143 327.087, 233.954 326.342 C 234.443 325.893, 188.890 280, 187.956 280 C 187.647 280, 183.465 294.234, 178.661 311.630"
                                    />
                                </svg>
                            </button>
                            <input
                                type="text"
                                v-model="email"
                                :disabled="isDisabled"
                                class="input input-bordered w-full max-w-xs bg-base-200"
                            />
                        </div>
                    </div>
                    <!-- tel nr lahter -->
                    <div>
                        <div class="flex flex-row items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-6 w-6 fill-current mr-1 mb-1"
                                viewBox="0 0 28.314 28.323"
                                xml:space="preserve"
                            >
                                <path
                                    d="m27.728 20.384-4.242-4.242a1.982 1.982 0 0 0-1.413-.586h-.002c-.534 0-1.036.209-1.413.586L17.83 18.97l-8.485-8.485 2.828-2.828c.78-.78.78-2.05-.001-2.83L7.929.585A1.986 1.986 0 0 0 6.516 0h-.001C5.98 0 5.478.209 5.101.587L.858 4.83C.729 4.958-.389 6.168.142 8.827c.626 3.129 3.246 7.019 7.787 11.56 6.499 6.499 10.598 7.937 12.953 7.937 1.63 0 2.426-.689 2.604-.867l4.242-4.242c.378-.378.587-.881.586-1.416 0-.534-.208-1.037-.586-1.415zm-5.656 5.658c-.028.028-3.409 2.249-12.729-7.07C-.178 9.452 2.276 6.243 2.272 6.244L6.515 2l4.243 4.244-3.535 3.535a.999.999 0 0 0 0 1.414l9.899 9.899a.999.999 0 0 0 1.414 0l3.535-3.536 4.243 4.244-4.242 4.242z"
                                />
                            </svg>
                            <span class="text-lg">{{ $t('settings.number') }}</span>
                        </div>
                        <div class="flex flex-row items-center">
                            <button
                                class="btn mr-1 text-primary-content"
                                @click="saveNumber"
                                :disabled="isDisabled1"
                                v-if="!isHidden1"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-6 w-6 fill-current"
                                    viewBox="0 0 1024 1024"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M730.585 78.77v267.815c0 19.692-15.754 37.415-37.416 37.415H273.723c-19.692 0-37.415-15.754-37.415-37.415V78.769h-78.77c-43.323 0-78.769 35.446-78.769 78.77v708.923c0 43.323 35.446 78.769 78.77 78.769h708.923c43.323 0 78.769-35.446 78.769-78.77V220.555L803.446 78.769zM868.43 829.045c0 19.692-15.754 37.416-37.416 37.416h-636.06c-19.692 0-37.416-15.754-37.416-37.416v-328.86c0-19.693 15.754-37.416 37.416-37.416h636.061c19.693 0 37.416 15.754 37.416 37.416zm-380.062-561.23c0 19.692 15.754 37.415 37.416 37.415h90.584c19.693 0 37.416-15.754 37.416-37.416V78.77H490.338z"
                                    />
                                </svg>
                            </button>
                            <button
                                class="btn mr-1 text-primary-content"
                                @click="toggleInput1"
                                v-if="isHidden1"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-6 w-6 fill-current"
                                    viewBox="0 0 512 512"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M 421.500 4.721 C 417.100 6.251, 411.025 9.172, 408 11.211 C 404.916 13.290, 351.176 66.261, 285.648 131.813 L 168.796 248.707 153.433 304.104 C 144.984 334.572, 138.055 361.231, 138.035 363.346 C 137.969 370.515, 143.329 376, 150.400 376 C 153.542 376, 257.434 347.801, 264 345.166 C 265.375 344.614, 319.636 290.913, 384.579 225.831 C 494.035 116.142, 502.888 107.020, 505.804 100.928 C 510.778 90.538, 512.279 83.152, 511.775 71.560 C 510.985 53.388, 506.223 44.280, 487.972 26.028 C 469.165 7.221, 460.578 2.881, 441 2.288 C 430.502 1.970, 428.803 2.182, 421.500 4.721 M 428.162 30.155 C 424.189 31.681, 420.403 34.545, 413.360 41.353 L 403.897 50.500 433.756 80.302 L 463.615 110.103 472.383 101.008 C 482.364 90.654, 485.092 85.553, 485.749 76.016 C 486.099 70.945, 485.706 68.169, 483.978 63.500 C 482.056 58.305, 480.064 55.805, 469.129 44.871 C 458.320 34.062, 455.666 31.936, 450.712 30.121 C 443.381 27.434, 435.212 27.446, 428.162 30.155 M 51.365 52.493 C 30.878 56.949, 15.367 69.050, 6.496 87.500 C 4.116 92.450, 1.681 98.885, 1.084 101.799 C -0.440 109.249, -0.440 453.751, 1.084 461.201 C 2.732 469.254, 10.161 483.736, 15.961 490.203 C 22.829 497.861, 34.227 505.311, 44.285 508.718 L 52.500 511.500 241.500 511.500 C 396.949 511.500, 431.476 511.260, 436 510.148 C 458.402 504.640, 476.829 486.816, 483.712 464 C 485.160 459.199, 485.419 450.687, 485.746 397 C 485.952 363.175, 485.851 334.051, 485.521 332.279 C 484.684 327.790, 479.259 322.327, 474.809 321.492 C 470.219 320.631, 464.802 323.067, 461.730 327.373 L 459.500 330.500 459 394.023 L 458.500 457.546 455.250 464.146 C 451.397 471.970, 445.119 478.116, 437.175 481.840 L 431.500 484.500 242.500 484.500 L 53.500 484.500 47.782 481.692 C 39.912 477.828, 33.507 471.291, 29.686 463.225 L 26.500 456.500 26.236 283.554 C 25.942 91.157, 25.462 105.169, 32.727 94.224 C 36.976 87.823, 43.180 82.882, 50.847 79.794 C 56.487 77.522, 56.646 77.516, 118.924 77.203 C 179.719 76.897, 181.422 76.836, 184.189 74.865 C 192.198 69.162, 191.533 57.436, 182.938 52.827 C 179.740 51.112, 175.786 51.005, 118.516 51.079 C 71.628 51.141, 56.079 51.468, 51.365 52.493 M 292.744 161.756 L 199.996 254.508 229.752 284.252 L 259.508 313.996 352.256 221.244 L 445.004 128.492 415.248 98.748 L 385.492 69.004 292.744 161.756 M 178.661 311.630 C 173.857 329.027, 170.107 343.440, 170.327 343.660 C 170.739 344.072, 233.143 327.087, 233.954 326.342 C 234.443 325.893, 188.890 280, 187.956 280 C 187.647 280, 183.465 294.234, 178.661 311.630"
                                    />
                                </svg>
                            </button>
                            <input
                                type="text"
                                v-model="number"
                                :disabled="isDisabled1"
                                class="input input-bordered w-full max-w-xs bg-base-200"
                            />
                        </div>
                    </div>
                    <!-- Parooli lahter -->
                    <div>
                        <div class="flex flex-row items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                class="h-6 w-6 fill-current mr-1 my-1"
                            >
                                <path
                                    d="M18 7V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v3H3v14h18V7zM8 4h8v3H8zm11 15H5V9h14z"
                                />
                                <path d="M11 14.722V17h2v-2.278a2 2 0 1 0-2 0z" />
                            </svg>
                            <span class="text-lg">{{ $t('settings.password') }}</span>
                        </div>
                        <div class="flex flex-row items-center">
                            <!-- modal -->
                            <button class="btn mr-1" onclick="password.showModal()">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-6 w-6 fill-current"
                                    viewBox="0 0 512 512"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M 421.500 4.721 C 417.100 6.251, 411.025 9.172, 408 11.211 C 404.916 13.290, 351.176 66.261, 285.648 131.813 L 168.796 248.707 153.433 304.104 C 144.984 334.572, 138.055 361.231, 138.035 363.346 C 137.969 370.515, 143.329 376, 150.400 376 C 153.542 376, 257.434 347.801, 264 345.166 C 265.375 344.614, 319.636 290.913, 384.579 225.831 C 494.035 116.142, 502.888 107.020, 505.804 100.928 C 510.778 90.538, 512.279 83.152, 511.775 71.560 C 510.985 53.388, 506.223 44.280, 487.972 26.028 C 469.165 7.221, 460.578 2.881, 441 2.288 C 430.502 1.970, 428.803 2.182, 421.500 4.721 M 428.162 30.155 C 424.189 31.681, 420.403 34.545, 413.360 41.353 L 403.897 50.500 433.756 80.302 L 463.615 110.103 472.383 101.008 C 482.364 90.654, 485.092 85.553, 485.749 76.016 C 486.099 70.945, 485.706 68.169, 483.978 63.500 C 482.056 58.305, 480.064 55.805, 469.129 44.871 C 458.320 34.062, 455.666 31.936, 450.712 30.121 C 443.381 27.434, 435.212 27.446, 428.162 30.155 M 51.365 52.493 C 30.878 56.949, 15.367 69.050, 6.496 87.500 C 4.116 92.450, 1.681 98.885, 1.084 101.799 C -0.440 109.249, -0.440 453.751, 1.084 461.201 C 2.732 469.254, 10.161 483.736, 15.961 490.203 C 22.829 497.861, 34.227 505.311, 44.285 508.718 L 52.500 511.500 241.500 511.500 C 396.949 511.500, 431.476 511.260, 436 510.148 C 458.402 504.640, 476.829 486.816, 483.712 464 C 485.160 459.199, 485.419 450.687, 485.746 397 C 485.952 363.175, 485.851 334.051, 485.521 332.279 C 484.684 327.790, 479.259 322.327, 474.809 321.492 C 470.219 320.631, 464.802 323.067, 461.730 327.373 L 459.500 330.500 459 394.023 L 458.500 457.546 455.250 464.146 C 451.397 471.970, 445.119 478.116, 437.175 481.840 L 431.500 484.500 242.500 484.500 L 53.500 484.500 47.782 481.692 C 39.912 477.828, 33.507 471.291, 29.686 463.225 L 26.500 456.500 26.236 283.554 C 25.942 91.157, 25.462 105.169, 32.727 94.224 C 36.976 87.823, 43.180 82.882, 50.847 79.794 C 56.487 77.522, 56.646 77.516, 118.924 77.203 C 179.719 76.897, 181.422 76.836, 184.189 74.865 C 192.198 69.162, 191.533 57.436, 182.938 52.827 C 179.740 51.112, 175.786 51.005, 118.516 51.079 C 71.628 51.141, 56.079 51.468, 51.365 52.493 M 292.744 161.756 L 199.996 254.508 229.752 284.252 L 259.508 313.996 352.256 221.244 L 445.004 128.492 415.248 98.748 L 385.492 69.004 292.744 161.756 M 178.661 311.630 C 173.857 329.027, 170.107 343.440, 170.327 343.660 C 170.739 344.072, 233.143 327.087, 233.954 326.342 C 234.443 325.893, 188.890 280, 187.956 280 C 187.647 280, 183.465 294.234, 178.661 311.630"
                                    />
                                </svg>
                            </button>
                            <dialog id="password" class="modal" ref="passwordDialog">
                                <div class="modal-box">
                                    <h3 class="text-lg font-bold">{{ $t('settings.change') }}</h3>
                                    <div
                                        v-if="auth.modalError"
                                        class="p-8 bg-red-50 text-red-600 rounded-lg text-center max-w-lg mx-auto my-2 font-medium"
                                    >
                                        {{ auth.modalError }}
                                    </div>
                                    <form id="password" class="mx-auto flex flex-col items-center">
                                        <input
                                            type="password"
                                            v-model="oldPassword"
                                            :placeholder="$t('settings.passOld')"
                                            class="input input-bordered w-full max-w-xs bg-base-200 my-1"
                                        />
                                        <input
                                            type="password"
                                            v-model="newPassword"
                                            :placeholder="$t('settings.passNew')"
                                            class="input input-bordered w-full max-w-xs bg-base-200 my-1"
                                        />
                                        <input
                                            type="password"
                                            v-model="newPasswordConfirm"
                                            :placeholder="$t('settings.passConfirm')"
                                            class="input input-bordered w-full max-w-xs bg-base-200 my-1"
                                        />
                                    </form>
                                    <div class="modal-action">
                                        <form method="dialog">
                                            <button id="changeClose" class="btn">
                                                {{ $t('settings.close') }}
                                            </button>
                                        </form>
                                        <button
                                            type="submit"
                                            form="password"
                                            class="btn mr-1 text-primary-content"
                                            @click="changePassword"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                class="h-6 w-6 fill-current"
                                                viewBox="0 0 1024 1024"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M730.585 78.77v267.815c0 19.692-15.754 37.415-37.416 37.415H273.723c-19.692 0-37.415-15.754-37.415-37.415V78.769h-78.77c-43.323 0-78.769 35.446-78.769 78.77v708.923c0 43.323 35.446 78.769 78.77 78.769h708.923c43.323 0 78.769-35.446 78.769-78.77V220.555L803.446 78.769zM868.43 829.045c0 19.692-15.754 37.416-37.416 37.416h-636.06c-19.692 0-37.416-15.754-37.416-37.416v-328.86c0-19.693 15.754-37.416 37.416-37.416h636.061c19.693 0 37.416 15.754 37.416 37.416zm-380.062-561.23c0 19.692 15.754 37.415 37.416 37.415h90.584c19.693 0 37.416-15.754 37.416-37.416V78.77H490.338z"
                                                />
                                            </svg>
                                            {{ $t('settings.save') }}
                                        </button>
                                    </div>
                                </div>
                            </dialog>
                            <!-- modal -->
                            <input
                                type="text"
                                :value="isDisabled2 ? '' : password"
                                :placeholder="$t('settings.pass')"
                                :disabled="isDisabled2"
                                class="input input-bordered w-full max-w-xs bg-base-200"
                            />
                        </div>
                    </div>
                    <!-- Sünnikuupäev -->
                    <div>
                        <div class="flex flex-row items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 25 25"
                                class="h-6 w-6 fill-current mr-1 my-1"
                            >
                                <g id="calendar_number" data-name="calendar number">
                                    <path
                                        class="cls-1"
                                        d="M22.5 3H21V2a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1h-4V2a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1H7V2a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v1H2.5A1.5 1.5 0 0 0 1 4.5v18A1.5 1.5 0 0 0 2.5 24h20a1.5 1.5 0 0 0 1.5-1.5v-18A1.5 1.5 0 0 0 22.5 3zM19 2h1v3h-1zm-7 0h1v3h-1zM5 2h1v3H5zM2.5 4H4v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V4h4v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V4h4v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V4h1.5a.5.5 0 0 1 .5.5V8H2V4.5a.5.5 0 0 1 .5-.5zm20 19h-20a.5.5 0 0 1-.5-.5V9h21v13.5a.5.5 0 0 1-.5.5z"
                                    />
                                    <path
                                        class="cls-1"
                                        d="M10.62 15.89a3.35 3.35 0 0 0-1.28-.26h-.18l2.14-2.38.09-.12a.29.29 0 0 0 0-.14v-.39a.26.26 0 0 0-.07-.2.25.25 0 0 0-.19-.07h-4.4a.24.24 0 0 0-.18.07.26.26 0 0 0-.07.2v.4a.25.25 0 0 0 .07.19.28.28 0 0 0 .18.06H10L7.85 15.6l-.08.13a.33.33 0 0 0 0 .17v.3a.27.27 0 0 0 .07.19.29.29 0 0 0 .19.07H9a2 2 0 0 1 1.2.31 1.17 1.17 0 0 1 .43 1 1.26 1.26 0 0 1-.48 1.07 1.93 1.93 0 0 1-1.15.4 3.53 3.53 0 0 1-.72-.08 1.53 1.53 0 0 1-.64-.31 1.15 1.15 0 0 1-.38-.62.31.31 0 0 0-.18-.23.27.27 0 0 0-.18 0h-.54a.24.24 0 0 0-.17.06.22.22 0 0 0-.07.16 1.65 1.65 0 0 0 .2.7 1.91 1.91 0 0 0 .54.64 2.56 2.56 0 0 0 .87.46 3.79 3.79 0 0 0 1.27.16 3.55 3.55 0 0 0 1.46-.28 2.42 2.42 0 0 0 1-.8 2.12 2.12 0 0 0 .37-1.27 2.15 2.15 0 0 0-.31-1.21 1.85 1.85 0 0 0-.9-.73zM18.47 14.05a2.73 2.73 0 0 0-.49-1 2.26 2.26 0 0 0-.86-.65 3.1 3.1 0 0 0-1.29-.24 3 3 0 0 0-1.28.24 2.26 2.26 0 0 0-.86.65 2.93 2.93 0 0 0-.5 1A4.76 4.76 0 0 0 13 15.2V17.17a5.31 5.31 0 0 0 .17 1.15 2.69 2.69 0 0 0 .49 1 2.09 2.09 0 0 0 .86.65 3.1 3.1 0 0 0 1.29.24 3.11 3.11 0 0 0 1.3-.24 2.06 2.06 0 0 0 .85-.65 2.86 2.86 0 0 0 .49-1 4 4 0 0 0 .17-1.15V15.2a4 4 0 0 0-.15-1.15zm-.91 2.43v.63a2.59 2.59 0 0 1-.43 1.55 1.49 1.49 0 0 1-1.28.57 1.48 1.48 0 0 1-1.27-.57 2.59 2.59 0 0 1-.44-1.55V15.27a2.68 2.68 0 0 1 .44-1.55 1.44 1.44 0 0 1 1.27-.58 1.47 1.47 0 0 1 1.28.58 2.68 2.68 0 0 1 .43 1.55v.61z"
                                    />
                                </g>
                            </svg>
                            <span class="text-lg">{{ $t('settings.dob') }}</span>
                        </div>
                        <div
                            class="tooltip tooltip-accent w-full max-w-sm hover:outline cursor-pointer"
                            data-tip="Contact support to change DOB"
                        >
                            <input
                                type="text"
                                :value="dob"
                                disabled
                                class="input input-bordered w-full bg-base-200"
                            />
                        </div>
                    </div>
                </div>

                <div class="mt-5">
                    <div class="grid grid-cols-8 justify-center">
                        <!-- uudiskirjaga liitumine -->
                        <div class="col-start-1 col-end-3">
                            <div class="form-control">
                                <label class="label cursor-pointer">
                                    <input
                                        type="checkbox"
                                        class="toggle toggle-success"
                                        v-model="newsletter"
                                    />
                                    <span class="label-text text-base">{{
                                        $t('settings.join')
                                    }}</span>
                                </label>
                            </div>
                        </div>
                        <!-- konto kustutamine -->
                        <!-- Open the modal using ID.showModal() method -->
                        <button
                            class="btn btn-error col-start-5"
                            onclick="deletionModal.showModal()"
                        >
                            {{ $t('settings.delete') }}
                        </button>
                        <dialog id="deletionModal" class="modal">
                            <div class="modal-box">
                                <h3 class="text-lg font-bold">{{ $t('settings.account') }}</h3>
                                <div v-if="auth.error" class="alert alert-error p-3 text-sm">
                                    {{ auth.error }}
                                </div>
                                <p class="py-4">{{ $t('settings.confirm') }}</p>
                                <div class="modal-action">
                                    <form method="dialog">
                                        <!-- if there is a button in form, it will close the modal -->
                                        <button class="btn btn-success">
                                            {{ $t('settings.close') }}
                                        </button>
                                    </form>
                                    <form @submit.prevent="deletion">
                                        <button class="btn btn-error">
                                            {{ $t('settings.delete') }}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </dialog>
                        <!-- Salvesta muudatused -->
                        <button
                            v-if="changes"
                            type="button"
                            :disabled="isSaving"
                            @click="update"
                            class="btn btn-success col-end-9"
                        >
                            {{ $t('settings.save') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
