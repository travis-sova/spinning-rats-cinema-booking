import { defineStore } from 'pinia';
import axios from 'axios';
import router from '@/router/index';

import type { User } from '@/types/user.ts';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as User | null,
        token: localStorage.getItem('token') || null,
        isLoading: false,
        error: null as string | null,
        message: null as string | null,
        modalError: null as string | null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.perms === 1,
    },

    actions: {
        async login(username: string, password: string) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await axios.post('http://localhost:3000/api/users/login', {
                    username,
                    password,
                });

                this.token = response.data.token;
                this.user = response.data.user;

                // Store token in localStorage
                if (this.token) {
                    localStorage.setItem('token', this.token);
                }

                const redirectPath = this.isAdmin ? '/admin' : '/';
                router.push(redirectPath);
            } catch (error) {
                this.error = axios.isAxiosError(error)
                    ? error.response?.data?.error || 'Login failed'
                    : 'Login failed';
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async register(userData: {
            username: string;
            password: string;
            email: string;
            fname: string;
            sname: string;
            number?: string;
            dob?: string;
            sex?: string;
        }) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await axios.post(
                    'http://localhost:3000/api/users/register',
                    userData,
                );

                this.token = response.data.token;
                this.user = response.data.user;
                if (this.token) {
                    localStorage.setItem('token', this.token);
                }

                router.push('/');
            } catch (error) {
                this.error = axios.isAxiosError(error)
                    ? error.response?.data?.error || 'Registration failed'
                    : 'Registration failed';
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async fetchUser() {
            if (!this.token) return;

            this.error = null;

            try {
                const response = await axios.get('http://localhost:3000/api/users/me', {
                    headers: { Authorization: `Bearer ${this.token}` },
                });
                this.user = response.data;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    this.logout();
                    return;
                }

                this.error = 'Unable to load your account. Please try again.';
            }
        },

        async deleteUser() {
            this.error = null;
            try {
                const response = await axios.delete('http://localhost:3000/api/users/delete', {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });

                if (response.data.message === 'User deleted') {
                    this.token = null;
                    this.user = null;
                    localStorage.removeItem('token');

                    await router.push('/?modal=deleted');
                }
            } catch (err) {
                this.error = axios.isAxiosError(err)
                    ? err.response?.data?.error || err.message
                    : 'Failed to delete account';

                console.error('Error deleting account:', err);
            }
        },

        async updateUser(email: string, number: string, newsletter: boolean) {
            this.error = null;

            try {
                const response = await axios.put(
                    'http://localhost:3000/api/users/me',
                    { email, number, newsletter },
                    {
                        headers: {
                            Authorization: `Bearer ${this.token}`,
                        },
                    },
                );

                if (response.data.message === 'Data updated') {
                    this.message = 'User data updated';
                }
            } catch (err) {
                this.error = axios.isAxiosError(err)
                    ? err.response?.data?.error || err.message
                    : 'Failed to update data';
                console.error('Error updating data:', err);
            }
        },

        async changePassword(oldPassword: string, newPassword: string, newPasswordConfirm: string) {
            try {
                const response = await axios.put(
                    'http://localhost:3000/api/users/password',
                    { oldPassword, newPassword, newPasswordConfirm },
                    {
                        headers: {
                            Authorization: `Bearer ${this.token}`,
                        },
                    },
                );

                if (response.data.message === 'Password changed') {
                    this.message = 'Password changed successfully';
                    this.modalError = null;
                }
            } catch (err) {
                this.modalError = axios.isAxiosError(err)
                    ? err.response?.data?.errors?.[0]?.msg ||
                      err.response?.data?.error ||
                      err.message ||
                      'Axios error code: ' + err.response?.status
                    : 'Failed to change password';
                console.error('Error changing password:', err);
            }
        },

        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            router.push('/');
        },
    },
});
