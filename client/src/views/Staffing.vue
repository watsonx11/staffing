<!-- Staffing.vue -->
<script setup>
import { ref, computed, defineAsyncComponent, onMounted, watch } from 'vue'
import SectionGenerator from '@/components/SectionGenerator.vue'
import MonthNavigation from '@/components/staffing/MonthNavigation.vue'

// Import Composables
import usePersonnelData from '@/composables/usePersonnelData'
import useChargeCodesData from '@/composables/useChargeCodesData'

// Import child components
const AddChargeCodeModal = defineAsyncComponent(() => import('@/components/staffing/AddChargeCodeModal.vue'))
const EditChargeCodesModal = defineAsyncComponent(() => import('@/components/staffing/EditChargeCodesModal.vue'))

const sectionTitle = "Charge Code Utilization Dashboard"

// Contract filter
const selectedContract = ref('') // For contract filter

// Use the personnel data composable
const {
    personnelData,
    loadingPersonnel,
    personnelError,
    searchQuery,
    filteredPersonnel,
    expandedCards,
    fetchPersonnel,
    initializeExpandedCards,
    toggleCard,
    addChargeCode,
    updateChargeCodes,
    resetSearch
} = usePersonnelData(selectedContract)

// Use the charge codes data composable
const {
    availableChargeCodes,
    loadingChargeCodes,
    chargeCodesError,
    fetchChargeCodes,
    isChargeCodeActive,
    calculateMonthlyTotal,
    getAvailableContracts,
    formatDate,
    hasOverallocation,
    getMaxDailyAllocation,
    isChargeCodeStartMonth,
    isChargeCodeEndMonth,
    startsOnFirstDayOfMonth,
    endsOnLastDayOfMonth,
    formatDayOnly
} = useChargeCodesData()

// Computed property for available contracts
const availableContracts = computed(() => getAvailableContracts(selectedContract.value))

// Modal control states
const activeModals = ref({
    add: false,
    edit: false
})
const selectedPerson = ref(null)

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

// Function to add a new charge code to a person (wrapper function)
const handleAddChargeCode = async (newChargeCode) => {
    await addChargeCode(selectedPerson.value, newChargeCode)
    activeModals.value.add = false
}

// Function to update existing charge codes (wrapper function)
const handleUpdateChargeCodes = async (updatedChargeCodes) => {
    await updateChargeCodes(selectedPerson.value, updatedChargeCodes)
    activeModals.value.edit = false
}

// For storing visible months from the MonthNavigation component
const visibleMonths = ref([])
const updateVisibleMonths = (months) => {
    visibleMonths.value = months
}

// Reset filters
const resetFilters = () => {
    resetSearch()
    selectedContract.value = ''
}

// Load data when component is mounted
onMounted(async () => {
    await fetchChargeCodes()
    await fetchPersonnel()
    initializeExpandedCards()
})

// Create a ref to the MonthNavigation component
const monthNavigationRef = ref(null)
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
    <div class="filters-container mb-4 mt-4">
        <div class="columns mb-0">
            <!-- Name search -->
            <div class="column is-4">
                <div class="field mb-0">
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
                <div class="field mb-0">
                    <label class="label">Contract Filter</label>
                    <div class="control">
                        <div class="select is-fullwidth">
                            <select v-model="selectedContract">
                                <option v-for="contract in availableContracts" 
                                    :key="contract.value" 
                                    :value="contract.value"
                                >
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

    <!-- Month Navigation Component -->
    <MonthNavigation 
        ref="monthNavigationRef"
        :visibleMonthsCount="9"
        @update:months="updateVisibleMonths"
    >
        <template #personnel-header>
        <!-- Personnel header -->
            <div class="column is-3 is-top-row">
                <div>Personnel</div>
                <div class="year-label has-text-weight-normal">&nbsp;</div>
                <div class="filter-info mt-1 has-text-weight-normal" v-if="selectedContract || (searchQuery && searchQuery.length >= 3)">
                    <span v-if="selectedContract">
                        Contract: {{ availableContracts.find(c => c.value === selectedContract)?.text || selectedContract }}
                    </span>
                    <span v-if="selectedContract && (searchQuery && searchQuery.length >= 3)"> | </span>
                    <span v-if="searchQuery && searchQuery.length >= 3">Search: "{{ searchQuery }}"</span>
                </div>
            </div>
        </template>
    </MonthNavigation>

    <!-- No personnel message -->
    <div v-if="personnelData.length === 0 && !loadingPersonnel" class="notification has-text-warning">
        No personnel data available. Please add personnel records first.
    </div>

    <!-- No results message when filters are applied -->
    <div v-else-if="filteredPersonnel.length === 0 && !loadingPersonnel" class="notification is-info">
        No personnel match the current filters. Try changing your search terms or contract filter.
    </div>

    <!-- Personnel rows -->
    <div v-for="(person, personIndex) in filteredPersonnel" :key="personIndex" class="person-row mb-2">
        <!-- Main row with person name and total percentages -->
        <div class="columns mb-0">
            <!-- Personnel column with card -->
            <div class="column is-3">
                <div class="card mb-0 mt-3">
                    <header class="card-header">
                        <p class="card-header-title">
                            {{ person.name }}
                            <span v-if="person.coverage_percentage !== undefined" class="coverage-indicator ml-2">
                                ({{ person.coverage_percentage || 100 }}%)
                            </span>
                        </p>
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
                :class="{ 'current-month-column': monthNavigationRef?.isCurrentMonth(monthNavigationRef.monthNames.indexOf(month.name), month.year) }"
            >
                <div 
                    class="percentage-display" 
                    :class="{ 
                        'has-text-warning': calculateMonthlyTotal(person, month.fullDate) < (person.coverage_percentage || 100),
                        'has-text-danger has-text-weight-bold': hasOverallocation(person, month.fullDate)
                    }"
                    :title="hasOverallocation(person, month.fullDate) ? 
                        `Warning: Max daily allocation is ${getMaxDailyAllocation(person, month.fullDate)}% exceeds coverage of ${person.coverage_percentage || 100}%` : 
                        ''"
                >
                    {{ calculateMonthlyTotal(person, month.fullDate) }}%
                    <div v-if="hasOverallocation(person, month.fullDate)" class="overallocation-marker is-flex is-align-items-center is-justify-content-center">!</div>
                </div>
            </div>
        </div>

        <!-- Expanded card content showing individual charge codes -->
        <div v-if="expandedCards[person.name]" class="expanded-content">
            <div v-for="(chargeCode, codeIndex) in person.chargeCodes" :key="codeIndex" class="columns mb-0">
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
                    :class="{ 'current-month-column': monthNavigationRef?.isCurrentMonth(monthNavigationRef.monthNames.indexOf(month.name), month.year) }"
                >
                    <div v-if="isChargeCodeActive(chargeCode, month.fullDate)" class="charge-code-percentage has-text-weight-normal">
                        {{ chargeCode.percentage }}%
            
                        <!-- Show start date if this is the start month and doesn't start on the 1st -->
                        <div 
                            v-if="isChargeCodeStartMonth(chargeCode, month.fullDate) && !startsOnFirstDayOfMonth(chargeCode, month.fullDate)" 
                            class="charge-code-date start-date"
                        >
                            <span>({{ formatDayOnly(chargeCode.startDate) }})</span>
                        </div>
            
                        <!-- Show end date if this is the end month and doesn't end on the last day -->
                        <div 
                            v-if="isChargeCodeEndMonth(chargeCode, month.fullDate) && !endsOnLastDayOfMonth(chargeCode, month.fullDate)" 
                            class="charge-code-date end-date"
                        >
                            <span>({{ formatDayOnly(chargeCode.endDate) }})</span>
                        </div>
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
        :availableContracts="availableContracts"
        @close="activeModals.add = false"
        @add="handleAddChargeCode"
    />

    <!-- Edit Charge Codes Modal -->
    <EditChargeCodesModal 
        v-if="activeModals.edit" 
        :person="selectedPerson"
        :availableChargeCodes="availableChargeCodes"
        @close="activeModals.edit = false"
        @update="handleUpdateChargeCodes"
    />
</template>

<style lange="scss">
@import '@/assets/main.scss';

</style>

<style scoped>

.filters-container {
    background-color: #f8f8f8;
    padding: 1rem;
    border-radius: 4px;
}

.filter-info {
    font-size: 0.8rem;
    color: #4a4a4a;
}

.is-month-column {
    border-right: 1px solid black;
}

.card,
.card-header {
    box-shadow: none;
    border: 1px solid #dbdbdb;
}

.percentage-display {
    padding: 0.5rem 0;
    font-weight: bold;
    position: relative;
}

.overallocation-marker {
    position: absolute;
    top: 0;
    right: 8px;
    font-size: 10px;
    background-color: #ff3860;
    color: white;
    width: 14px;
    height: 14px;
    border-radius: 50%;
}

.coverage-indicator {
    font-size: 0.9rem;
    font-weight: normal;
    color: #666;
}

.person-row {
    border-bottom: 1px solid #f5f5f5;
}

.columns {
    align-items: center;
}

.card-header-title,
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
}

.charge-code-inactive {
    color: #aaa;
}

.charge-code-date {
    font-size: 0.75rem;
    color: #555;
    margin-top: 0.1rem;
}

.start-date {
    color: #3273dc; /* Blue to match the percentage */
}

.end-date {
    color: #3273dc; /* Blue to match the percentage */
}

.year-label {
    font-size: 0.7rem;
    color: #666;
}

</style>