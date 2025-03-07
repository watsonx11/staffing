// src/composables/useChargeCodesData.js
import { ref, computed } from 'vue'

export default function useChargeCodesData() {
  // All available charge codes - will be fetched from API
  const availableChargeCodes = ref([])
  const loadingChargeCodes = ref(false)
  const chargeCodesError = ref(null)

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

  // Utility functions for charge codes
  const isChargeCodeActive = (chargeCode, date) => {
    // Get the first day of the month you are checking
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)

    // Get the last day of the month you are checking
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    // Check if any part of the charge code's duration overlaps with this month
    // Charge code is active if:
    // 1. End date is on or after the first day of the month AND
    // 2. Start date is on or before the last day of the month
    return chargeCode.endDate >= firstDayOfMonth && chargeCode.startDate <= lastDayOfMonth
  }

  // Calculate total percentage per month for each person using day-by-day calculation
  const calculateMonthlyTotal = (person, date) => {
    // Get the year and month from the date
    const year = date.getFullYear()
    const month = date.getMonth()
    
    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    // Create an array to store the percentage for each day of the month
    const dailyPercentages = Array(daysInMonth).fill(0)
    
    // For each charge code, calculate its contribution to each day
    person.chargeCodes.forEach(chargeCode => {
      // Skip if the charge code isn't active in this month
      if (!isChargeCodeActive(chargeCode, date)) {
        return
      }
      
      // Calculate the start day (max of charge code start and month start)
      const startDate = new Date(Math.max(
        chargeCode.startDate.getTime(),
        new Date(year, month, 1).getTime()
      ))
      
      // Calculate the end day (min of charge code end and month end)
      const endDate = new Date(Math.min(
        chargeCode.endDate.getTime(),
        new Date(year, month + 1, 0).getTime()
      ))
      
      // Get the start and end days within the month (0-indexed)
      const startDay = startDate.getDate() - 1
      const endDay = endDate.getDate() - 1
      
      // Add the percentage to each day in the range
      for (let day = startDay; day <= endDay; day++) {
        dailyPercentages[day] += chargeCode.percentage
      }
    })
    
    // Calculate the average percentage across all days in the month
    const totalPercentage = dailyPercentages.reduce((sum, percentage) => sum + percentage, 0)
    const averagePercentage = Math.round((totalPercentage / daysInMonth) * 10) / 10 // Rounded to 1 decimal place
    
    return averagePercentage
  }

  // Function to get available contracts from charge codes
  const getAvailableContracts = (selectedContract) => {
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
  }

  // Format date to "MMM YYYY" format
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date)
  }

  // Function to check if any day in the month exceeds 100%
  const hasOverallocation = (person, date) => {
    // Get the year and month from the date
    const year = date.getFullYear()
    const month = date.getMonth()
    
    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    // Create an array to store the percentage for each day of the month
    const dailyPercentages = Array(daysInMonth).fill(0)
    
    // For each charge code, calculate its contribution to each day
    person.chargeCodes.forEach(chargeCode => {
      // Skip if the charge code isn't active in this month
      if (!isChargeCodeActive(chargeCode, date)) {
        return
      }
      
      // Calculate the start day (max of charge code start and month start)
      const startDate = new Date(Math.max(
        chargeCode.startDate.getTime(), 
        new Date(year, month, 1).getTime()
      ))
      
      // Calculate the end day (min of charge code end and month end)
      const endDate = new Date(Math.min(
        chargeCode.endDate.getTime(),
        new Date(year, month + 1, 0).getTime()
      ))
      
      // Get the start and end days within the month (0-indexed)
      const startDay = startDate.getDate() - 1
      const endDay = endDate.getDate() - 1
      
      // Add the percentage to each day in the range
      for (let day = startDay; day <= endDay; day++) {
        dailyPercentages[day] += chargeCode.percentage
      }
    })
    
    // Check if any day exceeds 100%
    return dailyPercentages.some(percentage => percentage > 100)
  }

  // Get the maximum daily allocation percentage for the month
  const getMaxDailyAllocation = (person, date) => {
    // Get the year and month from the date
    const year = date.getFullYear()
    const month = date.getMonth()
    
    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    // Create an array to store the percentage for each day of the month
    const dailyPercentages = Array(daysInMonth).fill(0)
    
    // For each charge code, calculate its contribution to each day
    person.chargeCodes.forEach(chargeCode => {
      // Skip if the charge code isn't active in this month
      if (!isChargeCodeActive(chargeCode, date)) {
        return
      }
      
      // Calculate the start day (max of charge code start and month start)
      const startDate = new Date(Math.max(
        chargeCode.startDate.getTime(),
        new Date(year, month, 1).getTime()
      ))
      
      // Calculate the end day (min of charge code end and month end)
      const endDate = new Date(Math.min(
        chargeCode.endDate.getTime(),
        new Date(year, month + 1, 0).getTime()
      ))
      
      // Get the start and end days within the month (0-indexed)
      const startDay = startDate.getDate() - 1
      const endDay = endDate.getDate() - 1
      
      // Add the percentage to each day in the range
      for (let day = startDay; day <= endDay; day++) {
        dailyPercentages[day] += chargeCode.percentage
      }
    })
    
    // Return the maximum allocation for any day in the month
    return Math.max(...dailyPercentages)
  }

  // NEW FUNCTIONS FOR START/END DATE DISPLAY

  // Function to check if a month is the start month for a charge code
  const isChargeCodeStartMonth = (chargeCode, date) => {
    // Check if the charge code's start date falls within this month
    const startMonth = chargeCode.startDate.getMonth()
    const startYear = chargeCode.startDate.getFullYear()
    const currentMonth = date.getMonth()
    const currentYear = date.getFullYear()
    
    return startMonth === currentMonth && startYear === currentYear
  }

  // Function to check if a month is the end month for a charge code
  const isChargeCodeEndMonth = (chargeCode, date) => {
    // Check if the charge code's end date falls within this month
    const endMonth = chargeCode.endDate.getMonth()
    const endYear = chargeCode.endDate.getFullYear()
    const currentMonth = date.getMonth()
    const currentYear = date.getFullYear()
    
    return endMonth === currentMonth && endYear === currentYear
  }

  // Function to check if a charge code starts on first day of month
  const startsOnFirstDayOfMonth = (chargeCode, date) => {
    const startDay = chargeCode.startDate.getDate()
    return startDay === 1
  }

  // Function to check if a charge code ends on last day of month
  const endsOnLastDayOfMonth = (chargeCode, date) => {
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const endDay = chargeCode.endDate.getDate()
    return endDay === lastDayOfMonth
  }

  // Function to format just the day number
  const formatDayOnly = (date) => {
    return date.getDate()
  }

  return {
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
    // New helper functions
    isChargeCodeStartMonth,
    isChargeCodeEndMonth,
    startsOnFirstDayOfMonth,
    endsOnLastDayOfMonth,
    formatDayOnly
  }
}