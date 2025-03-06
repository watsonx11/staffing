<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'bulma-toast'
import SectionGenerator from '@/components/SectionGenerator.vue'
import OverallocatedCount from '@/components/home/OverallocatedCount.vue'
import UnderallocatedCount from '@/components/home/UnderallocatedCount.vue'
import UpcomingChargeCodeCount from '@/components/home/UpcomingChargeCodeCount.vue'
import { useConfig } from '@/composables/useConfig'

// Set the url for the database API
const { apiAddress } = useConfig()

const sectionTitle = "MRS Staffing Management"
const sectionSubtitle = ""
// Reactive state
const personnelCount = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')
// Fetch personnel count from the database api
const fetchPersonnelCount = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
        const response = await fetch(`${apiAddress}/api/personnel`)
        if (!response.ok) {
            throw new Error('Failed to fetch personnel data')
        }
        const data = await response.json()
        personnelCount.value = data.length
    } catch (error) {
        console.error('Error fetching personnel count', error)
        errorMessage.value = 'Failed to load personnel count'
        toast({
            message: 'Error loading personnel count',
            type: 'is-danger',
            dismissible: false,
            animate: { in: 'fadIn', out: 'fadeOut' },
        })
    } finally {
        isLoading.value = false
    }
}
// Fetch personnel on component mount
onMounted(fetchPersonnelCount)
</script>
<template>
    <SectionGenerator :sectionTitle="sectionTitle" :sectionSubtitle="sectionSubtitle"/>
    <div class="box">
        <div class="level">
            <div class="level-item has-text-centered">
                <div
                v-if="isLoading"    
                >
                <p class="heading">Personnel</p>
                <p class="title">Loading count...</p>
                </div>
                <div v-else>
                    <p class="heading">Personnel</p>
                    <p class="title">{{ personnelCount }}</p>
                </div>
            </div>
            <div class="level-item has-text-centered">
                <!-- Over-allocated personnel count component -->
                <OverallocatedCount />
            </div>
            <div class="level-item has-text-centered">
                <!-- Under-allocated personnel count component -->
                <UnderallocatedCount />
            </div>
            <div class="level-item has-text-centered">
                <!-- Upcoming charge code count component -->
                <UpcomingChargeCodeCount />
            </div>
        </div>
    </div>
</template>