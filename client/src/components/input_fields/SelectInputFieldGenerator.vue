<!-- Create a bulma CSS select drop down -->
<script setup>
import { defineEmits } from 'vue'

// Define props
const props = defineProps({
    selectTitle: {
        type: String,
    default: 'Select Option',
    },
    optionsArray: {
        type: Array,
    default: () => [],
    },
    modelValue: {
        type: String,
        default: '',
    },
})

// Define emits
const emit = defineEmits(['update:modelValue'])

// Handle selection changes
const handleChange = (event) => {
    emit('update:modelValue', event.target.value)
}
</script>

<template>
    <!-- <div class="select">
        <select>
            <option selected disabled>{{ selectTitle }}</option>
            <option
                v-for="(option, index) in optionsArray"
                :key="index"
            >
                {{ option }}
            
            </option>
        </select>
    </div> -->
    <div class="field">
        <div class="control">
            <div class="select is-fullwidth">
                <select :value="modelValue" @change="handleChange">
                    <option value="" disabled>{{ selectTitle }}</option>
                    <option
                        v-for="(option, index) in optionsArray"
                        :key="index"
                        :value="option"
                    >
                        {{ option }}
                    </option>
                </select>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>