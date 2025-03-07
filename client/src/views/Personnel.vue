<script setup>
import { ref, onMounted } from 'vue'
import SectionGenerator from '@/components/SectionGenerator.vue'
import InputfieldGenerator from '@/components/InputfieldGenerator.vue'
import ButtonSuccess from '@/components/buttons/ButtonSuccess.vue'
import ButtonDanger from '@/components/buttons/ButtonDanger.vue'
import ModalGenerator from '@/components/ModalGenerator.vue'
import { toast } from 'bulma-toast'

// Set the url for the database API
const apiAddress = 'http://localhost:3000' // ${apiAddress} // TODO Update from new setup on Home.vue

const positionRadio = [
  "N/A",
  "Program Manager",
  "Financial Analyst",
  "Deputy Program Manager Engineering"
]

// Reactive state
const personnel = ref([])
const locations = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)

// Form fields
const firstName = ref('')
const lastName = ref('')
const emailAddress = ref('')
const selectedLocation = ref('')
const notes = ref('')
const selectedPersonnel = ref(null)
const isEditing = ref(false)
const selectedPosition = ref('N/A') // Default position selection
const coveragePercentage = ref(100) // Default coverage percentage

// Modal state
const isDeleteModalActive = ref(false)
const personToDelete = ref(null)

const sectionTitle = "Personnel Administration"

// Fetch locations from the database
const fetchLocations = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await fetch(`${apiAddress}/api/locations`)
    if (!response.ok) {
      throw new Error('Failed to fetch locations')
    }
    
    const data = await response.json()
    locations.value = data
  } catch (error) {
    console.error('Error fetching locations:', error)
    errorMessage.value = 'Failed to load locations'
    
    toast({
      message: 'Error loading locations',
      type: 'is-danger',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  } finally {
    isLoading.value = false
  }
}

// Fetch personnel from the database
const fetchPersonnel = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await fetch(`${apiAddress}/api/personnel`)
    if (!response.ok) {
      throw new Error('Failed to fetch personnel')
    }
    
    const data = await response.json()
    personnel.value = data
  } catch (error) {
    console.error('Error fetching personnel:', error)
    errorMessage.value = 'Failed to load personnel'
    
    toast({
      message: 'Error loading personnel',
      type: 'is-danger',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  } finally {
    isLoading.value = false
  }
}

// Handle form submission to add/update personnel
const handleSubmit = async () => {
  // Form validation
  if (!firstName.value || !lastName.value || !selectedLocation.value) {
    toast({
      message: 'First name, Last name, and Location are required',
      type: 'is-warning',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
    return
  }
  
  // Validate coverage percentage is a number between 0 and 100
  const percentageValue = parseInt(coveragePercentage.value)
  if (isNaN(percentageValue) || percentageValue < 0 || percentageValue > 100) {
    toast({
      message: 'Coverage percentage must be a number between 0 and 100',
      type: 'is-warning',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
    return
  }
  
  isSubmitting.value = true
  
  const personData = {
    first_name: firstName.value,
    last_name: lastName.value,
    email_address: emailAddress.value,
    location_id: parseInt(selectedLocation.value),
    notes: notes.value,
    position: selectedPosition.value, // Add position to the data payload
    coverage_percentage: percentageValue // Add coverage percentage to the data payload
  }
  
  try {
    let response
    let method
    let url = `${apiAddress}/api/personnel`
    
    if (isEditing.value && selectedPersonnel.value) {
      // Update existing personnel
      method = 'PUT'
      url = `${url}/${selectedPersonnel.value.id}`
    } else {
      // Add new personnel
      method = 'POST'
    }
    
    response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to save personnel')
    }
    
    // Success! Clear the form and refresh the personnel list
    resetForm()
    fetchPersonnel()
    
    toast({
      message: isEditing.value 
        ? `${firstName.value} ${lastName.value} updated successfully` 
        : `${firstName.value} ${lastName.value} added successfully`,
      type: 'is-success',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
    
  } catch (error) {
    console.error('Error saving personnel:', error)
    
    toast({
      message: error.message || 'Failed to save personnel',
      type: 'is-danger',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  } finally {
    isSubmitting.value = false
  }
}

// Edit a personnel record
const handleEdit = (person) => {
  selectedPersonnel.value = person
  isEditing.value = true
  
  // Populate form fields
  firstName.value = person.first_name
  lastName.value = person.last_name
  emailAddress.value = person.email_address
  selectedLocation.value = person.location_id.toString()
  notes.value = person.notes || ''
  selectedPosition.value = person.position || 'N/A' // Set position or default to N/A
  coveragePercentage.value = person.coverage_percentage !== undefined ? person.coverage_percentage : 100 // Set coverage percentage or default to 100
  
  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Show delete modal
const showDeleteModal = (person) => {
  personToDelete.value = person
  isDeleteModalActive.value = true
}

// Handle actual deletion after confirmation
const confirmDelete = async () => {
  if (!personToDelete.value) return
  
  try {
    const response = await fetch(`${apiAddress}/api/personnel/${personToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete personnel')
    }
    
    // Remove from local array
    personnel.value = personnel.value.filter(p => p.id !== personToDelete.value.id)
    
    toast({
      message: `${personToDelete.value.first_name} ${personToDelete.value.last_name} deleted successfully`,
      type: 'is-success',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  } catch (error) {
    console.error('Error deleting personnel:', error)
    
    toast({
      message: 'Failed to delete personnel',
      type: 'is-danger',
      dismissible: false,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  } finally {
    personToDelete.value = null
    isDeleteModalActive.value = false // Close the modal after deletion
  }
}

// Reset the form
const resetForm = () => {
  firstName.value = ''
  lastName.value = ''
  emailAddress.value = ''
  selectedLocation.value = ''
  notes.value = ''
  selectedPersonnel.value = null
  isEditing.value = false
  selectedPosition.value = 'N/A' // Reset position to default
  coveragePercentage.value = 100 // Reset coverage percentage to default
}

// Handle location selection
const handleLocationChange = (event) => {
  selectedLocation.value = event.target.value
}

// Handle position selection
const handlePositionChange = (position) => {
  selectedPosition.value = position
}

// Handle percentage input validation
const validatePercentageInput = (event) => {
  // Only allow numbers
  const value = event.target.value.replace(/[^0-9]/g, '')
  
  // Ensure the value is between 0 and 100
  let numValue = parseInt(value, 10)
  if (isNaN(numValue)) {
    numValue = 100 // Default to 100 if not a number
  } else if (numValue > 100) {
    numValue = 100 // Cap at 100
  }
  
  coveragePercentage.value = numValue
}

// Fetch data when the component is mounted
onMounted(() => {
  fetchLocations()
  fetchPersonnel()
})
</script>

<template>
    <SectionGenerator :sectionTitle="sectionTitle"/>
    
    <div v-if="errorMessage" class="notification is-danger">
        {{ errorMessage }}
    </div>
    
    <label class="label">{{ isEditing ? 'Edit Personnel' : 'Add New Personnel' }}</label>
    <div class="box">
      <div class="columns">
        <div class="column is-1"></div>
          <div class="column is-2">
            <label class="label"><span class="has-text-danger">*</span> First Name:</label>
              <InputfieldGenerator 
                placeholder="First Name"
                :valueText="firstName"
                @update:valueText="(val) => firstName = val"
              />
          </div>
          <div class="column is-2">
            <label class="label"><span class="has-text-danger">*</span> Last Name:</label>
            <InputfieldGenerator 
              placeholder="Last Name"
              :valueText="lastName"
              @update:valueText="(val) => lastName = val"
            />
          </div>
          <div class="column is-3">
            <label class="label">Email:</label>
            <InputfieldGenerator 
              placeholder="alex.smith@gd-ms.us"
              :valueText="emailAddress"
              @update:valueText="(val) => emailAddress = val"
            />
          </div>
          <div class="column is-2">
            <label class="label"><span class="has-text-danger">*</span> Location:</label>
            <div class="select is-normal" :class="{ 'is-loading': isLoading }">
              <select v-model="selectedLocation" @change="handleLocationChange">
                <option value="" disabled>Select location</option>
                  <option v-for="location in locations" :key="location.id" :value="location.id">
                    {{ location.name }}
                  </option>
              </select>
            </div>
          </div>
          <div class="column is-1">
            <label class="label">&nbsp;</label>
            <ButtonSuccess 
              :buttonText="isEditing ? 'Update' : 'Save'"
              :class="{ 'is-loading': isSubmitting }"
              @click="handleSubmit"
            />
          </div>
      </div>
      <div class="columns">
        <div class="column is-1"></div>
          <div class="column">
            <label class="label">Position:</label>
            <div class="radios">
              <label class="radio"
                v-for="(position, index) in positionRadio"
                :key="index"
              >
                <input 
                  type="radio" 
                  name="position" 
                  :value="position"
                  :checked="selectedPosition === position"
                  @change="handlePositionChange(position)" 
                />
                {{ position }}
              </label>
            </div>
          </div>
      </div>
      <div class="columns">
        <div class="column is-1"></div>
        <div class="column is-2">
          <label class="label">Coverage Percentage:</label>
          <div class="field has-addons">
            <div class="control is-expanded">
              <InputfieldGenerator 
                type="number"
                min="0"
                max="100"
                :valueText="coveragePercentage.toString()"
                @update:valueText="(val) => coveragePercentage = val"
                @input="validatePercentageInput"
              />
            </div>
            <div class="control">
              <a class="button is-static">
                %
              </a>
            </div>
          </div>
          <p class="help">Default is 100%. Used for charge code coverage calculations.</p>
        </div>
        <div class="column is-8"></div>
      </div>
      <div class="columns">
        <div class="column is-1"></div>
        <div class="column is-10">
          <label class="label">Notes:</label>
          <textarea 
            class="textarea" 
            placeholder="Add notes about this personnel (optional)..." 
            rows="5"
            v-model="notes"
          ></textarea>
        </div>
      </div>
      <div class="columns" v-if="isEditing">
          <div class="column is-11 has-text-right">
            <ButtonDanger buttonText="Cancel" extraClass="is-outlined" @click="resetForm" />
          </div>
      </div>
    </div>
    <SectionGenerator sectionTitle="Current Personnel" />
    
    <div v-if="isLoading" class="has-text-centered my-4">
        <span class="icon is-large">
            <i class="fas fa-spinner fa-pulse"></i>
        </span>
        <p>Loading personnel...</p>
    </div>
    
    <div v-else-if="personnel.length === 0" class="has-text-centered my-4">
        <p>No personnel found. Add your first personnel member above.</p>
    </div>
    
    <div v-else class="columns is-multiline">
      <div class="column is-3"
        v-for="person in personnel"
        :key="person.id"
      >
        <div class="card">
          <header class="card-header">
            <p class="card-header-title">{{ person.first_name }} {{ person.last_name }}</p>
          </header>
          <div class="card-content">
            <div class="content">
              <span class="has-text-weight-bold">Location: </span>{{ person.location_name }}<br>
              <a v-if="person.email_address" :href="`mailto:` + person.email_address">{{ person.email_address }}</a>
              <span v-else class="has-text-grey-light">No email provided</span>
              
              <!-- Display position if it exists -->
              <div v-if="person.position && person.position !== 'N/A'" class="mt-2">
                <span class="has-text-weight-bold">Position: </span>
                <span class="tag is-info">{{ person.position }}</span>
              </div>

              <!-- Display coverage percentage -->
              <div class="mt-2">
                <span class="has-text-weight-bold">Coverage: </span>
                <span 
                  class="tag" 
                  :class="{
                    'is-success': person.coverage_percentage === 100,
                    'is-light is-success': person.coverage_percentage < 100 && person.coverage_percentage >= 75,
                    'is-light is-info': person.coverage_percentage < 75 && person.coverage_percentage >= 20,
                    'is-light': person.coverage_percentage < 10
                  }"
                >
                  {{ person.coverage_percentage || 100 }}%
                </span>
              </div>
              
              <!-- Display notes if they exist -->
              <div v-if="person.notes" class="mt-2">
                <span class="has-text-weight-bold">Notes: </span>
                <p class="is-size-7">{{ person.notes }}</p>
              </div>
            </div>
          </div>
          <footer class="card-footer">
            <a @click.prevent="handleEdit(person)" class="card-footer-item">Edit</a>
            <a @click.prevent="showDeleteModal(person)" class="card-footer-item">Delete</a>
          </footer>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <ModalGenerator
      :isActive="isDeleteModalActive"
      title="Confirm Deletion"
      :message="personToDelete ? `Are you sure you want to delete ${personToDelete.first_name} ${personToDelete.last_name}?` : 'Are you sure you want to delete this personnel?'"
      confirmButtonText="Delete"
      :isDanger="true"
      :requireConfirmationText="true"
      confirmationPrompt="For security, please confirm deletion by typing:"
      :expectedConfirmationText="personToDelete ? `Delete/${personToDelete.first_name} ${personToDelete.last_name}` : ''"
      @confirm="confirmDelete"
      @cancel="isDeleteModalActive = false"
      @close="isDeleteModalActive = false"
    />
</template>