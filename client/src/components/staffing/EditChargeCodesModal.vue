<!-- EditChargeCodesModal.vue -->
<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  person: Object,
  availableChargeCodes: Array
})

const emit = defineEmits(['close', 'update'])

// Deep clone the charge codes to prevent direct mutation
const chargeCodes = ref([])

// Update charge codes when person changes
watch(() => props.person, () => {
  if (props.person) {
    chargeCodes.value = JSON.parse(JSON.stringify(props.person.chargeCodes)).map(code => ({
      ...code,
      startDate: formatDateForInput(code.startDate),
      endDate: formatDateForInput(code.endDate)
    }))
  }
}, { immediate: true })

// Helper function to format dates for input fields
function formatDateForInput(date) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Validation for each charge code
const chargeCodeIsValid = (code) => {
  return (
    code.percentage > 0 && 
    code.percentage <= 100 &&
    code.startDate && 
    code.endDate &&
    new Date(code.startDate) <= new Date(code.endDate)
  )
}

// Check if all charge codes are valid - we will not check for empty array
const formIsValid = computed(() => {
  // If there are no charge codes, we allow it - this is the fix
  if (chargeCodes.value.length === 0) {
    return true
  }
  // Otherwise check if each charge code is valid
  return chargeCodes.value.every(code => chargeCodeIsValid(code))
})

// Update a charge code field
function updateChargeCode(index, field, value) {
  chargeCodes.value[index][field] = value
}

// Remove a charge code
function removeChargeCode(index) {
  chargeCodes.value.splice(index, 1)
}

// Submit updated charge codes
function handleSubmit() {
  if (!formIsValid.value) return
  
  const updatedChargeCodes = chargeCodes.value.map(code => ({
    ...code,
    percentage: parseInt(code.percentage),
    startDate: new Date(code.startDate),
    endDate: new Date(code.endDate)
  }))
  
  emit('update', updatedChargeCodes)
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
        <p class="modal-card-title">Edit Charge Codes for {{ person?.name }}</p>
        <button class="delete" aria-label="close" @click="closeModal"></button>
      </header>
      <section class="modal-card-body">
        <div v-if="chargeCodes.length === 0" class="notification is-info">
          This person will have no charge codes assigned.
        </div>
        
        <div v-for="(code, index) in chargeCodes" :key="index" class="charge-code-item box">
          <div class="is-flex is-justify-content-space-between">
            <h4 class="title is-5">{{ code.name }}</h4>
            <button 
              class="delete" 
              @click="removeChargeCode(index)" 
              aria-label="remove charge code"
            ></button>
          </div>
          
          <div class="field">
            <label class="label">Percentage (%)</label>
            <div class="control">
              <input 
                class="input" 
                type="number" 
                min="1" 
                max="100" 
                :value="code.percentage"
                @input="e => updateChargeCode(index, 'percentage', e.target.value)"
                placeholder="Enter percentage (1-100)"
              >
            </div>
          </div>
          
          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label">Start Date</label>
                <div class="control">
                  <input 
                    class="input" 
                    type="date" 
                    :value="code.startDate"
                    @input="e => updateChargeCode(index, 'startDate', e.target.value)"
                  >
                </div>
              </div>
            </div>
            
            <div class="column">
              <div class="field">
                <label class="label">End Date</label>
                <div class="control">
                  <input 
                    class="input" 
                    type="date" 
                    :value="code.endDate"
                    @input="e => updateChargeCode(index, 'endDate', e.target.value)"
                  >
                </div>
              </div>
            </div>
          </div>
          
          <p v-if="code.startDate && code.endDate && new Date(code.startDate) > new Date(code.endDate)" class="help is-danger">
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
              Save Changes
            </button>
            <button class="button" @click="closeModal">Cancel</button>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-card {
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
}

.modal-card-body {
  max-height: 60vh;
  overflow-y: auto;
}

.charge-code-item {
  margin-bottom: 1.5rem;
  padding: 1.25rem;
}

.charge-code-item:last-child {
  margin-bottom: 0;
}
</style>