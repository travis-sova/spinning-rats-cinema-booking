<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.ts';
import type { User } from '@/types/user.ts';
import type { ProfileFields } from '@/types/profilefields.ts';

const API = 'http://localhost:3000/api';
const auth = useAuthStore();
const { t } = useI18n();
const user = ref<User | null>(null);
const email = ref('');
const number = ref('');
const dob = ref('');
const newsletter = ref(false);
const savedProfile = ref<ProfileFields | null>(null);
const isLoading = ref(true);
const isSaving = ref(false);
const isChangingPassword = ref(false);
const loadError = ref('');
const saveMessage = ref('');
const passwordMessage = ref('');
const passwordDialog = ref<HTMLDialogElement | null>(null);
const deletionDialog = ref<HTMLDialogElement | null>(null);
const oldPassword = ref('');
const newPassword = ref('');
const newPasswordConfirm = ref('');

const displayName = computed(() => {
    if (!user.value) return '';
    return [user.value.fname, user.value.sname].filter(Boolean).join(' ') || user.value.username;
});

const initials = computed(
    () =>
        displayName.value
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('') || '?',
);

const hasChanges = computed(() => {
    const saved = savedProfile.value;
    return (
        !!saved &&
        (email.value !== saved.email ||
            number.value !== saved.number ||
            newsletter.value !== saved.newsletter)
    );
});

function currentProfile(): ProfileFields {
    return { email: email.value.trim(), number: number.value.trim(), newsletter: newsletter.value };
}

onMounted(async () => {
    try {
        const { data } = await axios.get<User>(`${API}/users/me`, {
            headers: { Authorization: `Bearer ${auth.token}` },
        });
        user.value = data;
        email.value = data.email ?? '';
        number.value = String(data.number ?? '');
        dob.value = data.dob ? String(data.dob).slice(0, 10) : '';
        newsletter.value = data.newsletter === 1;
        savedProfile.value = currentProfile();
    } catch (requestError) {
        loadError.value = axios.isAxiosError(requestError)
            ? requestError.response?.data?.error || t('settings.loadError')
            : t('settings.loadError');
    } finally {
        isLoading.value = false;
    }
});

async function saveProfile() {
    if (!hasChanges.value || isSaving.value) return;

    const submitted = currentProfile();
    isSaving.value = true;
    saveMessage.value = '';
    auth.error = null;
    auth.message = null;
    try {
        await auth.updateUser(submitted.email, submitted.number, submitted.newsletter);
        if (auth.error) return;
        savedProfile.value = submitted;
        saveMessage.value = t('settings.saved');
    } finally {
        isSaving.value = false;
    }
}

function openPasswordDialog() {
    passwordMessage.value = '';
    auth.modalError = null;
    passwordDialog.value?.showModal();
}

async function changePassword() {
    if (isChangingPassword.value) return;
    isChangingPassword.value = true;
    passwordMessage.value = '';
    auth.modalError = null;
    try {
        await auth.changePassword(oldPassword.value, newPassword.value, newPasswordConfirm.value);
        if (auth.modalError) return;
        passwordDialog.value?.close();
        oldPassword.value = '';
        newPassword.value = '';
        newPasswordConfirm.value = '';
        passwordMessage.value = t('settings.passwordChanged');
    } finally {
        isChangingPassword.value = false;
    }
}

async function deleteAccount() {
    await auth.deleteUser();
}
</script>

<template>
    <main class="settings-page min-h-screen px-4 py-10 sm:px-6">
        <div class="mx-auto max-w-5xl">
            <header
                v-if="!isLoading && user"
                class="profile-hero mb-8 flex flex-col gap-6 rounded-3xl p-6 text-white shadow-xl sm:flex-row sm:items-center sm:p-8"
            >
                <div
                    class="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold ring-1 ring-white/30"
                    aria-hidden="true"
                >
                    {{ initials }}
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                        {{ $t('settings.profile') }}
                    </p>
                    <h1 class="mt-1 truncate text-3xl font-bold sm:text-4xl">{{ displayName }}</h1>
                    <p class="mt-2 text-white/80">
                        @{{ user.username }} · {{ $t('settings.club') }}
                    </p>
                </div>
                <router-link
                    to="/Settings/Tickets"
                    class="btn border-0 bg-white text-slate-900 hover:bg-white/90"
                >
                    {{ $t('nav.tickets') }}
                    <span aria-hidden="true">→</span>
                </router-link>
            </header>

            <div v-if="isLoading" class="flex min-h-56 items-center justify-center">
                <span class="loading loading-spinner loading-lg text-primary"></span>
                <span class="ml-3">{{ $t('settings.loading') }}</span>
            </div>

            <div v-else-if="loadError" class="alert alert-error mb-6" role="alert">
                <span>{{ loadError }}</span>
            </div>

            <template v-else-if="user">
                <div v-if="auth.error" class="alert alert-error mb-5" role="alert">
                    <span>{{ auth.error }}</span>
                </div>
                <div v-if="saveMessage" class="alert alert-success mb-5" role="status">
                    <span>{{ saveMessage }}</span>
                </div>
                <div v-if="passwordMessage" class="alert alert-success mb-5" role="status">
                    <span>{{ passwordMessage }}</span>
                </div>

                <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
                    <form
                        class="settings-card card bg-base-100 shadow-lg"
                        @submit.prevent="saveProfile"
                    >
                        <div class="card-body p-6 sm:p-8">
                            <div class="mb-2">
                                <h2 class="text-2xl font-bold">
                                    {{ $t('settings.personalInfo') }}
                                </h2>
                                <p class="mt-1 text-sm text-base-content/65">
                                    {{ $t('settings.profileHint') }}
                                </p>
                            </div>

                            <div class="grid gap-5 sm:grid-cols-2">
                                <label class="form-control">
                                    <span class="label-text mb-2 font-semibold">{{
                                        $t('Login.username')
                                    }}</span>
                                    <input
                                        :value="user.username"
                                        type="text"
                                        disabled
                                        class="input input-bordered w-full"
                                    />
                                </label>
                                <label class="form-control">
                                    <span class="label-text mb-2 font-semibold">{{
                                        $t('settings.dob')
                                    }}</span>
                                    <input
                                        :value="dob"
                                        type="date"
                                        disabled
                                        class="input input-bordered w-full"
                                    />
                                </label>
                                <label class="form-control">
                                    <span class="label-text mb-2 font-semibold">{{
                                        $t('settings.email')
                                    }}</span>
                                    <input
                                        v-model="email"
                                        type="email"
                                        autocomplete="email"
                                        required
                                        class="input input-bordered w-full"
                                    />
                                </label>
                                <label class="form-control">
                                    <span class="label-text mb-2 font-semibold">{{
                                        $t('settings.number')
                                    }}</span>
                                    <input
                                        v-model="number"
                                        type="tel"
                                        autocomplete="tel"
                                        class="input input-bordered w-full"
                                    />
                                </label>
                            </div>

                            <div class="mt-3 rounded-2xl bg-base-200/70 p-4">
                                <label
                                    class="flex cursor-pointer items-center justify-between gap-4"
                                >
                                    <span>
                                        <span class="block font-semibold">{{
                                            $t('settings.join')
                                        }}</span>
                                        <span class="mt-1 block text-sm text-base-content/60">
                                            {{ $t('settings.newsletterHint') }}
                                        </span>
                                    </span>
                                    <input
                                        v-model="newsletter"
                                        type="checkbox"
                                        class="toggle toggle-success"
                                    />
                                </label>
                            </div>

                            <div class="mt-2 flex justify-end">
                                <button
                                    type="submit"
                                    class="btn btn-primary min-w-36"
                                    :disabled="!hasChanges || isSaving"
                                >
                                    <span
                                        v-if="isSaving"
                                        class="loading loading-spinner loading-sm"
                                    ></span>
                                    {{
                                        isSaving
                                            ? $t('settings.saving')
                                            : $t('settings.saveChanges')
                                    }}
                                </button>
                            </div>
                        </div>
                    </form>

                    <aside class="space-y-6">
                        <section class="settings-card card bg-base-100 shadow-lg">
                            <div class="card-body p-6">
                                <div
                                    class="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-xl text-primary"
                                    aria-hidden="true"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="h-6 w-6 fill-none stroke-current"
                                        stroke-width="1.8"
                                    >
                                        <rect x="3" y="10" width="18" height="11" rx="2" />
                                        <path d="M7 10V7a5 5 0 0 1 10 0v3M12 14v3" />
                                    </svg>
                                </div>
                                <h2 class="text-xl font-bold">{{ $t('settings.security') }}</h2>
                                <p class="text-sm text-base-content/65">
                                    {{ $t('settings.passwordHint') }}
                                </p>
                                <button
                                    type="button"
                                    class="btn btn-outline mt-3"
                                    @click="openPasswordDialog"
                                >
                                    {{ $t('settings.change') }}
                                </button>
                            </div>
                        </section>

                        <section
                            class="settings-card card border border-error/20 bg-base-100 shadow-lg"
                        >
                            <div class="card-body p-6">
                                <h2 class="text-lg font-bold text-error">
                                    {{ $t('settings.dangerZone') }}
                                </h2>
                                <p class="text-sm text-base-content/65">
                                    {{ $t('settings.deleteHint') }}
                                </p>
                                <button
                                    type="button"
                                    class="btn btn-outline btn-error mt-3"
                                    @click="deletionDialog?.showModal()"
                                >
                                    {{ $t('settings.delete') }}
                                </button>
                            </div>
                        </section>
                    </aside>
                </div>
            </template>
        </div>

        <dialog ref="passwordDialog" class="modal">
            <form class="modal-box space-y-4" @submit.prevent="changePassword">
                <h2 class="text-2xl font-bold">{{ $t('settings.change') }}</h2>
                <p class="text-sm text-base-content/65">{{ $t('settings.passwordHint') }}</p>
                <div v-if="auth.modalError" class="alert alert-error" role="alert">
                    <span>{{ auth.modalError }}</span>
                </div>
                <label class="form-control">
                    <span class="label-text mb-2">{{ $t('settings.passOld') }}</span>
                    <input
                        v-model="oldPassword"
                        type="password"
                        autocomplete="current-password"
                        required
                        class="input input-bordered"
                    />
                </label>
                <label class="form-control">
                    <span class="label-text mb-2">{{ $t('settings.passNew') }}</span>
                    <input
                        v-model="newPassword"
                        type="password"
                        autocomplete="new-password"
                        required
                        class="input input-bordered"
                    />
                </label>
                <label class="form-control">
                    <span class="label-text mb-2">{{ $t('settings.passConfirm') }}</span>
                    <input
                        v-model="newPasswordConfirm"
                        type="password"
                        autocomplete="new-password"
                        required
                        class="input input-bordered"
                    />
                </label>
                <div class="modal-action">
                    <button type="button" class="btn btn-ghost" @click="passwordDialog?.close()">
                        {{ $t('settings.close') }}
                    </button>
                    <button type="submit" class="btn btn-primary" :disabled="isChangingPassword">
                        <span
                            v-if="isChangingPassword"
                            class="loading loading-spinner loading-sm"
                        ></span>
                        {{ $t('settings.save') }}
                    </button>
                </div>
            </form>
            <form method="dialog" class="modal-backdrop">
                <button>{{ $t('settings.close') }}</button>
            </form>
        </dialog>

        <dialog ref="deletionDialog" class="modal">
            <div class="modal-box">
                <h2 class="text-xl font-bold">{{ $t('settings.account') }}</h2>
                <div v-if="auth.error" class="alert alert-error mt-4" role="alert">
                    <span>{{ auth.error }}</span>
                </div>
                <p class="py-4">{{ $t('settings.confirm') }}</p>
                <div class="modal-action">
                    <button type="button" class="btn btn-ghost" @click="deletionDialog?.close()">
                        {{ $t('settings.close') }}
                    </button>
                    <button type="button" class="btn btn-error" @click="deleteAccount">
                        {{ $t('settings.delete') }}
                    </button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>{{ $t('settings.close') }}</button>
            </form>
        </dialog>
    </main>
</template>

<style scoped>
.settings-page {
    background:
        radial-gradient(ellipse at top left, rgb(22 132 93 / 9%), transparent 36rem),
        var(--fallback-b2, oklch(var(--b2)));
}

.profile-hero {
    background: linear-gradient(120deg, #123f35, #16845d 65%, #39a879);
}

.settings-card {
    border: 1px solid rgb(127 127 127 / 12%);
    border-radius: 1.25rem;
}

@media (max-width: 640px) {
    .profile-hero a {
        width: 100%;
    }
}
</style>
