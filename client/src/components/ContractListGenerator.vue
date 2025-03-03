<script setup>
import { ref, defineEmits } from 'vue'
import ReadOnlyInputField from '@/components/input_fields/ReadOnlyInputField.vue'
import ButtonDanger from '@/components/buttons/ButtonDanger.vue'

const props = defineProps({
    inputArray: {
        type: Array
    }
})

// Define the emits that this component will send to parent
const emit = defineEmits(['deleteItem'])

// Function to emit delete event to parent
const handleDelete = (item) => {
    console.log('Emitting delete for item:', item)
    emit('deleteItem', item)
}
</script>

<template>
    <div class="columns is-multiline">
        <div class="column is-12"
        v-for="(item, index) in inputArray"
        :key="index"
        >
            <div class="box">
                <div class="columns">
                    <div class="column">
                        <label class="label">Contract Number:</label>
                        <ReadOnlyInputField :valueText="item.contractNumber" />
                    </div>
                    <div class="column">
                        <label class="label">Program Name:</label>
                        <ReadOnlyInputField :valueText="item.programName" />
                    </div>
                    <div class="column">
                        <label class="label">Project Number:</label>
                        <ReadOnlyInputField :valueText="item.projectNumber" />
                    </div>
                </div>
                <div class="columns">
                    <div class="column">
                        <label class="label">PM Name:</label>
                        <ReadOnlyInputField :valueText="item.pmName" />
                    </div>
                    <div class="column">
                        <label class="label">FA Name:</label>
                        <ReadOnlyInputField :valueText="item.faName" />
                    </div>
                    <div class="column">
                        <label class="label">DPME Name:</label>
                        <ReadOnlyInputField :valueText="item.dpmeName" />
                    </div>
                    <div class="column is-narrow">
                        <label class="label">&nbsp;</label>
                        <div class="buttons">
                            <ButtonDanger buttonText="&#45;" extraClass="is-small" @click="handleDelete(item)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>