<script setup>

const props = defineProps({
    buttonText: {
        type: String,
        default: 'is-danger',
    },
    extraClass: {
        type: String,
        default: ''
    }
})

</script>

<template>
    <button 
        class="button is-danger"
        :class="extraClass"
    >
        {{ buttonText }}
    </button>
</template>