<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  person: Object,
  availableChargeCodes: Array
})

const emit = defineEmits(['close', 'add'])

// Form state for adding new charge code
const formState = ref({
  chargeCodeId: '',
  percentage: 0,
  startDate: '',
  endDate: ''
})

// Computed properties
const selectedChargeCode = computed(() => {
  if (!formState.value.chargeCodeId) return null
  return props.availableChargeCodes.find(code => code.id === parseInt(formState.value.chargeCodeId))
})

// Filter out charge codes the person already has
const availableOptions = computed(() => {
  if (!props.person) return []
  
  const personChargeCodeIds = props.person.chargeCodes.map(code => code.id)
  return props.availableChargeCodes.filter(code => !personChargeCodeIds.includes(code.id))
})

// Initialize default dates
watch(() => props.person, () => {
  const today = new Date()
  const nextYear = new Date(today)
  nextYear.setFullYear(today.getFullYear() + 1)
  
  formState.value.startDate = formatDateForInput(today)
  formState.value.endDate = formatDateForInput(nextYear)
}, { immediate: true })

// Helper function to format dates for input fields
function formatDateForInput(date) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Validation
const formIsValid = computed(() => {
  return (
    formState.value.chargeCodeId && 
    formState.value.percentage > 0 && 
    formState.value.percentage <= 100 &&
    formState.value.startDate && 
    formState.value.endDate &&
    new Date(formState.value.startDate) <= new Date(formState.value.endDate)
  )
})

// Submit handler
function handleSubmit() {
  if (!formIsValid.value) return
  
  const newChargeCode = {
    id: parseInt(formState.value.chargeCodeId),
    name: selectedChargeCode.value.name,
    percentage: parseInt(formState.value.percentage),
    startDate: new Date(formState.value.startDate),
    endDate: new Date(formState.value.endDate)
  }
  
  emit('add', newChargeCode)
}

// Close modal
function closeModal() {
  emit('close')
}
</script>

<template>
  <div class="modal is-active">
    <div class="modal-background" @click="closeModal"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Add Charge Code for {{ person?.name }}</p>
        <button class="delete" aria-label="close" @click="closeModal"></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">Charge Code</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="formState.chargeCodeId">
                <option value="" disabled>Select a charge code</option>
                <option v-for="code in availableOptions" :key="code.id" :value="code.id">
                  {{ code.name }}
                </option>
              </select>
            </div>
          </div>
          <p v-if="availableOptions.length === 0" class="help is-danger">
            No more charge codes available to add
          </p>
        </div>
        
        <div class="field">
          <label class="label">Percentage (%)</label>
          <div class="control">
            <input 
              class="input" 
              type="number" 
              min="1" 
              max="100" 
              v-model="formState.percentage"
              placeholder="Enter percentage (1-100)"
            >
          </div>
        </div>
        
        <div class="field">
          <label class="label">Start Date</label>
          <div class="control">
            <input 
              class="input" 
              type="date" 
              v-model="formState.startDate"
            >
          </div>
        </div>
        
        <div class="field">
          <label class="label">End Date</label>
          <div class="control">
            <input 
              class="input" 
              type="date" 
              v-model="formState.endDate"
            >
          </div>
          <p v-if="formState.startDate && formState.endDate && new Date(formState.startDate) > new Date(formState.endDate)" class="help is-danger">
            End date must be after start date
          </p>
        </div>
      </section>
      <footer class="modal-card-foot">
        <div class="buttons">
            <button 
              class="button is-primary" 
              @click="handleSubmit" 
              :disabled="!formIsValid"
            >
              Add Charge Code
            </button>
            <button class="button" @click="closeModal">Cancel</button>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-card {
  max-width: 500px;
  width: 100%;
}
</style>