<template>
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="card bg-base-100 shadow-2xl w-full max-w-md border border-gray-600 rounded-lg">
            <div class="card-body p-8">
                <div class="flex justify-center mb-6">
                    <img src="@/assets/logo.svg" alt="Logo" class="h-16 w-auto" />
                </div>
                <h1 class="card-title text-2xl font-bold text-center justify-center mb-6">
                    {{ $t('Login.title') }}
                </h1>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div class="form-control">
                        <label for="username" class="label">
                            <span class="label-text font-medium">{{ $t('Login.username') }}</span>
                        </label>
                        <input
                            id="username"
                            v-model="form.username"
                            type="text"
                            :class="{
                                'input input-bordered': true,
                                'input-error': errors.username,
                            }"
                            @blur="validateField('username')"
                        />
                        <span v-if="errors.username" class="text-error text-sm mt-1">{{
                            errors.username
                        }}</span>
                    </div>

                    <div class="form-control">
                        <label for="password" class="label">
                            <span class="label-text font-medium">{{ $t('Login.password') }}</span>
                        </label>
                        <input
                            id="password"
                            v-model="form.password"
                            type="password"
                            :class="{
                                'input input-bordered': true,
                                'input-error': errors.password,
                            }"
                            @blur="validateField('password')"
                        />
                        <span v-if="errors.password" class="text-error text-sm mt-1">{{
                            errors.password
                        }}</span>
                    </div>

                    <div v-if="auth.error" class="alert alert-error p-3 text-sm">
                        {{ auth.error }}
                    </div>

                    <button
                        type="submit"
                        :disabled="auth.isLoading"
                        class="btn btn-primary w-full mt-4"
                    >
                        <span v-if="auth.isLoading" class="loading loading-spinner"></span>
                        {{ auth.isLoading ? 'Logging in...' : $t('Login.login') }}
                    </button>
                </form>

                <div class="text-center mt-6 text-sm">
                    <p>
                        {{ $t('Login.account') }}
                        <router-link to="/register" class="link link-info">{{
                            $t('Login.register')
                        }}</router-link>
                    </p>
                    <router-link to="/forgot-password" class="link link-info mt-2 inline-block">
                        {{ $t('Login.forgot') }}
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

import type { LoginForm } from '@/types/loginform.ts';
import type { FormErrors } from '@/types/formerrors.ts';

const auth = useAuthStore();

const form = ref<LoginForm>({
    username: '',
    password: '',
});

const errors = ref<FormErrors>({});

const validateField = (field: keyof LoginForm) => {
    if (field === 'username' && !form.value.username.trim()) {
        errors.value.username = 'Username is required';
    } else if (field === 'password' && !form.value.password) {
        errors.value.password = 'Password is required';
    } else {
        delete errors.value[field];
    }
};

const validateForm = (): boolean => {
    validateField('username');
    validateField('password');
    return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
        await auth.login(form.value.username, form.value.password);
    } catch {
        // Error is already handled by the auth store
    }
};
</script>
