// @/composables/usePersonnelData.js
import { ref, computed, watch } from 'vue'

export default function usePersonnelData(selectedContractRef) {
  // Personnel data state
  const personnelData = ref([])
  const loadingPersonnel = ref(false)
  const personnelError = ref(null)
  
  // Search functionality
  const searchQuery = ref('')
  
  // Expanded cards state
  const expandedCards = ref({})
  
  // Computed filtered personnel based on search and contract
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
    if (selectedContractRef.value) {
      result = result.filter(person => 
        person.chargeCodes.some(cc => cc.contract === selectedContractRef.value)
      )
    }
    
    return result
  })
  
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
  
  // Function to toggle card expansion
  const toggleCard = (personName) => {
    expandedCards.value[personName] = !expandedCards.value[personName]
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
            coverage_percentage: person.coverage_percentage, 
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
  
  // Add a charge code to a person
  const addChargeCode = async (selectedPerson, newChargeCode) => {
    if (selectedPerson) {
      try {
        const personIndex = personnelData.value.findIndex(p => p.name === selectedPerson.name)
        
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
  }
  
  // Update existing charge codes
  const updateChargeCodes = async (selectedPerson, updatedChargeCodes) => {
    if (selectedPerson) {
      try {
        const personIndex = personnelData.value.findIndex(p => p.name === selectedPerson.name)
        
        if (personIndex !== -1) {
          const person = personnelData.value[personIndex]
          
          console.log('Updating charge codes for', person.name, ':', updatedChargeCodes)
          
          // Format the charge codes for the API
          const formattedChargeCodes = updatedChargeCodes.map(cc => ({
            line_item_id: cc.chargeCodeId || cc.line_item_id,
            percentage: parseInt(cc.percentage),
            startDate: cc.startDate instanceof Date 
              ? cc.startDate.toISOString().split('T')[0] 
              : cc.startDate,
            endDate: cc.endDate instanceof Date 
              ? cc.endDate.toISOString().split('T')[0] 
              : cc.endDate
          }))
          
          try {
            // Use the new bulk update endpoint
            const response = await fetch(`http://localhost:3000/api/personnel/${person.id}/charge-codes-bulk`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ chargeCodes: formattedChargeCodes })
            })
            
            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || 'Failed to update charge codes')
            }
            
            // Get the response data
            const responseData = await response.json()
            console.log('Bulk update response:', responseData)
            
            // Update the UI immediately
            personnelData.value[personIndex].chargeCodes = updatedChargeCodes
            
            // Then refresh data to ensure consistency
            await fetchPersonnel()
            console.log('Successfully updated charge codes')
          } catch (error) {
            console.error('Error updating charge codes via bulk API:', error)
            
            // Still update the UI for better user experience, but show a warning
            personnelData.value[personIndex].chargeCodes = updatedChargeCodes
            alert(`Failed to save changes to server. UI has been updated but changes may not persist. Error: ${error.message}`)
          }
        }
      } catch (error) {
        console.error('Error in updateChargeCodes function:', error)
      }
    }
  }
  
  // Reset search filter
  const resetSearch = () => {
    searchQuery.value = ''
  }
  
  return {
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
  }
}