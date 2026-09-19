<template>
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="card bg-base-100 shadow-2xl w-full max-w-lg border border-gray-600 rounded-lg">
            <div class="card-body p-8">
                <div class="flex justify-center mb-6">
                    <img src="@/assets/logo.svg" alt="Logo" class="h-16 w-auto" />
                </div>
                <h1 class="card-title text-2xl font-bold text-center justify-center mb-6">
                    {{ $t('Register.title') }}
                </h1>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <!-- Name Row -->
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="form-control flex-1">
                            <label class="label">
                                <span class="label-text font-medium">{{
                                    $t('Register.firstName')
                                }}</span>
                            </label>
                            <input
                                id="fname"
                                v-model="form.fname"
                                type="text"
                                :class="{
                                    'input input-bordered': true,
                                    'input-error': errors.fname,
                                }"
                                @blur="validateField('fname')"
                            />
                            <span v-if="errors.fname" class="text-error text-sm mt-1">{{
                                errors.fname
                            }}</span>
                        </div>

                        <div class="form-control flex-1">
                            <label class="label">
                                <span class="label-text font-medium">{{
                                    $t('Register.lastName')
                                }}</span>
                            </label>
                            <input
                                id="sname"
                                v-model="form.sname"
                                type="text"
                                :class="{
                                    'input input-bordered': true,
                                    'input-error': errors.sname,
                                }"
                                @blur="validateField('sname')"
                            />
                            <span v-if="errors.sname" class="text-error text-sm mt-1">{{
                                errors.sname
                            }}</span>
                        </div>
                    </div>

                    <!-- Username -->
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text font-medium">{{
                                $t('Register.username')
                            }}</span>
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
                        <span class="text-xs text-gray-500 mt-1">{{
                            $t('Register.requirements')
                        }}</span>
                    </div>

                    <!-- Email -->
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text font-medium">{{ $t('Register.email') }}</span>
                        </label>
                        <input
                            id="email"
                            v-model="form.email"
                            type="email"
                            :class="{ 'input input-bordered': true, 'input-error': errors.email }"
                            @blur="validateField('email')"
                        />
                        <span v-if="errors.email" class="text-error text-sm mt-1">{{
                            errors.email
                        }}</span>
                    </div>

                    <!-- Password -->
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text font-medium">{{
                                $t('Register.password')
                            }}</span>
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
                            @input="checkPasswordStrength"
                        />
                        <span v-if="errors.password" class="text-error text-sm mt-1">{{
                            errors.password
                        }}</span>

                        <!-- Password Strength -->
                        <div
                            class="badge mt-2"
                            :class="{
                                'badge-error': passwordStrength.class === 'weak',
                                'badge-warning': passwordStrength.class === 'medium',
                                'badge-success': passwordStrength.class === 'strong',
                            }"
                        >
                            Password strength: {{ passwordStrength.text }}
                        </div>

                        <!-- Password Requirements -->
                        <ul class="mt-2 text-sm text-gray-600 space-y-1">
                            <li
                                class="flex items-center"
                                :class="{ 'text-success': passwordRequirements.length }"
                            >
                                <span class="mr-1">{{
                                    passwordRequirements.length ? '✓' : '○'
                                }}</span>
                                {{ $t('Register.req1') }}
                            </li>
                            <li
                                class="flex items-center"
                                :class="{ 'text-success': passwordRequirements.uppercase }"
                            >
                                <span class="mr-1">{{
                                    passwordRequirements.uppercase ? '✓' : '○'
                                }}</span>
                                {{ $t('Register.req2') }}
                            </li>
                            <li
                                class="flex items-center"
                                :class="{ 'text-success': passwordRequirements.lowercase }"
                            >
                                <span class="mr-1">{{
                                    passwordRequirements.lowercase ? '✓' : '○'
                                }}</span>
                                {{ $t('Register.req3') }}
                            </li>
                            <li
                                class="flex items-center"
                                :class="{ 'text-success': passwordRequirements.number }"
                            >
                                <span class="mr-1">{{
                                    passwordRequirements.number ? '✓' : '○'
                                }}</span>
                                {{ $t('Register.req4') }}
                            </li>
                        </ul>
                    </div>

                    <!-- Confirm Password -->
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text font-medium">{{
                                $t('Register.confirmPassword')
                            }}</span>
                        </label>
                        <input
                            id="confirmPassword"
                            v-model="form.confirmPassword"
                            type="password"
                            :class="{
                                'input input-bordered': true,
                                'input-error': errors.confirmPassword,
                            }"
                            @blur="validateField('confirmPassword')"
                        />
                        <span v-if="errors.confirmPassword" class="text-error text-sm mt-1">{{
                            errors.confirmPassword
                        }}</span>
                    </div>

                    <!-- Additional Info Row -->
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="form-control flex-1">
                            <label class="label">
                                <span class="label-text font-medium">{{ $t('Register.dob') }}</span>
                            </label>
                            <input
                                id="dob"
                                v-model="form.dob"
                                type="date"
                                class="input input-bordered"
                                max="2010-01-01"
                            />
                        </div>

                        <div class="form-control flex-1">
                            <label class="label">
                                <span class="label-text font-medium">{{
                                    $t('Register.gender')
                                }}</span>
                            </label>
                            <select id="sex" v-model="form.sex" class="select select-bordered">
                                <option value="">{{ $t('Register.noGender') }}</option>
                                <option value="Male">{{ $t('Register.gen1') }}</option>
                                <option value="Female">{{ $t('Register.gen2') }}</option>
                                <option value="Other">{{ $t('Register.gen3') }}</option>
                                <option value="attack_helicopter">{{ $t('Register.gen4') }}</option>
                            </select>
                        </div>
                    </div>

                    <!-- Phone Number -->
                    <div class="form-control">
                        <label class="label">
                            <span class="label-text font-medium">{{ $t('Register.number') }}</span>
                        </label>
                        <input
                            id="number"
                            v-model="form.number"
                            type="tel"
                            class="input input-bordered"
                            placeholder="+1234567890"
                        />
                    </div>

                    <!-- Server Error -->
                    <div v-if="auth.error" class="alert alert-error p-3 text-sm">
                        {{ auth.error }}
                    </div>

                    <!-- Submit Button -->
                    <button
                        type="submit"
                        :disabled="auth.isLoading"
                        class="btn btn-primary w-full mt-4"
                    >
                        <span v-if="auth.isLoading" class="loading loading-spinner"></span>
                        {{ auth.isLoading ? 'Creating account...' : $t('Register.register') }}
                    </button>
                </form>

                <div class="text-center mt-6 text-sm">
                    <p>
                        {{ $t('Register.login') }}
                        <router-link to="/login" class="link link-info">{{
                            $t('Register.loginBtn')
                        }}</router-link>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

import type { FormErrors } from '@/types/formerrors.ts';
import type { RegisterForm } from '@/types/registerform.ts';

const auth = useAuthStore();

const form = ref<RegisterForm>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    number: '',
    fname: '',
    sname: '',
    dob: '',
    sex: '',
});

const errors = ref<FormErrors>({});

const passwordRequirements = reactive({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
});

const passwordStrength = computed(() => {
    const metCount = Object.values(passwordRequirements).filter(Boolean).length;
    const total = Object.keys(passwordRequirements).length;

    if (metCount === 0) return { class: 'weak', text: 'Weak' };
    if (metCount < total) return { class: 'medium', text: 'Medium' };
    return { class: 'strong', text: 'Strong' };
});

const checkPasswordStrength = () => {
    const pass = form.value.password;
    passwordRequirements.length = pass.length >= 8;
    passwordRequirements.uppercase = /[A-Z]/.test(pass);
    passwordRequirements.lowercase = /[a-z]/.test(pass);
    passwordRequirements.number = /[0-9]/.test(pass);
};

const validateField = (field: keyof RegisterForm) => {
    const value = form.value[field];

    switch (field) {
        case 'username':
            if (!value.trim()) {
                errors.value.username = 'Username is required';
            } else if (value.length < 3 || value.length > 20) {
                errors.value.username = 'Username must be 3-20 characters';
            } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                errors.value.username = 'Only letters, numbers and underscores allowed';
            } else {
                delete errors.value.username;
            }
            break;

        case 'email':
            if (!value.trim()) {
                errors.value.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors.value.email = 'Please enter a valid email';
            } else {
                delete errors.value.email;
            }
            break;

        case 'password':
            if (!value) {
                errors.value.password = 'Password is required';
            } else if (value.length < 8) {
                errors.value.password = 'Password must be at least 8 characters';
            } else if (
                !passwordRequirements.uppercase ||
                !passwordRequirements.lowercase ||
                !passwordRequirements.number
            ) {
                errors.value.password = 'Password must include uppercase, lowercase and number';
            } else {
                delete errors.value.password;
            }
            break;

        case 'confirmPassword':
            if (!value) {
                errors.value.confirmPassword = 'Please confirm your password';
            } else if (value !== form.value.password) {
                errors.value.confirmPassword = 'Passwords do not match';
            } else {
                delete errors.value.confirmPassword;
            }
            break;

        case 'fname':
            if (!value.trim()) {
                errors.value.fname = 'First name is required';
            } else {
                delete errors.value.fname;
            }
            break;

        case 'sname':
            if (!value.trim()) {
                errors.value.sname = 'Last name is required';
            } else {
                delete errors.value.sname;
            }
            break;

        default:
            break;
    }
};

const validateForm = (): boolean => {
    validateField('username');
    validateField('email');
    validateField('password');
    validateField('confirmPassword');
    validateField('fname');
    validateField('sname');

    return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
        await auth.register({
            username: form.value.username,
            password: form.value.password,
            email: form.value.email,
            number: form.value.number,
            fname: form.value.fname,
            sname: form.value.sname,
            dob: form.value.dob,
            sex: form.value.sex,
        });
    } catch {}
};
</script>
