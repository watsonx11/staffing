<script setup>

const props = defineProps({
    buttonText: {
        type: String,
        default: 'is-warning',
    }, 
    extraClass: {
        type: String,
        default: ''
    }
})

</script>

<template>
    <button 
        class="button is-warning"
        :class="extraClass"
    >
        {{ buttonText }}
    </button>
</template>