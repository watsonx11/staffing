<script setup>
import { ref } from 'vue'
import SectionGenerator from '@/components/SectionGenerator.vue'
import ButtonSuccess from '@/components/buttons/ButtonSuccess.vue'
import ButtonInfo from '@/components/buttons/ButtonInfo.vue'
import ButtonDanger from '@/components/buttons/ButtonDanger.vue'

const sectionTitle = 'Contract Line Item Admin'

const dynamicSectionVisible = ref(false) // Set to false initially

const contractList = ref([
    { contractNumber: 'N00024-24-C-6240', programName: 'Nosis', projectNumber: '538111' },
    { contractNumber: 'G302879', programName: 'APDL', projectNumber: '536606' },
])

const selectedOption = ref('')
const selectedContract = ref(null) // Store the full contract object, not just the string

const updateSelectedOption = () => {
    // Find the selected contract object
    const selected = contractList.value.find(contract => 
        `${contract.contractNumber} (${contract.programName})` === selectedOption.value
    )
    
    if (selected) {
        selectedContract.value = selected
    dynamicSectionVisible.value = true
    }
}

const lineItemArray = ref([
    { field: 'taskTI', label: 'Task or TI number', placeholder: '1001', type: 'text', colLength: 'is-2' },
    { field: 'projectTask', label: 'Project Task', placeholder: '111', type: 'text', colLength: 'is-2' },
    { field: 'projectName', label: 'Project Name', placeholder: 'OY1 Engineering SPT (Integration)', type: 'text', colLength: 'is-3' },
    { field: 'startDate', label: 'Start Date', placeholder: '01/30/2025', type: 'date', colLength: 'is-2' },
    { field: 'endDate', label: 'End Date', placeholder: '01/30/2026', type: 'date', colLength: 'is-2' },
])

// Store the form values for each line item, now with contract info
const lineItems = ref([])

const addNewLineItem = () => {
    if (!selectedContract.value) return
    
    lineItems.value.unshift({
        taskTI: '',
        projectTask: '',
        projectName: '',
        startDate: '',
        endDate: '',
        contract: { ...selectedContract.value } // Link the contract data to the line item
    })
}

// Delete a line item by index
const deleteLineItem = (index) => {
    if (lineItems.value.length > 1) {
        lineItems.value.splice(index, 1)
    }
}

// Copy a line item
const copyLineItem = (index) => {
    const itemToCopy = {...lineItems.value[index]}
    lineItems.value.unshift(itemToCopy)
}

// Initialize the first line item when a contract is selected
const initializeLineItems = () => {
    // Clear existing line items when changing contracts
    lineItems.value = [{
        taskTI: '',
        projectTask: '',
        projectName: '',
        startDate: '',
        endDate: '',
        contract: { ...selectedContract.value } // Link the contract data to the line item
    }]
}

// Watch for changes to selectedContract and initialize line items
const watchSelectedContract = () => {
    if (selectedContract.value) {
        initializeLineItems()
    }
}
</script>

<template>
    <SectionGenerator :sectionTitle="sectionTitle" />
    <div class="columns">
        <div class="column is-3 is-flex is-justify-content-end">
            <div class="select">
                <select v-model="selectedOption">
                    <option value="" disabled>Select Contract</option>
                    <option
                        v-for="(item, index) in contractList"
                        :key="index"
                        >
                            {{ item.contractNumber }} ({{ item.programName }})
                    </option>
                </select>
            </div>
        </div>
        <div class="column is-flex is-justify-content-start">
            <div>
                <button class="button" @click="updateSelectedOption">Select</button>
            </div>
        </div>
    </div>
    <hr>
    <div v-if="!dynamicSectionVisible">
        <div class="columns is-centered">
            <div class="column is-three-quarters">
                <article class="message is-info">
                    <div class="message-header">
                        <p>Select a Contract to Add/Edit Line Items</p>
                    </div>
                </article>
            </div>
        </div>
    </div>
    <div v-else>

        
        <!-- Contract details display -->
        <div class="columns">
            <div class="column">
                <div class="box">
                    <div class="columns">
                        <div class="column">
                            <strong>Contract:</strong> {{ selectedContract.contractNumber }}
                        </div>
                        <div class="column">
                            <strong>Program:</strong> {{ selectedContract.programName }}
                        </div>
                        <div class="column">
                            <strong>Project Number:</strong> {{ selectedContract.projectNumber }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Empty state - no line items yet -->
        <div v-if="lineItems.length === 0" class="columns">
            <div class="column">
                <div class="box has-text-centered">
                    <p>No line items yet. Click the "New" button to add your first line item.</p>
                    <ButtonSuccess buttonText="New" extraClass="mt-3" @click="addNewLineItem" />
                </div>
            </div>
        </div>
        
        <!-- Loop through each line item and create a form for each -->
        <div v-for="(lineItem, lineItemIndex) in lineItems" :key="lineItemIndex" class="columns">
            <div class="column">
                <div class="box">
                    <div class="columns">
                        <div
                            v-for="(item, index) in lineItemArray"
                            :key="index"
                            class="column"
                            :class="item.colLength"
                        >
                            <label class="label">{{ item.label }}:</label>
                            <input 
                                :type="item.type"
                                class="input"
                                :placeholder="item.placeholder"
                                v-model="lineItem[item.field]"
                        >
                        </div>
                    </div>
                    <div class="columns">
                        <div class="column">
                            <ButtonDanger buttonText="Delete" extraClass="is-outlined" @click="deleteLineItem(lineItemIndex)"/>
                        </div>
                        <div class="column is-flex is-justify-content-end">
                            <div class="buttons">
                                <ButtonSuccess buttonText="New" extraClass="is-outlined" @click="addNewLineItem" />
                                <ButtonInfo buttonText="Copy" extraClass="is-outlined" @click="copyLineItem(lineItemIndex)" />
                                <ButtonSuccess buttonText="Save" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>