<script setup>
const props = defineProps({
    valueText: {
        type: String,
        default: "Default"
    }
})

</script>

<template>
    <div class="control">
        <input 
            class="input is-large" 
            type="text" 
            :value="valueText"
            readonly 
        />
    </div>
</template>