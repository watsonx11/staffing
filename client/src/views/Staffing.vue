<script setup>
import { ref, computed } from 'vue'
import SectionGenerator from '@/components/SectionGenerator.vue'

const sectionTitle = "Charge Code Utilization Dashboard"

// Manage viewable date range with scrolling functionality
const startMonthIndex = ref(0) // Start with January
const visibleMonthsCount = 10 // Maximum visible months at once

// Generate months and years for 24 months (2 years)
const allMonths = []
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

for (let year = 2025; year <= 2026; year++) {
  for (let month = 0; month < 12; month++) {
    allMonths.push({
      name: monthNames[month],
      year: year,
      fullDate: new Date(year, month, 1)
    })
  }
}

// Get current date to highlight current month
const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = currentDate.getMonth()

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
                name: 'Charge Code 1', 
                percentage: 50,
                startDate: new Date('2025-01-01'),
                endDate: new Date('2026-12-31')
            },
            { 
                name: 'Charge Code 2', 
                percentage: 30,
                startDate: new Date('2025-03-01'),
                endDate: new Date('2025-07-31')
            },
            { 
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
                name: 'Charge Code 1', 
                percentage: 40,
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31')
            },
            { 
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
                name: 'Charge Code 2', 
                percentage: 70,
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31')
            },
            { 
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
                name: 'Charge Code 3', 
                percentage: 80,
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-10-31')
            },
            { 
                name: 'Charge Code 5', 
                percentage: 20,
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31')
            }
        ]
    }
])

// Add a reactive state to track which cards are expanded
const expandedCards = ref({})

// Initialize expandedCards with all personnel set to collapsed
personnelData.value.forEach(person => {
    expandedCards.value[person.name] = false
})

// Function to toggle card expansion
const toggleCard = (personName) => {
    expandedCards.value[personName] = !expandedCards.value[personName]
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
        <!-- Personnel header -->
        <div class="column is-2 is-top-row has-text-weight-bold">
            Personnel
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
    <div v-for="(person, personIndex) in personnelData" :key="personIndex" class="person-row">
        <!-- Main row with person name and total percentages -->
        <div class="columns is-marginless">
            <!-- Personnel column with card -->
            <div class="column is-2">
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
                        <a href="#" class="card-footer-item">Add</a>
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
                <div class="column is-2 charge-code-details">
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
</template>

<style scoped>
.is-top-row {
    border-bottom: 1px solid lightgray;
    font-weight: bold;
    padding-bottom: 0.75rem;
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