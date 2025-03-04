<script setup>
import { ref, defineEmits } from 'vue'
import ReadOnlyInputField from '@/components/input_fields/ReadOnlyInputField.vue'
import ButtonWarning from '@/components/buttons/ButtonWarning.vue'
import ButtonDanger from '@/components/buttons/ButtonDanger.vue'

const props = defineProps({
    inputArray: {
        type: Array
    }
})

// Mapping of object keys to human-readable labels
const fieldMapping = [
    { key: 'contractNumber', label: 'Contract Number' },
    { key: 'programName', label: 'Program Name' },
    { key: 'projectNumber', label: 'Project Number' },
    { key: 'pmName', label: 'PM Name' },
    { key: 'faName', label: 'FA Name' },
    { key: 'dpmeName', label: 'DPME Name' },
]

// Define the emits that this component will send to parent
const emit = defineEmits(['deleteItem', 'editItem'])

// Function to emit delete event to parent
const handleDelete = (item) => {
    emit('deleteItem', item)
}

// Function to emit edit event to parent
const handleEdit = (item) => {
    emit('editItem', item)
}

const showArray = (inputArray) => {
    console.log(inputArray)
}

</script>

<template>
    <div class="columns is-multiline">
        <div
        class="column is-12"
        v-for="(item, index) in inputArray"
        :key="index"
        >
            <div class="box">
                <!-- Loop over the mapping array to display fields dynamically -->
                <div class="columns is-multiline">
                    <div class="column is-4" v-for="(field, idx) in fieldMapping" :key="idx">
                        <label class="label">{{ field.label }}:</label>
                        <ReadOnlyInputField :valueText="item[field.key]" />
                    </div>
                </div>
                <div class="columns">
                    <div class="column is-10"></div>
                    <div class="column">
                        <div class="buttons">
                            <ButtonWarning 
                                buttonText="Edit" 
                                extraClass="is-outlined" 
                                @click="handleEdit(item)" 
                            />
                            <ButtonDanger
                                buttonText="Delete"
                                extraClass="is-outlined"
                                @click="handleDelete(item)"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>