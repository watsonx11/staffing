<script setup>

const props = defineProps({
    buttonText: {
        type: String,
        default: 'is-success',
    }, 
    extraClass: {
        type: String,
        default: ''
    }
})

</script>

<template>
    <button 
        class="button is-success"
        :class="extraClass"
    >
        {{ buttonText }}
    </button>
</template>