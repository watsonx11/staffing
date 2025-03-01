<script setup>
const props = defineProps({
    dynamicClass: {
        type: String,
        default: ""
    }, 
    type: {
        type: String,
        default: "text"
    },
    placeholder: {
        type: String,
        default: "Placeholder"
    },
    valueText: {
        type: String,
        default: ""
    }
})

const emit = defineEmits(['update:valueText'])

const updateValue = (event) => {
    emit('update:valueText', event.target.value)
}
</script>

<template>
    <input
        class="input"
        :class="dynamicClass"
        :type="type"
        :placeholder="placeholder"
        :value="valueText"
        @input="updateValue"
    />
</template>