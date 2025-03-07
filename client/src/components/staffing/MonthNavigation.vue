<!-- src/components/staffing/MonthNavigation.vue -->
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    visibleMonthsCount: {
        type: Number,
        default: 9
    }
})

const emit = defineEmits(['update:months'])

// Get current date to determine start year and month
const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = currentDate.getMonth()

// Month names for display
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const numberOfMonthsToGenerate = 48 // 4 years worth of months

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
    const months = allMonths.slice(startMonthIndex.value, startMonthIndex.value + props.visibleMonthsCount)
    emit('update:months', months)
    return months
})

// Functions for scrolling months
const scrollLeft = () => {
    if (startMonthIndex.value > 0) {
        startMonthIndex.value--
    }
}

const resetCurrentMonth = () => {
    startMonthIndex.value = currentMonthIndex
}

const scrollRight = () => {
    if (startMonthIndex.value < allMonths.length - props.visibleMonthsCount) {
        startMonthIndex.value++
    }
}

// Check if a specific month is the current month
const isCurrentMonth = (monthIndex, year) => {
    return monthIndex === currentMonth && year === currentYear
}

// Expose properties to the parent component
defineExpose({
    allMonths,
    currentMonthIndex,
    visibleMonths,
    isCurrentMonth,
    monthNames
})
</script>

<template>
    <!-- Navigation controls -->
    <div class="month-navigation">
        <button class="button" @click="scrollLeft" :disabled="startMonthIndex === 0">
            ←
        </button>
        <button class="button is-info is-light" title="Jump to current month" @click="resetCurrentMonth">
            Current Month
        </button> 
        <button class="button" @click="scrollRight" :disabled="startMonthIndex >= allMonths.length - props.visibleMonthsCount">
            →
        </button>
    </div>

    <!-- Month header row -->
    <div class="columns is-marginless">
    <!-- Personnel header slot -->
        <slot name="personnel-header"></slot>

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