<script setup>
import { ref, onMounted, computed } from 'vue'
import SectionGenerator from '@/components/SectionGenerator.vue'
import ButtonSuccess from '@/components/buttons/ButtonSuccess.vue'
import ModalGenerator from '@/components/ModalGenerator.vue'
import ContractListGenerator from '@/components/ContractListGenerator.vue'
// import InputFieldGenerator from '@/components/InputfieldGenerator.vue'
import SelectInputFieldGenerator from '@/components/input_fields/SelectInputFieldGenerator.vue'
import { toast } from 'bulma-toast'

// Set the url for the database API
const apiAddress = 'http://localhost:3000' // ${apiAddress}

// Section Title
const sectionTitle = "Workpackage Administration"

// Variables to support filtering of positions
const pmLabel = 'Program Manager'
const faLabel = 'Financial Analyst'
const dpmeLabel = 'Deputy Program Manager Engineering'

// Reactive references
const contractNumber = ref('')
const programName = ref('')
const projectNumber = ref('')
const contractInfo = ref([])
const personnel = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const isDeleteModalActive = ref(false)
const workpackageToDelete = ref(null)

// Personnel selection refs
const selectedPM = ref('')
const selectedFA = ref('')
const selectedDPME = ref('')

// Constants created from computed properties
const pmNames = createComputedName(pmLabel)
const faNames = createComputedName(faLabel)
const dpmeNames = createComputedName(dpmeLabel)

// Function to create computed properties based on input
function createComputedName(label) {
  return computed(() =>
    personnel.value
      .filter(person => person.position === label)
      .map(person => `${person.first_name} ${person.last_name}`)
  )
}

// Computed property for select fields to ensure they update when personnel changes
const selectFieldInformation = computed(() => [
  { name: 'PM', options: pmNames.value, colSize: 'is-2', modelValue: selectedPM },
  { name: 'FA', options: faNames.value, colSize: 'is-2', modelValue: selectedFA },
  { name: 'DPME', options: dpmeNames.value, colSize: 'is-2', modelValue: selectedDPME },
])

// Array of information to create Input Fields
const inputFieldInformation = [
  { name: 'Contract Number', placeholder: 'N00024-24-C-6240', colSize: 'is-4' },
  { name: 'Program Name', placeholder: 'Nosis', colSize: 'is-4' },
]

// Function to handle selection changes
const handleSelection = (position, value) => {
  console.log(`Selection changed: ${position} = ${value}`)
  
  if (position === 'PM') {
    selectedPM.value = value
    console.log('Updated selectedPM to:', selectedPM.value)
  } else if (position === 'FA') {
    selectedFA.value = value
    console.log('Updated selectedFA to:', selectedFA.value)
  } else if (position === 'DPME') {
    selectedDPME.value = value
    console.log('Updated selectedDPME to:', selectedDPME.value)
  } else {
    console.warn(`Unknown position: ${position}`)
  }
}

// Function to get personnel ID by full name
const getPersonnelIdByName = (fullName) => {
  if (!fullName || fullName.trim() === '') {
    console.warn('Empty fullName passed to getPersonnelIdByName')
    return null
  }
  
  const person = personnel.value.find(p => 
    `${p.first_name} ${p.last_name}` === fullName
  )
  
  if (!person) {
    console.warn(`No personnel found with name: "${fullName}"`)
    console.log('Available personnel:', personnel.value.map(p => ({
      id: p.id,
      name: `${p.first_name} ${p.last_name}`,
      position: p.position
    })))
  }
  
  return person ? person.id : null
}

// Function to fetch personnel data from the API
const fetchPersonnel = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(`${apiAddress}/api/personnel`)

    if (!response.ok) {
      throw new Error('Failed to fetch personnel')
    }

    const data = await response.json()
    personnel.value = data
  } catch (error) {
    console.error('Error fetching personnel data:', error)
    errorMessage.value = 'Failed to load personnel data'

    toast({
      message: 'Error loading personnel data',
      type: 'is-danger',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  } finally {
    isLoading.value = false
  }
}

// Function to fetch workpackages from the API
const fetchWorkpackages = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(`${apiAddress}/api/workpackages`)

    if (!response.ok) {
      throw new Error('Failed to fetch workpackages')
    }
    
    // Check the raw response for debugging
    const rawResponseClone = await response.clone()
    const rawText = await rawResponseClone.text()
    console.log('Raw API response:', rawText)

    const data = await response.json()
    console.log('Workpackages API response:', data)
    
    // Map the data to match the format expected by WorkpackageListGenerator
    // Handle different possible case variations from the API
    contractInfo.value = data.map(wp => ({ 
      id: wp.id,
      contractNumber: wp.contract_number,
      programName: wp.program_name,
      projectNumber: wp.project_number,
      pmName: wp.pmname || wp.pmName || wp.pm_name || "Unknown PM",
      faName: wp.faname || wp.faName || wp.fa_name || "Unknown FA",
      dpmeName: wp.dpmename || wp.dpmeName || wp.dpme_name || "Unknown DPME"
    }))
  } catch (error) {
    console.error('Error fetching workpackages:', error)
    errorMessage.value = 'Failed to load workpackages'

    toast({
      message: 'Error loading workpackages',
      type: 'is-danger',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  } finally {
    isLoading.value = false
  }
}

// Handle contract number input 
const handleContractInput = (value) => {
  contractNumber.value = value
}

// Function to save the contract
const saveContract = async () => {
  if (!contractNumber.value) {
    toast({
      message: 'Please enter a contract number',
      type: 'is-warning',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
    return
  }

  if (!programName.value) {
    toast({
      message: 'Please enter a program name',
      type: 'is-warning',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
    return
  }

  if (!projectNumber.value) {
    toast({
      message: 'Please enter a project number',
      type: 'is-warning',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
    return
  }

  if (!selectedPM.value) {
    toast({
      message: 'Please select a Program Manager',
      type: 'is-warning',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
    return
  }

  if (!selectedFA.value) {
    toast({
      message: 'Please select a Financial Analyst',
      type: 'is-warning',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
    return
  }

  if (!selectedDPME.value) {
    toast({
      message: 'Please select a Deputy Program Manager Engineering',
      type: 'is-warning',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
    return
  }

  // Get personnel IDs from selected names
  console.log('Selected personnel names:', {
    PM: selectedPM.value,
    FA: selectedFA.value,
    DPME: selectedDPME.value
  })
  
  const pmId = getPersonnelIdByName(selectedPM.value)
  const faId = getPersonnelIdByName(selectedFA.value)
  const dpmeId = getPersonnelIdByName(selectedDPME.value)
  
  console.log('Resolved personnel IDs:', { pmId, faId, dpmeId })

  if (!pmId || !faId || !dpmeId) {
    toast({
      message: 'Error identifying selected personnel',
      type: 'is-danger',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
    return
  }

  const requestData = {
    contract_number: contractNumber.value,
    program_name: programName.value,
    project_number: projectNumber.value,
    pm_id: pmId,
    fa_id: faId,
    dpme_id: dpmeId,
  }
  
  console.log('Sending workpackage data to API:', requestData)

  try {
    const response = await fetch(`${apiAddress}/api/workpackages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to save contract')
    }

    // Clear the inputs after successful save
    contractNumber.value = ''
    programName.value = ''
    projectNumber.value = ''
    selectedPM.value = ''
    selectedFA.value = ''
    selectedDPME.value = ''

    // Show success message
    toast({
      message: 'Contract saved successfully',
      type: 'is-success',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })

    // Refresh the contract information list
    fetchWorkpackages()
  } catch (error) {
    console.error('Error saving contract:', error)
    
    toast({
      message: error.message || 'Error saving contract',
      type: 'is-danger',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  }
}

// Function to show delete confirmation modal
const showDeleteModal = (workpackage) => {
  workpackageToDelete.value = workpackage
  isDeleteModalActive.value = true
}

// Function to delete a workpackage
const deleteWorkpackage = async () => {
  if (!workpackageToDelete.value || !workpackageToDelete.value.id) {
    return
  }

  try {
    const response = await fetch(`${apiAddress}/api/workpackages/${workpackageToDelete.value.id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete workpackage')
    }

    // Show success message
    toast({
      message: 'Workpackage deleted successfully',
      type: 'is-success',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })

    // Refresh the contract information list
    fetchWorkpackages()
  } catch (error) {
    console.error('Error deleting workpackage:', error)
    
    toast({
      message: error.message || 'Error deleting workpackage',
      type: 'is-danger',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  } finally {
    // Close the modal
    isDeleteModalActive.value = false
    workpackageToDelete.value = null
  }
}

// Retrieve data when page is loaded
onMounted(() => {
  fetchPersonnel()
  fetchWorkpackages()
})
</script>

<template>
  <SectionGenerator :sectionTitle="sectionTitle" />
  <label class="label">Create Top Level Workpackage:</label>
  <div class="box">
    <!-- Master Contract Information Row -->
    <div class="columns">
      <!-- Contract Number field -->
      <div class="column is-4">
        <label class="label">Contract Number:</label>
        <div class="field">
          <div class="control">
            <input 
              class="input" 
              type="text" 
              placeholder="N00024-24-C-6240" 
              v-model="contractNumber"
            />
          </div>
        </div>
      </div>
      
      <!-- Program Name field -->
      <div class="column is-4">
        <label class="label">Program Name:</label>
        <div class="field">
          <div class="control">
            <input 
              class="input" 
              type="text" 
              placeholder="Nosis" 
              v-model="programName"
            />
          </div>
        </div>
      </div>
      <!-- Project Number field -->
      <div class="column is-4">
        <label class="label">Project Number:</label>
        <div class="field">
          <div class="control">
            <input 
              class="input" 
              type="text" 
              placeholder="538111" 
              v-model="projectNumber"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- Personnel Select Row -->
    <div class="columns">
      <div 
        v-for="item in selectFieldInformation"
        :key="item.name"
        :class="['column', item.colSize]"
      >
        <label class="label">{{ item.name }}:</label>
          <SelectInputFieldGenerator 
            :selectTitle="`Select ${item.name}`" 
            :optionsArray="item.options" 
            :modelValue="item.modelValue.value" 
            @update:modelValue="(val) => handleSelection(item.name, val)" 
          />
      </div>
    </div>
    <hr>
    <div class="columns">
      <div class="column has-text-right">
        <ButtonSuccess buttonText="Save" @click="saveContract" />
      </div>
    </div>
  </div>
  <!-- Top Contract Information -->
  <SectionGenerator sectionTitle="Contract Information" />
  <ContractListGenerator :inputArray="contractInfo" @deleteItem="showDeleteModal" />
  <!-- Delete Confirmation Modal -->
  <ModalGenerator
    :isActive="isDeleteModalActive"
    title="Delete Workpackage"
    :message="`Are you sure you want to delete the workpackage with contract number ${workpackageToDelete?.contractNumber}?`"
    confirmButtonText="Delete"
    cancelButtonText="Cancel"
    :isDanger="true"
    @confirm="deleteWorkpackage"
    @cancel="isDeleteModalActive = false"
    @close="isDeleteModalActive = false"
  />
</template>

<style scoped>
</style>