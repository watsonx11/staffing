<script setup>
import { ref, onMounted, computed } from 'vue'
import { toast } from 'bulma-toast'
import { useConfig } from '@/composables/useConfig'
import SectionGenerator from '@/components/SectionGenerator.vue'
import InputfieldGenerator from '@/components/InputfieldGenerator.vue'
import ReadOnlyInputField from '@/components/input_fields/ReadOnlyInputField.vue'
import ButtonSuccess from '@/components/buttons/ButtonSuccess.vue'
import ButtonDanger from '@/components/buttons/ButtonDanger.vue'
import ButtonWarning from '@/components/buttons/ButtonWarning.vue'
import ButtonInfo from '@/components/buttons/ButtonInfo.vue'
import ModalGenerator from '@/components/ModalGenerator.vue'

// Set the url for the database API
const { apiAddress } = useConfig()

// Import the toast function from bulma-toast

const sectionTitle = "Location Administration"
// const sectionSubtitle = "" // Can be added to SectionGenerator

// Reactive state
const locations = ref([])
const newLocationName = ref('')
const editingId = ref(null)
const editingName = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('') // New state for search functionality

// Modal state
const isDeleteModalActive = ref(false)
const locationToDelete = ref(null)

// Computed property for filtered locations
const filteredLocations = computed(() => {
  if (searchQuery.value.length < 3) {
    return locations.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return locations.value.filter(location => 
    location.name.toLowerCase().includes(query)
  )
})

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
  } finally {
    isLoading.value = false
  }
}

// Add a new location
const addLocation = async () => {
  if (!newLocationName.value.trim()) return
  
  try {
    const response = await fetch(`${apiAddress}/api/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newLocationName.value.trim() })
    })
    
    if (!response.ok) {
      throw new Error('Failed to add location')
    }
    
    // Clear input and refresh locations
    newLocationName.value = ''
    await fetchLocations()

    toast({
      message: 'Location added successfully',
      type: 'is-success',
      dismissible: true,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  } catch (error) {
    console.error('Error adding location:', error)
    errorMessage.value = 'Failed to add location'
    
    toast({
      message: 'Error adding location',
      type: 'is-danger',
      dismissible: true,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  }
}

// Start editing a location
const startEditing = (location) => {
  editingId.value = location.id
  editingName.value = location.name
}

// Cancel editing
const cancelEditing = () => {
  editingId.value = null
  editingName.value = ''
}

// Save edited location
const saveLocation = async () => {
  if (!editingName.value.trim() || !editingId.value) return
  
  try {
    const response = await fetch(`${apiAddress}/api/locations/${editingId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: editingName.value.trim() })
    })
    
    if (!response.ok) {
      throw new Error('Failed to update location')
    }
    
    // Reset editing state and refresh locations
    cancelEditing()
    await fetchLocations()

    toast({
      message: 'Location updated successfully',
      type: 'is-success',
      dismissible: true,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  } catch (error) {
    console.error('Error updating location:', error)
    errorMessage.value = 'Failed to update location'
    
    toast({
      message: 'Error updating location',
      type: 'is-danger',
      dismissible: true,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  }
}

// Show delete modal
const showDeleteModal = (location) => {
  locationToDelete.value = location
  isDeleteModalActive.value = true
}

// Confirm delete a location
const confirmDeleteLocation = async () => {
  if (!locationToDelete.value) return
  
  try {
    const response = await fetch(`${apiAddress}/api/locations/${locationToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete location')
    }
    
    await fetchLocations()
    
    toast({
      message: 'Location deleted successfully',
      type: 'is-success',
      dismissible: true,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  } catch (error) {
    console.error('Error deleting location:', error)
    errorMessage.value = 'Failed to delete location'
    
    toast({
      message: 'Error deleting location',
      type: 'is-danger',
      dismissible: true,
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  } finally {
    locationToDelete.value = null
  }
}

// Fetch locations on component mount
onMounted(fetchLocations)
</script>

<template>
  <SectionGenerator :sectionTitle="sectionTitle" />
  
  <div v-if="errorMessage" class="notification is-danger">
    {{ errorMessage }}
  </div>
  <label class="label">Create New Location:</label>
  <div class="box">
    <div class="columns">
      <div class="column is-11">
        <InputfieldGenerator 
          placeholder="Enter a new location"
          :valueText="newLocationName"
          @update:valueText="(val) => newLocationName = val"
        />
      </div>
      <div class="column">
        <ButtonSuccess buttonText="Save" @click="addLocation" />
      </div>
    </div>
  </div>
  
  <SectionGenerator sectionTitle="Current Locations" />
  
  <!-- New search field section -->
  <div class="box">
    <label class="label">Search Locations:</label>
    <InputfieldGenerator 
      placeholder="Enter at least 3 characters to search"
      :valueText="searchQuery"
      @update:valueText="(val) => searchQuery = val"
    />
    <p class="help" v-if="searchQuery.length > 0 && searchQuery.length < 3">
      Please enter at least 3 characters to filter locations
    </p>
  </div>
  
  <div v-if="isLoading && locations.length === 0" class="has-text-centered">
    <p>Loading locations...</p>
  </div>
  
  <div v-if="filteredLocations.length === 0 && !isLoading && searchQuery.length >= 3" class="notification is-info">
    No locations found matching "{{ searchQuery }}". Try a different search term.
  </div>
  
  <div class="columns is-multiline">
    <div class="column is-4" v-for="location in filteredLocations" :key="location.id">
      <div class="box">
        <div class="columns">
          <div class="column">
            <ReadOnlyInputField v-if="editingId !== location.id" :valueText="location.name" />
            <InputfieldGenerator
              v-else
              :valueText="editingName"
              @update:valueText="(val) => editingName = val"
              @keyup.enter="saveLocation"
            />
          </div>
        </div>
        <div class="columns">
          <div class="column is-7"></div>
          <div class="column is-2">
            <ButtonInfo 
              v-if="editingId !== location.id"
              buttonText="Edit" 
              extraClass="is-small"
              @click="startEditing(location)"
            />
            <ButtonSuccess
              v-else
              buttonText="Save"
              extraClass="is-small"
              @click="saveLocation"
            />
          </div>
          <div class="column is-2">
            <ButtonDanger
              v-if="editingId !== location.id"
              buttonText="Delete"
              extraClass="is-small is-outlined"
              @click="showDeleteModal(location)"
            />
            <ButtonWarning
              v-else
              buttonText="Cancel"
              extraClass="is-small"
              @click="cancelEditing"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <ModalGenerator
    :isActive="isDeleteModalActive"
    title="Confirm Location Deletion"
    :message="locationToDelete ? `Are you sure you want to delete the location '${locationToDelete.name}'?` : 'Are you sure you want to delete this location?'"
    confirmButtonText="Delete"
    :isDanger="true"
    :requireConfirmationText="true"
    confirmationPrompt="For security, please confirm deletion by typing:"
    :expectedConfirmationText="locationToDelete ? `Delete/${locationToDelete.name}` : ''"
    @confirm="confirmDeleteLocation"
    @cancel="isDeleteModalActive = false"
    @close="isDeleteModalActive = false"
  />
</template>