<script setup>

const props = defineProps({
    buttonText: {
        type: String,
        default: 'Button',
    }, 
    extraClass: {
        type: String,
        default: ''
    }
})

</script>

<template>
    <button 
        class="button"
        :class="extraClass"
    >
        {{ buttonText }}
    </button>
</template>