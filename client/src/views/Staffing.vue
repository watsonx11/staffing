<!-- Staffing.vue -->
<script setup>
import { ref, computed, defineAsyncComponent, onMounted, watch } from 'vue'
import SectionGenerator from '@/components/SectionGenerator.vue'

// Import child components
const AddChargeCodeModal = defineAsyncComponent(() => import('@/components/staffing/AddChargeCodeModal.vue'))
const EditChargeCodesModal = defineAsyncComponent(() => import('@/components/staffing/EditChargeCodesModal.vue'))

const sectionTitle = "Charge Code Utilization Dashboard"

// All available charge codes - will be fetched from API
const availableChargeCodes = ref([])
const loadingChargeCodes = ref(false)
const chargeCodesError = ref(null)

// Personnel data - will be fetched from API
const personnelData = ref([])
const loadingPersonnel = ref(false)
const personnelError = ref(null)

// Contract filter
const selectedContract = ref('') // For contract filter

const availableContracts = computed(() => {
  // Create a map of unique contract-program combinations
  const contractsMap = new Map()
  
  // Add 'All Contracts' option
  contractsMap.set('', 'All Contracts')
  
  // Add contracts from available charge codes with program info
  availableChargeCodes.value.forEach(cc => {
    if (cc.contract) {
      const key = cc.contract
      const displayName = cc.program 
        ? `${cc.contract} - ${cc.program}` 
        : cc.contract
      
      contractsMap.set(key, displayName)
    }
  })
  
  // Convert to array of objects for select dropdown
  return Array.from(contractsMap).map(([value, text]) => ({ value, text }))
})


// Fetch charge codes from the API
const fetchChargeCodes = async () => {
  loadingChargeCodes.value = true
  chargeCodesError.value = null
  
  try {
    const response = await fetch('http://localhost:3000/api/charge-codes')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch charge codes: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transform the data into the required format
    availableChargeCodes.value = data.map(item => ({
      id: item.id,
      name: item.charge_code_name || `${item.task_ti} - ${item.project_name}`,
      startDate: new Date(item.start_date),
      endDate: new Date(item.end_date),
      contract: item.contract_number,
      program: item.program_name
    }))
    
    console.log('Fetched charge codes:', availableChargeCodes.value)
  } catch (error) {
    console.error('Error fetching charge codes:', error)
    chargeCodesError.value = error.message
    
    // Fallback to sample data in case of error
    availableChargeCodes.value = [
      { id: 1, name: 'Charge Code 1', contract: 'Contract A' },
      { id: 2, name: 'Charge Code 2', contract: 'Contract B' },
      { id: 3, name: 'Charge Code 3', contract: 'Contract A' },
      { id: 4, name: 'Charge Code 4', contract: 'Contract C' },
      { id: 5, name: 'Charge Code 5', contract: 'Contract B' },
      { id: 6, name: 'Charge Code 6', contract: 'Contract D' },
    ]
  } finally {
    loadingChargeCodes.value = false
  }
}

// Fetch personnel data from the API 
const fetchPersonnel = async () => {
  loadingPersonnel.value = true
  personnelError.value = null
  
  try {
    const response = await fetch('http://localhost:3000/api/personnel')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch personnel: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transform the data into the required format
    // We'll also need to fetch charge code assignments for each person
    const personnelWithChargeCodes = await Promise.all(
      data.map(async person => {
        // Create full name from first and last name
        const fullName = `${person.first_name} ${person.last_name}`
        
        // Fetch charge code assignments for this person
        let chargeCodes = []
        
        try {
          const chargeCodeResponse = await fetch(`http://localhost:3000/api/personnel/${person.id}/charge-codes`)
          
          if (chargeCodeResponse.ok) {
            const chargeCodeData = await chargeCodeResponse.json()
            chargeCodes = chargeCodeData.map(cc => ({
              id: cc.id,
              chargeCodeId: cc.line_item_id,
              name: cc.charge_code_name || `${cc.task_ti} - ${cc.project_name}`,
              percentage: cc.percentage,
              startDate: new Date(cc.start_date),
              endDate: new Date(cc.end_date),
              contract: cc.contract_number
            }))
          }
        } catch (error) {
          console.warn(`Could not fetch charge codes for ${fullName}:`, error)
        }
        
        return {
          id: person.id,
          name: fullName,
          email: person.email_address,
          position: person.position,
          location: person.location_name,
          chargeCodes: chargeCodes
        }
      })
    )
    
    personnelData.value = personnelWithChargeCodes
    console.log('Fetched personnel with charge codes:', personnelData.value)
  } catch (error) {
    console.error('Error fetching personnel:', error)
    personnelError.value = error.message
    
    // Fallback to sample data in case of error
    personnelData.value = [
      { 
        id: 1,
        name: 'Sean Watson',
        email: 'sean.watson@example.com',
        position: 'Developer',
        location: 'Remote',
        chargeCodes: [
          { 
            id: 1,
            chargeCodeId: 101,
            name: 'Charge Code 1', 
            percentage: 50,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2026-12-31'),
            contract: 'Contract A'
          },
          { 
            id: 2,
            chargeCodeId: 102,
            name: 'Charge Code 2', 
            percentage: 30,
            startDate: new Date('2025-03-01'),
            endDate: new Date('2025-07-31'),
            contract: 'Contract B'
          },
          { 
            id: 3,
            chargeCodeId: 103,
            name: 'Charge Code 3', 
            percentage: 20,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-05-31'),
            contract: 'Contract A'
          }
        ]
      },
      { 
        id: 2,
        name: 'Al Almanza',
        email: 'al.almanza@example.com',
        position: 'Project Manager',
        location: 'Office A',
        chargeCodes: [
          { 
            id: 4,
            chargeCodeId: 101,
            name: 'Charge Code 1', 
            percentage: 40,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            contract: 'Contract A'
          },
          { 
            id: 5,
            chargeCodeId: 104,
            name: 'Charge Code 4', 
            percentage: 60,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-10-31'),
            contract: 'Contract C'
          }
        ]
      },
      { 
        id: 3,
        name: 'DeShawn Baldwin',
        email: 'deshawn.baldwin@example.com',
        position: 'Designer',
        location: 'Office B',
        chargeCodes: [
          { 
            id: 6,
            chargeCodeId: 102,
            name: 'Charge Code 2', 
            percentage: 70,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            contract: 'Contract B'
          },
          { 
            id: 7,
            chargeCodeId: 105,
            name: 'Charge Code 5', 
            percentage: 30,
            startDate: new Date('2025-04-01'),
            endDate: new Date('2025-09-30'),
            contract: 'Contract B'
          }
        ]
      },
      { 
        id: 4,
        name: 'Jeff Vaught',
        email: 'jeff.vaught@example.com',
        position: 'Engineer',
        location: 'Office A',
        chargeCodes: [
          { 
            id: 8,
            chargeCodeId: 103,
            name: 'Charge Code 3', 
            percentage: 80,
            startDate: new Date('2025-02-01'),
            endDate: new Date('2025-10-31'),
            contract: 'Contract A'
          },
          { 
            id: 9,
            chargeCodeId: 105,
            name: 'Charge Code 5', 
            percentage: 20,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            contract: 'Contract B'
          }
        ]
      }
    ]
  } finally {
    loadingPersonnel.value = false
  }
}

// Function to add a new charge code to a person
const addChargeCode = async (newChargeCode) => {
  if (selectedPerson.value) {
    try {
      const personIndex = personnelData.value.findIndex(p => p.name === selectedPerson.value.name)
      
      if (personIndex !== -1) {
        const person = personnelData.value[personIndex]
        
        // Call API to add charge code
        // Assuming endpoint: POST /api/personnel/:id/charge-codes
        const payload = {
          personnel_id: person.id,
          line_item_id: newChargeCode.chargeCodeId || newChargeCode.id, // Use chargeCodeId if available
          charge_code_id: newChargeCode.chargeCodeId || newChargeCode.id, // For backward compatibility
          percentage: parseInt(newChargeCode.percentage), // Ensure percentage is an integer
          start_date: newChargeCode.startDate instanceof Date 
            ? newChargeCode.startDate.toISOString().split('T')[0] 
            : newChargeCode.startDate,
          end_date: newChargeCode.endDate instanceof Date 
            ? newChargeCode.endDate.toISOString().split('T')[0] 
            : newChargeCode.endDate,
          contract_number: newChargeCode.contract || '',
          is_active: true
        }
        
        console.log('Sending payload to API:', payload)
        
        // Try to post to API
        try {
          const response = await fetch(`http://localhost:3000/api/personnel/${person.id}/charge-codes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error(`API error details: ${errorText}`)
            throw new Error(`API error: ${response.status}`)
          }
          
          // Get the updated record from API
          const result = await response.json()
          console.log('API response for adding charge code:', result)
          
          // Create a new charge code with the returned ID if available
          const addedChargeCode = {
            ...newChargeCode,
            id: result.id || Date.now(), // Use the returned ID or generate a temporary one
            chargeCodeId: newChargeCode.chargeCodeId || newChargeCode.id
          }
          
          // Update UI
          personnelData.value[personIndex].chargeCodes.push(addedChargeCode)
        } catch (error) {
          console.error('Error adding charge code to API:', error)
          
          // For demo/development purposes, still update UI with a temporary ID
          const tempChargeCode = {
            ...newChargeCode,
            id: Date.now() // Generate a temporary ID
          }
          personnelData.value[personIndex].chargeCodes.push(tempChargeCode)
          
          // Optional: Show user-friendly error
          alert('Failed to save charge code to server. UI updated with temporary data.')
        }
      }
    } catch (error) {
      console.error('Error adding charge code:', error)
    }
  }
  activeModals.value.add = false
}

// Function to update existing charge codes
const updateChargeCodes = async (updatedChargeCodes) => {
  if (selectedPerson.value) {
    try {
      const personIndex = personnelData.value.findIndex(p => p.name === selectedPerson.value.name)
      
      if (personIndex !== -1) {
        const person = personnelData.value[personIndex]
        const apiSuccesses = []
        const apiFailures = []
        
        // Call API to update charge codes - each one separately
        for (const chargeCode of updatedChargeCodes) {
          const payload = {
            percentage: chargeCode.percentage,
            start_date: chargeCode.startDate instanceof Date 
              ? chargeCode.startDate.toISOString().split('T')[0] 
              : chargeCode.startDate,
            end_date: chargeCode.endDate instanceof Date 
              ? chargeCode.endDate.toISOString().split('T')[0] 
              : chargeCode.endDate
          }
          
          console.log(`Updating charge code assignment ${chargeCode.id} with:`, payload)
          
          try {
            // We're updating the personnel_charge_codes record
            const response = await fetch(`http://localhost:3000/api/personnel/${person.id}/charge-codes/${chargeCode.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            })
            
            if (!response.ok) {
              const errorText = await response.text()
              throw new Error(`API error (${response.status}): ${errorText}`)
            }
            
            const result = await response.json()
            console.log(`Updated charge code assignment ${chargeCode.id} via API:`, result)
            apiSuccesses.push(chargeCode.id)
          } catch (error) {
            console.error(`Error updating charge code ${chargeCode.id} via API:`, error)
            apiFailures.push({ id: chargeCode.id, error: error.message })
          }
        }
        
        // Update UI with the new charge codes
        personnelData.value[personIndex].chargeCodes = updatedChargeCodes
        
        // Show feedback if there were failures
        if (apiFailures.length > 0) {
          console.warn(`Failed to update ${apiFailures.length} charge code assignments`)
          if (apiFailures.length === updatedChargeCodes.length) {
            alert(`Failed to update any charge codes. Check the console for details.`)
          } else {
            alert(`Updated ${apiSuccesses.length} charge codes, but ${apiFailures.length} failed. UI has been updated anyway.`)
          }
        }
      }
    } catch (error) {
      console.error('Error updating charge codes:', error)
    }
  }
  activeModals.value.edit = false
}

// Get current date to determine start year and month
const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = currentDate.getMonth()

// Generate months dynamically - instead of hard-coding years, we'll generate a fixed number of months
// starting from current year and extending forward
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const numberOfMonthsToGenerate = 48 // 4 years worth of months (adjust as needed)
const visibleMonthsCount = 9 // Maximum visible months at once

// Generate all months dynamically
const allMonths = []
let baseYear = 2025 // Keep sample data starting from 2025
let baseMonth = 0

for (let i = 0; i < numberOfMonthsToGenerate; i++) {
  const year = baseYear + Math.floor((baseMonth + i) / 12)
  const month = (baseMonth + i) % 12
  
  allMonths.push({
    name: monthNames[month],
    year: year,
    fullDate: new Date(year, month, 1)
  })
}

// Find the index of the current month in allMonths
let currentMonthIndex = 0
for (let i = 0; i < allMonths.length; i++) {
  if (allMonths[i].year === currentYear && monthNames.indexOf(allMonths[i].name) === currentMonth) {
    currentMonthIndex = i
    break
  }
}

// Set startMonthIndex to the current month
const startMonthIndex = ref(currentMonthIndex)

// Computed property for visible months
const visibleMonths = computed(() => {
  return allMonths.slice(startMonthIndex.value, startMonthIndex.value + visibleMonthsCount)
})

// Functions for scrolling months
const scrollLeft = () => {
  if (startMonthIndex.value > 0) {
    startMonthIndex.value--
  }
}

const scrollRight = () => {
  if (startMonthIndex.value < allMonths.length - visibleMonthsCount) {
    startMonthIndex.value++
  }
}

// Check if a specific month is the current month
const isCurrentMonth = (month, year) => {
  return month === currentMonth && year === currentYear
}

// Search functionality
const searchQuery = ref('')

// Updated filtered personnel to consider both search query and contract filter
const filteredPersonnel = computed(() => {
  let result = personnelData.value
  
  // Apply name search filter if query is 3+ characters
  if (searchQuery.value && searchQuery.value.length >= 3) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(person => 
      person.name.toLowerCase().includes(query)
    )
  }
  
  // Apply contract filter if a contract is selected
  if (selectedContract.value) {
    result = result.filter(person => 
      person.chargeCodes.some(cc => cc.contract === selectedContract.value)
    )
  }
  
  return result
})

// Add a reactive state to track which cards are expanded
const expandedCards = ref({})

// Initialize expandedCards when personnel data is loaded
const initializeExpandedCards = () => {
  const newExpandedState = {}
  personnelData.value.forEach(person => {
    // Preserve existing state if available
    newExpandedState[person.name] = expandedCards.value[person.name] || false
  })
  expandedCards.value = newExpandedState
}

// Watch for personnel changes to update expanded cards state
watch(personnelData, () => {
  initializeExpandedCards()
}, { deep: true })

// Modal control states
const activeModals = ref({
    add: false,
    edit: false
})
const selectedPerson = ref(null)

// Function to toggle card expansion
const toggleCard = (personName) => {
    expandedCards.value[personName] = !expandedCards.value[personName]
}

// Function to open add charge code modal
const openAddModal = (person) => {
    selectedPerson.value = person
    activeModals.value.add = true
}

// Function to open edit charge codes modal
const openEditModal = (person) => {
    selectedPerson.value = person
    activeModals.value.edit = true
}

// Function to check if a charge code is active for a specific month and year
const isChargeCodeActive = (chargeCode, date) => {
    // Get the first day of the the month you are checking
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)

    // Get the last day of the month you are checking
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() +1, 0)

    // Check if any part of the charge ocde's udration overlaps with this month
    // Charge code is active if
    // 1. End date is on or after the first day of the month AND
    // 2. Start date is on or before the last day of the month
    return chargeCode.endDate >= firstDayOfMonth && chargeCode.startDate <= lastDayOfMonth
}

// Function to calculate total percentage per month for each person
const calculateMonthlyTotal = (person, date) => {
    let total = 0
    
    person.chargeCodes.forEach(chargeCode => {
        if (isChargeCodeActive(chargeCode, date)) {
            total += chargeCode.percentage
        }
    })
    
    return total
}

// Format date to "MMM YYYY" format
const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date)
}

// Reset filters
const resetFilters = () => {
  searchQuery.value = ''
  selectedContract.value = ''
}

// Load data when component is mounted
onMounted(async () => {
  await fetchChargeCodes()
  await fetchPersonnel()
  initializeExpandedCards()
})
</script>

<template>
    <SectionGenerator :sectionTitle="sectionTitle" />
    <hr>
    
    <!-- Loading states -->
    <div v-if="loadingPersonnel || loadingChargeCodes" class="notification is-info is-light">
        <p v-if="loadingPersonnel && loadingChargeCodes">Loading personnel and charge codes...</p>
        <p v-else-if="loadingPersonnel">Loading personnel data...</p>
        <p v-else>Loading charge codes...</p>
    </div>
    
    <!-- Error states -->
    <div v-if="personnelError || chargeCodesError" class="notification is-danger is-light">
        <p v-if="personnelError">Error loading personnel: {{ personnelError }}</p>
        <p v-if="chargeCodesError">Error loading charge codes: {{ chargeCodesError }}</p>
        <p>Using sample data instead.</p>
    </div>
    
    <!-- Filters -->
    <div class="filters-container mb-4">
        <div class="columns">
            <!-- Name search -->
            <div class="column is-4">
                <div class="field">
                    <label class="label">Name Search</label>
                    <div class="control">
                        <input 
                            class="input" 
                            type="text" 
                            placeholder="Search personnel..." 
                            v-model="searchQuery"
                        >
                    </div>
                </div>
            </div>
            <!-- Contract filter -->
            <div class="column is-4">
                <div class="field">
                    <label class="label">Contract Filter</label>
                    <div class="control">
                        <div class="select is-fullwidth">
                            <select v-model="selectedContract">
                                <option v-for="contract in availableContracts" 
                                        :key="contract.value" 
                                        :value="contract.value">
                                    {{ contract.text }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Reset filters button -->
            <div class="column is-2 is-flex is-align-items-flex-end">
                <button class="button is-light" @click="resetFilters">
                    Reset Filters
                </button>
            </div>
        </div>
    </div>
    
    <!-- Navigation controls -->
    <div class="month-navigation">
        <button class="button" @click="scrollLeft" :disabled="startMonthIndex === 0">
            ←
        </button>
        <button class="button" @click="scrollRight" :disabled="startMonthIndex >= allMonths.length - visibleMonthsCount">
            →
        </button>
    </div>
    
    <!-- Header row -->
    <div class="columns is-marginless">
        <!-- Personnel header -->
        <div class="column is-3 is-top-row">
            <div>Personnel</div>
            <div class="filter-info" v-if="selectedContract || (searchQuery && searchQuery.length >= 3)">
                <span v-if="selectedContract">
                    Contract: {{ availableContracts.find(c => c.value === selectedContract)?.text || selectedContract }}
                </span>
                <span v-if="selectedContract && (searchQuery && searchQuery.length >= 3)"> | </span>
                <span v-if="searchQuery && searchQuery.length >= 3">Search: "{{ searchQuery }}"</span>
            </div>
        </div>
        <!-- Month headers with year annotation -->
        <div 
            v-for="(month, index) in visibleMonths"
            :key="index"
            class="column is-1 is-top-row has-text-weight-bold"
            :class="{ 'current-month': isCurrentMonth(monthNames.indexOf(month.name), month.year) }"
        >
            <div>{{ month.name }}</div>
            <div class="year-label">{{ month.year }}</div>
        </div>
    </div>
    
    <!-- No personnel message -->
    <div v-if="personnelData.length === 0 && !loadingPersonnel" class="notification is-warning">
        No personnel data available. Please add personnel records first.
    </div>
    
    <!-- No results message when filters are applied -->
    <div v-else-if="filteredPersonnel.length === 0 && !loadingPersonnel" class="notification is-info">
        No personnel match the current filters. Try changing your search terms or contract filter.
    </div>
    
    <!-- Personnel rows -->
    <div v-for="(person, personIndex) in filteredPersonnel" :key="personIndex" class="person-row">
        <!-- Main row with person name and total percentages -->
        <div class="columns is-marginless">
            <!-- Personnel column with card -->
            <div class="column is-3">
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title">{{ person.name }}</p>
                        <button class="card-header-icon" @click="toggleCard(person.name)">
                            <span class="icon">
                                {{ expandedCards[person.name] ? '▲' : '▼' }}
                            </span>
                        </button>
                    </header>
                    <footer class="card-footer">
                        <a href="#" class="card-footer-item" @click.prevent="openAddModal(person)">Add</a>
                        <a href="#" class="card-footer-item" @click.prevent="openEditModal(person)">Edit</a>
                    </footer>
                </div>
            </div>
            
            <!-- Monthly total percentage columns -->
            <div 
                v-for="(month, index) in visibleMonths"
                :key="index"
                class="column is-1 has-text-centered"
                :class="{ 'current-month-column': isCurrentMonth(monthNames.indexOf(month.name), month.year) }"
            >
                <div 
                    class="percentage-display" 
                    :class="{ 'warning': calculateMonthlyTotal(person, month.fullDate) !== 100 }"
                >
                    {{ calculateMonthlyTotal(person, month.fullDate) }}%
                </div>
            </div>
        </div>
        
        <!-- Expanded card content showing individual charge codes -->
        <div v-if="expandedCards[person.name]" class="expanded-content">
            <div v-for="(chargeCode, codeIndex) in person.chargeCodes" :key="codeIndex" class="columns is-marginless">
                <div class="column is-3 charge-code-details">
                    <div class="pl-5">
                        {{ chargeCode.name }}: {{ chargeCode.percentage }}%
                        <div class="date-range">
                            {{ formatDate(chargeCode.startDate) }} - {{ formatDate(chargeCode.endDate) }}
                        </div>
                        <div class="contract-info" v-if="chargeCode.contract">
                            {{ chargeCode.contract }}
                        </div>
                    </div>
                </div>
                
                <!-- Show percentage only if active for this month -->
                <div 
                    v-for="(month, index) in visibleMonths"
                    :key="index"
                    class="column is-1 has-text-centered"
                    :class="{ 'current-month-column': isCurrentMonth(monthNames.indexOf(month.name), month.year) }"
                >
                    <div v-if="isChargeCodeActive(chargeCode, month.fullDate)" class="charge-code-percentage">
                        {{ chargeCode.percentage }}%
                    </div>
                    <div v-else class="charge-code-inactive">
                        -
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Add Charge Code Modal -->
    <AddChargeCodeModal 
        v-if="activeModals.add" 
        :person="selectedPerson"
        :availableChargeCodes="availableChargeCodes"
        @close="activeModals.add = false"
        @add="addChargeCode"
    />
    
    <!-- Edit Charge Codes Modal -->
    <EditChargeCodesModal 
        v-if="activeModals.edit" 
        :person="selectedPerson"
        :availableChargeCodes="availableChargeCodes"
        @close="activeModals.edit = false"
        @update="updateChargeCodes"
    />
</template>

<style scoped>
.is-top-row {
    border-bottom: 1px solid lightgray;
    font-weight: bold;
    padding-bottom: 0.75rem;
}

.filters-container {
    background-color: #f8f8f8;
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
}

.filter-info {
    font-size: 0.8rem;
    color: #4a4a4a;
    font-weight: normal;
    margin-top: 0.25rem;
}

.field {
    margin-bottom: 0;
}

.is-month-column {
    border-right: 1px solid black;
}

.card {
    margin-bottom: 0;
    box-shadow: none;
    border: 1px solid #dbdbdb;
}

.card-header {
    box-shadow: none;
    border-bottom: 1px solid #dbdbdb;
}

.percentage-display {
    padding: 0.5rem 0;
    font-weight: bold;
}

.warning {
    color: #ff3860;
}

.person-row {
    border-bottom: 1px solid #f5f5f5;
    margin-bottom: 0.5rem;
}

.columns {
    margin-bottom: 0 !important;
    align-items: center;
}

.card-header-title {
    padding: 0.5rem 0.75rem;
}

.card-header-icon {
    padding: 0.5rem 0.75rem;
}

.card-footer-item {
    padding: 0.5rem;
}

.expanded-content {
    background-color: #f9f9f9;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e8e8e8;
}

.charge-code-details {
    font-size: 0.9rem;
}

.date-range {
    font-size: 0.8rem;
    color: #777;
    margin-top: 0.2rem;
}

.charge-code-percentage {
    color: #3273dc;
    font-weight: normal;
}

.charge-code-inactive {
    color: #aaa;
}

.pl-5 {
    padding-left: 1.5rem;
}

.month-navigation {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.month-navigation .button {
    margin: 0 0.5rem;
    min-width: 2.5rem;
}

.year-label {
    font-size: 0.7rem;
    color: #666;
    font-weight: normal;
}

.current-month {
    background-color: #fffbeb;
    border-bottom: 2px solid #ffdd57;
}

.current-month-column {
    background-color: #fffbeb;
}
</style>