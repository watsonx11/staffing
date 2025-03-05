<script setup>
import { ref, onMounted, watch } from 'vue'
import SectionGenerator from '@/components/SectionGenerator.vue'
import ButtonSuccess from '@/components/buttons/ButtonSuccess.vue'
import ButtonInfo from '@/components/buttons/ButtonInfo.vue'
import ButtonDanger from '@/components/buttons/ButtonDanger.vue'

// Initialize all refs first to prevent reference errors
const sectionTitle = 'Contract Line Item Admin'
const dynamicSectionVisible = ref(false)
const dynamicSectionTitle = ref('')
const contractList = ref([])
const selectedOption = ref('')
const selectedContract = ref(null)
const lineItems = ref([])
const debugInfo = ref('')

const lineItemArray = ref([
    { field: 'taskTI', label: 'Task or TI number', placeholder: '1001', type: 'text', colLength: 'is-2' },
    { field: 'projectTask', label: 'Project Task', placeholder: '111', type: 'text', colLength: 'is-2' },
    { field: 'projectName', label: 'Project Name', placeholder: 'OY1 Engineering SPT (Integration)', type: 'text', colLength: 'is-3' },
    { field: 'startDate', label: 'Start Date', placeholder: '01/30/2025', type: 'date', colLength: 'is-2' },
    { field: 'endDate', label: 'End Date', placeholder: '01/30/2026', type: 'date', colLength: 'is-2' },
])

// Format data helper function
const formatDataForApi = (item) => {
    if (!item.startDate || !item.endDate) {
        return false
    }
    
    // Format dates from any format to yyyy-MM-dd
    if (item.startDate) {
        // Handle ISO strings with time component
        if (typeof item.startDate === 'string' && item.startDate.includes('T')) {
            item.startDate = item.startDate.split('T')[0]
        }
        // Handle Date objects
        else if (typeof item.startDate === 'object' && item.startDate instanceof Date) {
            item.startDate = item.startDate.toISOString().split('T')[0]
        }
    }
    
    if (item.endDate) {
        // Handle ISO strings with time component
        if (typeof item.endDate === 'string' && item.endDate.includes('T')) {
            item.endDate = item.endDate.split('T')[0]
        }
        // Handle Date objects
        else if (typeof item.endDate === 'object' && item.endDate instanceof Date) {
            item.endDate = item.endDate.toISOString().split('T')[0]
        }
    }
    
    return true
}

// Special method to ensure dates are formatted correctly when the user changes them
const formatDateOnChange = (lineItem, field) => {
    if (!lineItem[field]) return
  
    // For HTML date inputs, the value should already be in YYYY-MM-DD format
    // But we'll ensure it doesn't have a time component
    if (typeof lineItem[field] === 'string' && lineItem[field].includes('T')) {
        lineItem[field] = lineItem[field].split('T')[0]
    }
}

// Format date for display
const formatDateForDisplay = (dateString) => {
    if (!dateString) return ''
    // Convert YYYY-MM-DD to a user-friendly format if needed
    return dateString.split('T')[0] // This will ensure any ISO dates are simplified to YYYY-MM-DD
}

// Create a blank line item
const createBlankLineItem = () => {
    if (!selectedContract.value) return null
    
    return {
        id: null,
        taskTI: '',
        projectTask: '',
        projectName: '',
        startDate: '',
        endDate: '',
        isEditing: true, // New items are always in edit mode
        contract: { ...selectedContract.value }
    }
}

// Toggle edit mode for a line item
const toggleEditMode = (lineItem) => {
    lineItem.isEditing = !lineItem.isEditing
    debugInfo.value = lineItem.isEditing ? 'Editing line item...' : 'View mode'
}

// Fetch contracts from the API
const fetchContracts = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/workpackages')
        if (!response.ok) {
            throw new Error('Failed to fetch contract data')
        }
        const data = await response.json()
        contractList.value = data.map(item => ({
            contractNumber: item.contract_number,
            programName: item.program_name,
            projectNumber: item.project_number,
            id: item.id,
            pm_id: item.pm_id,
            fa_id: item.fa_id,
            dpme_id: item.dpme_id
        }))
    } catch (error) {
        console.error('Error fetching contracts:', error)
    }
}

// Fetch existing line items for a contract
const fetchLineItems = async (workpackageId) => {
    try {
        // console.log(`Fetching line items for workpackage ID: ${workpackageId}`)
        const response = await fetch(`http://localhost:3000/api/workpackages/${workpackageId}/line-items`)
        if (!response.ok) {
            throw new Error('Failed to fetch line items')
        }
        const data = await response.json()
        // console.log('Received line items from API:', data)
        
        // Map API data to component format
        const mappedItems = data.map(item => ({
            id: item.id,
            taskTI: item.task_ti,
            projectTask: item.project_task,
            projectName: item.project_name,
            startDate: item.start_date ? formatDateForDisplay(item.start_date) : '',
            endDate: item.end_date ? formatDateForDisplay(item.end_date) : '',
            isEditing: false, // Items from API start in view mode
            contract: {
                id: item.workpackage_id,
                contractNumber: item.contract_number,
                programName: item.program_name,
                projectNumber: item.project_number
            }
        }))
        
        // console.log('Mapped line items:', mappedItems)
        lineItems.value = mappedItems
        
        // If no items were returned from API, add a blank item
        if (lineItems.value.length === 0) {
            lineItems.value.push(createBlankLineItem())
        }
        
        debugInfo.value = `Loaded ${mappedItems.length} line items for contract ${workpackageId}`
    } catch (error) {
        console.error('Error fetching line items:', error)
        debugInfo.value = `Error loading line items: ${error.message}`
        
        // On error, add a blank item
        lineItems.value = [createBlankLineItem()]
    }
}

const updateSelectedOption = async () => {
    // Find the selected contract object
    const selected = contractList.value.find(contract => 
        `${contract.contractNumber} (${contract.programName})` === selectedOption.value
    )
    
    if (selected) {
        selectedContract.value = selected
        dynamicSectionVisible.value = true
        dynamicSectionTitle.value = selectedOption.value
        
        // Fetch line items for this contract
        await initializeLineItems()
        
        // console.log('Selected contract:', selectedContract.value)
        // console.log('Loaded line items:', lineItems.value)
    }
}

const addNewLineItem = () => {
    if (!selectedContract.value) return
    
    lineItems.value.unshift(createBlankLineItem())
}

// Delete a line item by index
const deleteLineItem = async (index) => {
    const item = lineItems.value[index]
    
    // If the item has an ID, it exists in the database and needs to be deleted there
    if (item.id) {
        try {
            const response = await fetch(`http://localhost:3000/api/line-items/${item.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            
            if (!response.ok) {
                throw new Error('Failed to delete line item')
            }
        } catch (error) {
            console.error('Error deleting line item:', error)
            return // Don't remove from UI if delete failed
        }
    }
    
    // Remove from the UI
    lineItems.value.splice(index, 1)
    
    // If we just deleted the last item, add a blank one
    if (lineItems.value.length === 0) {
        lineItems.value.push(createBlankLineItem())
        debugInfo.value = 'Last item deleted, added a blank item'
    }
}

// Copy a line item
const copyLineItem = (index) => {
    const itemToCopy = {...lineItems.value[index]}
    // Remove the ID so it's treated as a new item
    itemToCopy.id = null
    // Set as editable since it's a new copy
    itemToCopy.isEditing = true
    lineItems.value.unshift(itemToCopy)
}

// Initialize line items when a contract is selected
const initializeLineItems = async () => {
    if (!selectedContract.value) return
    
    // Clear existing line items
    lineItems.value = []
    
    try {
        // Fetch line items for this contract from the API
        await fetchLineItems(selectedContract.value.id)
        
        // fetchLineItems now handles adding a blank item if no items were returned
    } catch (error) {
        console.error('Error initializing line items:', error)
        // Ensure we have at least one empty line item if the API call fails
        lineItems.value = [createBlankLineItem()]
    }
}

// Save a line item to the database
const saveLineItem = async (lineItem) => {
    try {
        // Make sure dates are properly formatted
        if (!formatDataForApi(lineItem)) {
            alert('Please fill in all required fields, including start and end dates.')
            return false
        }
        
        const isNew = !lineItem.id
        
        const payload = {
            workpackage_id: lineItem.contract.id,
            task_ti: lineItem.taskTI,
            project_task: lineItem.projectTask,
            project_name: lineItem.projectName,
            start_date: lineItem.startDate,
            end_date: lineItem.endDate
        }
        
        // console.log('Saving line item with payload:', payload)
        debugInfo.value = 'Saving line item...'
        
        const url = isNew 
            ? 'http://localhost:3000/api/line-items' 
            : `http://localhost:3000/api/line-items/${lineItem.id}`
        
        const response = await fetch(url, {
            method: isNew ? 'POST' : 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Failed to save line item: ${errorText}`)
        }
        
        const savedData = await response.json()
        console.log('Response from server:', savedData)
        
        // Update the line item with data from the server (including ID for new items)
        lineItem.id = savedData.id
        
        // For new items, make sure we update the workpackage_id
        if (isNew) {
            lineItem.contract.id = savedData.workpackage_id
        }
        
        // Format dates that come back from the server
        if (savedData.start_date) {
            lineItem.startDate = formatDateForDisplay(savedData.start_date)
        }
        
        if (savedData.end_date) {
            lineItem.endDate = formatDateForDisplay(savedData.end_date)
        }
        
        // Turn off edit mode after saving
        lineItem.isEditing = false
        
        // Show success message
        debugInfo.value = `Line item ${isNew ? 'created' : 'updated'} successfully!`
        
        return true
    } catch (error) {
        console.error('Error saving line item:', error)
        debugInfo.value = `Error: ${error.message}`
        return false
    }
}

// Call the function when component is mounted
onMounted(() => {
    fetchContracts()
})

// Add watcher for debugging
watch(lineItems, (newValue) => {
    debugInfo.value = `Line items updated: ${newValue.length} items`
    // console.log('Line items updated:', newValue)
}, { deep: true })
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
        <div class="columns">
            <div class="column">
                <SectionGenerator :sectionTitle="dynamicSectionTitle" />
            </div>
        </div>
        
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
        
        <!-- Debug info -->
        <div v-if="debugInfo" class="columns">
            <div class="column">
                <div class="notification is-info is-light">
                    {{ debugInfo }}
                </div>
            </div>
        </div>
        
        <div v-if="lineItems.length === 0" class="columns">
            <div class="column">
                <div class="box has-text-centered">
                    <p>No line items yet. Click the "New" button to add your first line item.</p>
                    <ButtonSuccess buttonText="New" extraClass="mt-3" @click="addNewLineItem" />
                </div>
            </div>
        </div>
        
        <div v-if="lineItems.length > 0" class="columns">
            <div class="column">
                <h3 class="title is-5">Contract Line Items ({{ lineItems.length }})</h3>
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
                            <template v-if="item.type === 'date'">
                                <!-- Special handling for date inputs -->
                                <input 
                                    :type="item.type"
                                    class="input"
                                    :class="{ 'is-static': lineItem.id && !lineItem.isEditing }"
                                    :placeholder="item.placeholder"
                                    v-model="lineItem[item.field]"
                                    @change="formatDateOnChange(lineItem, item.field)"
                                    :readonly="lineItem.id && !lineItem.isEditing"
                                >
                            </template>
                            <template v-else>
                                <!-- Regular handling for non-date inputs -->
                                <input 
                                    :type="item.type"
                                    class="input"
                                    :class="{ 'is-static': lineItem.id && !lineItem.isEditing }"
                                    :placeholder="item.placeholder"
                                    v-model="lineItem[item.field]"
                                    :readonly="lineItem.id && !lineItem.isEditing"
                                >
                            </template>
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
                                <ButtonInfo v-if="lineItem.id && !lineItem.isEditing" buttonText="Edit" extraClass="is-outlined" @click="toggleEditMode(lineItem)" />
                                <ButtonSuccess v-else buttonText="Save" @click="saveLineItem(lineItem)" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>