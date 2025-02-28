<script setup>

const props = defineProps({
    dynamicClass: {
        type: String,
        default: "is-success"
    }, 
    type: {
        type: String,
        default: "text"
    },
    placeholder: {
        type: String,
        default: "Placeholder"
    }
})

</script>
<template>
    <input
        class="input"
        :class="dynamicClass"
        :type="type"
        :placeholder="placeholder"
    />
</template>