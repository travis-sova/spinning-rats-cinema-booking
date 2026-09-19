<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const message = ref<HTMLDialogElement | null>(null);

function clear() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { modal, ...rest } = route.query;
    router.replace({ query: rest });
}

const modalText = computed(() => {
    switch (route.query.modal) {
        case 'deleted':
            return t('modal.deleted');
        case 'test':
            return 'Test.';
        default:
            return t('modal.unknown');
    }
});

onMounted(() => {
    if (route.query.modal && message.value) {
        message.value.showModal();
    }
});
</script>

<template>
    <dialog v-if="route.query.modal" ref="message" class="modal">
        <div class="modal-box">
            <h3 class="text-lg font-bold">{{ $t('modal.message') }}</h3>
            <p class="py-4">{{ modalText }}</p>
            <div class="modal-action">
                <form method="dialog">
                    <button @click="clear" class="btn">{{ $t('modal.close') }}</button>
                </form>
            </div>
        </div>
    </dialog>
</template>
