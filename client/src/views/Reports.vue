<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import SectionGenerator from '@/components/SectionGenerator.vue'
import PieGraphGenerator from '@/components/graphs/PieGraphGenerator.vue'
import ChargeCodeAreaChart from '@/components/graphs/ChargeCodeAreaChart.vue'

// Import composables
import usePersonnelData from '@/composables/usePersonnelData'
import useChargeCodesData from '@/composables/useChargeCodesData'

// Create Section Title
const sectionTitle = "Reports"

// Use the personnel data composable with the contract filter
const contractFilter = ref(null)
const { 
  personnelData, 
  loadingPersonnel, 
  personnelError, 
  fetchPersonnel,
  addChargeCode,
  updateChargeCodes 
} = usePersonnelData(contractFilter)

// Use the charge codes data composable
const {
  availableChargeCodes,
  loadingChargeCodes,
  chargeCodesError,
  fetchChargeCodes,
  getAvailableContracts
} = useChargeCodesData()

// Local state
const loading = ref(true)
const error = ref(null)

// Selected person state for charge code chart
const selectedPersonId = ref(null)
const forecastMonths = ref(12)

// Transform personnel data into the format needed for the pie chart
const locationData = computed(() => {
  // Group personnel by location
  const locationCounts = {}
  
  personnelData.value.forEach(person => {
    const locationName = person.location || 'Unassigned'
    locationCounts[locationName] = (locationCounts[locationName] || 0) + 1
  })
  
  // Convert to array format needed by the chart
  return Object.keys(locationCounts)
    .map(location => ({
      location,
      count: locationCounts[location]
    }))
    .sort((a, b) => b.count - a.count) // Sort by count descending
})

// Available personnel for dropdown
const availablePersonnel = computed(() => {
  return personnelData.value
    .filter(person => person.chargeCodes && person.chargeCodes.length > 0)
    .map(person => ({
      id: person.id,
      name: person.name
    }))
})

// Available contracts for the modals
const availableContracts = computed(() => getAvailableContracts())

// Computed property for the currently selected person
const selectedPerson = computed(() => {
  if (!selectedPersonId.value) return null
  return personnelData.value.find(person => person.id === selectedPersonId.value)
})

// Chart title based on selected person
const chartTitle = computed(() => {
  if (!selectedPerson.value) return 'Charge Code Allocation'
  return `${selectedPerson.value.name} - Charge Code Allocation`
})

// Set default selected person when data loads
const initializeSelectedPerson = () => {
  if (availablePersonnel.value.length > 0 && !selectedPersonId.value) {
    selectedPersonId.value = availablePersonnel.value[0].id
  }
}

// Custom chart options (will be merged with defaults in PieGraphGenerator)
const chartOptions = {
    plugins: {
        legend: {
            position: 'right',
            align: 'start', // Align items to the start of the legend box
            labels: {
                boxWidth: 15, // Smaller box for color indicator
                padding: 15 // Space between legend items
            }
        },
    }
}

// Combined loading and error states
const combinedLoading = computed(() => loading.value || loadingPersonnel.value || loadingChargeCodes.value)
const combinedError = computed(() => error.value || personnelError.value || chargeCodesError.value)

// Watch for changes in personnel data to update selected person
watch(personnelData, () => {
  if (personnelData.value.length > 0 && !selectedPersonId.value) {
    initializeSelectedPerson()
  }
}, { deep: true })

// Handlers for charge code actions
const handleAddChargeCode = async (person, newChargeCode) => {
  await addChargeCode(person, newChargeCode)
}

const handleUpdateChargeCodes = async (person, updatedChargeCodes) => {
  await updateChargeCodes(person, updatedChargeCodes)
}

// Load data on component mount
onMounted(async () => {
  try {
    loading.value = true
    
    // Load charge codes first
    await fetchChargeCodes()
    
    // Then load personnel data
    await fetchPersonnel()
    
    // Set initial selected person after data is loaded
    initializeSelectedPerson()
    
    loading.value = false
  } catch (err) {
    error.value = `Failed to load data: ${err.message}`
    loading.value = false
  }
})
</script>

<template>
    <SectionGenerator :sectionTitle="sectionTitle" />
    
    <!-- Charge Code Allocation Chart -->
    <div class="report-section">
        <h3 class="section-title">Charge Code Allocation</h3>
        
        <div class="controls-container">
            <div class="field">
                <label class="label">Select Personnel</label>
                <div class="control">
                    <div class="select is-fullwidth">
                        <select v-model="selectedPersonId">
                            <option v-for="person in availablePersonnel" :key="person.id" :value="person.id">
                                {{ person.name }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="field">
                <label class="label">Forecast Period</label>
                <div class="control">
                    <div class="select is-fullwidth">
                        <select v-model="forecastMonths">
                            <option :value="3">3 Months</option>
                            <option :value="6">6 Months</option>
                            <option :value="12">12 Months</option>
                            <option :value="18">18 Months</option>
                            <option :value="24">24 Months</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="charge-code-chart">
            <ChargeCodeAreaChart
                :person="selectedPerson"
                :months="forecastMonths"
                :title="chartTitle"
                :loading="combinedLoading"
                :error="combinedError"
                :availableChargeCodes="availableChargeCodes"
                :availableContracts="availableContracts"
                height="400px"
                @addChargeCode="handleAddChargeCode"
                @updateChargeCodes="handleUpdateChargeCodes"
            >
                <template #empty>
                    <div class="custom-empty-state">
                        <p>No charge code data available for the selected person and time period.</p>
                        <p>Try selecting a different person or adjusting the forecast period.</p>
                        <p>Or use the Add button to assign charge codes to this person.</p>
                    </div>
                </template>
            </ChargeCodeAreaChart>
        </div>
    </div>

    <!-- Location Distribution Pie Chart -->
    <div class="report-section">
        <h3 class="section-title">Staff Distribution</h3>
        <div class="location-distribution">
            <PieGraphGenerator
                :data="locationData"
                :loading="loading"
                :error="error"
                title="Staff by Location"
                labelKey="location"
                valueKey="count"
                height="400px"
                :options="chartOptions"
            />
        </div>
    </div>
</template>

<style scoped>
.report-section {
    margin-bottom: 40px;
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
}

.section-title {
    font-size: 1.25rem;
    margin-bottom: 16px;
    color: #333;
    font-weight: 600;
}

.location-distribution,
.charge-code-chart {
    margin-bottom: 16px;
}

.controls-container {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    background-color: #f0f0f0;
    padding: 16px;
    border-radius: 6px;
}

.field {
    flex: 1;
    margin-bottom: 0;
}

.label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #363636;
    margin-bottom: 8px;
}

.custom-empty-state {
    text-align: center;
    padding: 20px;
}
</style>