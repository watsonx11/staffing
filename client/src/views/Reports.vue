<script setup>
import { ref, computed, onMounted } from 'vue'
import SectionGenerator from '@/components/SectionGenerator.vue'
import PieGraphGenerator from '@/components/graphs/PieGraphGenerator.vue'
import usePersonnelData from '@/composables/usePersonnelData'

// Create Section Title
const sectionTitle = "Reports"

// Use the personnel data composable
const { personnelData, loadingPersonnel, personnelError, fetchPersonnel } = usePersonnelData(ref(null))

// Local state
const loading = ref(true)
const error = ref(null)

// Transform personnel data into the format needed for the pie chart
const locationData = computed(() => {
  // Group personnel by location
  const locationCounts = {}
  
  personnelData.value.forEach(person => {
    const locationName = person.location || 'Unassigned'
    locationCounts[locationName] = (locationCounts[locationName] || 0) + 1
  })
  
  // Convert to array format needed by the chart
  return Object.keys(locationCounts)
    .map(location => ({
      location,
      count: locationCounts[location]
    }))
    .sort((a, b) => b.count - a.count) // Sort by count descending
})

// Custom chart options (will be merged with defaults in PieGraphGenerator)
const chartOptions = {
    plugins: {
        legend: {
            position: 'right',
            align: 'start', // Align items to the start of the legend box'
            labels: {
                boxWidth: 15, // Smaller box for color indicator
                padding: 15 // Space between legend items
            }
        },
    }
}

// Combined loading and error states
const combinedLoading = computed(() => loading.value || loadingPersonnel.value)
const combinedError = computed(() => error.value || personnelError.value)

// Load data on component mount
onMounted(async () => {
  try {
    loading.value = true
    await fetchPersonnel()
    loading.value = false
  } catch (err) {
    error.value = `Failed to load location data: ${err.message}`
    loading.value = false
  }
})
</script>

<template>
    <SectionGenerator :sectionTitle="sectionTitle" />
    <div class="location-distribution">
        <PieGraphGenerator
            :data="locationData"
            :loading="loading"
            :error="error"
            title="Staff Distribution by Location"
            labelKey="location"
            valueKey="count"
            height="400px"
            :options="chartOptions"
        />
    </div>
</template>

<style scoped>
.location-distribution {
  margin-bottom: 24px;
}

.custom-empty-state {
  text-align: center;
  padding: 20px;
}
</style>
