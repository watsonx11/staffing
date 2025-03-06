<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'bulma-toast'

const apiAddress = 'http://localhost:3000'
const upcomingCount = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')

const fetchUpcomingChargeCodeCount = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
        // Use the new endpoint URL
        const response = await fetch(`${apiAddress}/api/upcoming-charge-codes`)
        
        if (!response.ok) {
            throw new Error('Failed to fetch upcoming charge code data')
        }
        
        const data = await response.json()
        upcomingCount.value = data.count
    } catch (error) {
        console.error('Error fetching upcoming charge code count', error)
        errorMessage.value = 'Failed to load upcoming charge code count'
        // Use fallback value but don't show error toast
        upcomingCount.value = 0
        console.warn('Using fallback value for upcoming charge codes. API endpoint needs fixing.')
    } finally {
        isLoading.value = false
    }
}

// Fetch data on component mount
onMounted(fetchUpcomingChargeCodeCount)
</script>

<template>
    <div v-if="isLoading">
        <p class="heading">Staffing Changes</p>
        <p class="title">Loading...</p>
    </div>
    <div v-else>
        <p class="heading">Staffing Changes</p>
        <p class="title">{{ upcomingCount }}</p>
        <p class="is-size-7 has-text-grey">Next 14 days</p>
    </div>
</template>