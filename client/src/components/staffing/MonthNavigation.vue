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
    <div class="month-navigation is-flex is-justify-content-center mb-4">
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
    <div class="columns">
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
            <div class="year-label is-size-7 has-text-weight-normal">{{ month.year }}</div>
        </div>
    </div>
</template>

<style scoped>

.columns {
    margin-bottom: 0 !important;
    align-items: center;
}

.month-navigation .button {
    margin: 0 0.5rem;
    min-width: 2.5rem;
}

.year-label {
    color: #666666;
}
</style>