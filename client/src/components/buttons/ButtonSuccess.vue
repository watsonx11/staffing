<script setup>

const props = defineProps({
    buttonText: {
        type: String,
        default: 'is-success'
    }
})

</script>

<template>
    <button class="button is-success">{{ buttonText }}</button>
</template>