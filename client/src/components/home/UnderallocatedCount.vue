<script setup>
import { ref, onMounted, computed } from 'vue'
import { toast } from 'bulma-toast'
import { useConfig } from '@/composables/useConfig'

// Get the API address from config
const { apiAddress } = useConfig()

// Reactive state
const personnel = ref([])
const personnelChargeCodes = ref([])
const underallocatedCount = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')

// Get current date information for filtering
const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = currentDate.getMonth() + 1 // JavaScript months are 0-based
const firstDayOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate()
const lastDateOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${lastDayOfMonth}`

// Format current month name for display
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const currentMonthName = monthNames[currentMonth - 1]

// Fetch all personnel
const fetchPersonnel = async () => {
  try {
    const response = await fetch(`${apiAddress}/api/personnel`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch personnel data')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching personnel:', error)
    throw error
  }
}

// Fetch charge codes for each person
const fetchAllPersonnelChargeCodes = async (personnelList) => {
  const allChargeCodes = []
  
  for (const person of personnelList) {
    try {
      const response = await fetch(`${apiAddress}/api/personnel/${person.id}/charge-codes`)
      
      if (response.ok) {
        const chargeCodes = await response.json()
        allChargeCodes.push(...chargeCodes)
      }
    } catch (error) {
      console.error(`Error fetching charge codes for personnel ${person.id}:`, error)
    }
  }
  
  return allChargeCodes
}

// Calculate underallocated personnel based on coverage percentage
const calculateUnderallocatedPersonnel = () => {
  // Create a map to track total allocation percentage per person
  const allocationMap = new Map()
  
  // Create a personnel map to easily look up coverage percentages
  const personnelMap = new Map()
  personnel.value.forEach(person => {
    // Store the person object for easy lookup later
    personnelMap.set(person.id, person)
  
    // Initialize allocation at 0%
    allocationMap.set(person.id, 0)
  })
  
  // Filter charge codes that are active in the current month
  const activeChargeCodes = personnelChargeCodes.value.filter(code => {
    const startDate = new Date(code.start_date)
    const endDate = new Date(code.end_date)
    const currentMonthStart = new Date(firstDayOfMonth)
    const currentMonthEnd = new Date(lastDateOfMonth)
    
    return startDate <= currentMonthEnd && endDate >= currentMonthStart
  })
  
  // Sum up allocation percentages per person
  activeChargeCodes.forEach(code => {
    const personId = code.personnel_id
    if (allocationMap.has(personId)) {
      allocationMap.set(personId, allocationMap.get(personId) + code.percentage)
    }
    
    allocationMap.set(personId, allocationMap.get(personId) + code.percentage)
  })
  
  // Count people with allocations less than their coverage target
  let count = 0
  for (const [personId, allocationPercentage] of allocationMap.entries()) {
    const person = personnelMap.get(personId)
    
    // Get the person's target coverage percentage (default to 100% if not set)
    const targetCoverage = person.coverage_percentage !== undefined ? person.coverage_percentage : 100
    
    // Consider underallocated only if actual allocation is less than target coverage
    if (allocationPercentage < targetCoverage) {
      count++
    }
  }
  
  underallocatedCount.value = count
}

// Fetch all required data
const fetchData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // Get all personnel
    personnel.value = await fetchPersonnel()
    
    // Get all charge codes
    personnelChargeCodes.value = await fetchAllPersonnelChargeCodes(personnel.value)
    
    // Calculate underallocated personnel
    calculateUnderallocatedPersonnel()
  } catch (error) {
    console.error('Error in data fetching process:', error)
    errorMessage.value = 'Failed to fetch allocation data'
    
    toast({
      message: 'Error loading allocation data',
      type: 'is-danger',
      dismissible: true,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  } finally {
    isLoading.value = false
  }
}

// Fetch data on component mount
onMounted(fetchData)
</script>

<template>
  <div>
    <div v-if="isLoading">
      <p class="heading">Under Target</p>
      <p class="title">Loading...</p>
    </div>
    <div v-else>
      <p class="heading">Under Target</p>
      <p class="title" :class="{'has-text-warning': underallocatedCount > 0}">{{ underallocatedCount }}</p>
      <p class="is-size-7 has-text-grey">{{ currentMonthName }}</p>
    </div>
  </div>
</template>