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

  // Calculate total percentage per month for each person
  const calculateMonthlyTotal = (person, date) => {
    let total = 0
    
    person.chargeCodes.forEach(chargeCode => {
      if (isChargeCodeActive(chargeCode, date)) {
        total += chargeCode.percentage
      }
    })
    
    return total
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

  return {
    availableChargeCodes,
    loadingChargeCodes,
    chargeCodesError,
    fetchChargeCodes,
    isChargeCodeActive,
    calculateMonthlyTotal,
    getAvailableContracts,
    formatDate
  }
}