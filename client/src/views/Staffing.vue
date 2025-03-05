<!-- Staffing.vue -->
<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import SectionGenerator from '@/components/SectionGenerator.vue'

// Import child components
const AddChargeCodeModal = defineAsyncComponent(() => import('@/components/staffing/AddChargeCodeModal.vue'))
const EditChargeCodesModal = defineAsyncComponent(() => import('@/components/staffing/EditChargeCodesModal.vue'))

const sectionTitle = "Charge Code Utilization Dashboard"

// All available charge codes for dropdown selection
const availableChargeCodes = ref([
  { id: 1, name: 'Charge Code 1' },
  { id: 2, name: 'Charge Code 2' },
  { id: 3, name: 'Charge Code 3' },
  { id: 4, name: 'Charge Code 4' },
  { id: 5, name: 'Charge Code 5' },
  { id: 6, name: 'Charge Code 6' },
])

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

// Add charge code data structure with date ranges and percentages
const personnelData = ref([
    { 
        name: 'Sean Watson',
        chargeCodes: [
            { 
                id: 1,
                name: 'Charge Code 1', 
                percentage: 50,
                startDate: new Date('2025-01-01'),
                endDate: new Date('2026-12-31')
            },
            { 
                id: 2,
                name: 'Charge Code 2', 
                percentage: 30,
                startDate: new Date('2025-03-01'),
                endDate: new Date('2025-07-31')
            },
            { 
                id: 3,
                name: 'Charge Code 3', 
                percentage: 20,
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-05-31')
            }
        ]
    },
    { 
        name: 'Al Almanza',
        chargeCodes: [
            { 
                id: 1,
                name: 'Charge Code 1', 
                percentage: 40,
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31')
            },
            { 
                id: 4,
                name: 'Charge Code 4', 
                percentage: 60,
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-10-31')
            }
        ]
    },
    { 
        name: 'DeShawn Baldwin',
        chargeCodes: [
            { 
                id: 2,
                name: 'Charge Code 2', 
                percentage: 70,
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31')
            },
            { 
                id: 5,
                name: 'Charge Code 5', 
                percentage: 30,
                startDate: new Date('2025-04-01'),
                endDate: new Date('2025-09-30')
            }
        ]
    },
    { 
        name: 'Jeff Vaught',
        chargeCodes: [
            { 
                id: 3,
                name: 'Charge Code 3', 
                percentage: 80,
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-10-31')
            },
            { 
                id: 5,
                name: 'Charge Code 5', 
                percentage: 20,
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31')
            }
        ]
    }
])

// Search functionality
const searchQuery = ref('')
const filteredPersonnel = computed(() => {
    if (!searchQuery.value || searchQuery.value.length < 3) {
        return personnelData.value
    }
    const query = searchQuery.value.toLowerCase()
    return personnelData.value.filter(person => 
        person.name.toLowerCase().includes(query)
    )
})

// Add a reactive state to track which cards are expanded
const expandedCards = ref({})

// Initialize expandedCards with all personnel set to collapsed
personnelData.value.forEach(person => {
    expandedCards.value[person.name] = false
})

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

// Function to add a new charge code to a person
const addChargeCode = (newChargeCode) => {
    if (selectedPerson.value) {
        const personIndex = personnelData.value.findIndex(p => p.name === selectedPerson.value.name)
        if (personIndex !== -1) {
            personnelData.value[personIndex].chargeCodes.push(newChargeCode)
        }
    }
    activeModals.value.add = false
}

// Function to update existing charge codes
const updateChargeCodes = (updatedChargeCodes) => {
    if (selectedPerson.value) {
        const personIndex = personnelData.value.findIndex(p => p.name === selectedPerson.value.name)
        if (personIndex !== -1) {
            personnelData.value[personIndex].chargeCodes = updatedChargeCodes
        }
    }
    activeModals.value.edit = false
}

// Function to check if a charge code is active for a specific month and year
const isChargeCodeActive = (chargeCode, date) => {
    return chargeCode.startDate <= date && chargeCode.endDate >= date
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
</script>

<template>
    <SectionGenerator :sectionTitle="sectionTitle" />
    <hr>
    
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
        <!-- Search input replacing Personnel header -->
        <div class="column is-3 is-top-row">
            <div class="field">
                <div class="control">
                    <input 
                        class="input" 
                        type="text" 
                        placeholder="Search names..." 
                        v-model="searchQuery"
                    >
                </div>
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