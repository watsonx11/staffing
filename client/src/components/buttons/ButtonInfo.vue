<script setup>

const props = defineProps({
    buttonText: {
        type: String,
        default: 'is-info',
    }, 
    extraClass: {
        type: String,
        default: ''
    }
})

</script>

<template>
    <button 
        class="button is-info"
        :class="extraClass"
    >
        {{ buttonText }}
    </button>
</template>