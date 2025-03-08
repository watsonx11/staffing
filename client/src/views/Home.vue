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

// New reactive state for personnel by contract
const personnelByContractCount = ref([])
const isLoadingContractData = ref(false)
const contractErrorMessage = ref('')

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

// Fetch personnel by contract count from the database api
const fetchPersonnelByContractCount = async () => {
    isLoadingContractData.value = true
    contractErrorMessage.value = ''
    try {
        const response = await fetch(`${apiAddress}/api/personnel-by-contract`)
        if (!response.ok) {
            throw new Error('Failed to fetch personnel by contract data')
        }
        const data = await response.json()
        personnelByContractCount.value = data
    } catch (error) {
        console.error('Error fetching personnel by contract count', error)
        contractErrorMessage.value = 'Failed to load personnel by contract count'
        toast({
            message: 'Error loading contract data',
            type: 'is-danger',
            dismissible: false,
            animate: { in: 'fadIn', out: 'fadeOut' },
        })
    } finally {
        isLoadingContractData.value = false
    }
}

// Fetch data on component mount
onMounted(() => {
    fetchPersonnelCount()
    fetchPersonnelByContractCount()
})
</script>
<template>
    <SectionGenerator :sectionTitle="sectionTitle" :sectionSubtitle="sectionSubtitle"/>
    <div class="box">
        <nav id="level" class="level">
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
        </nav>
    </div>
    <hr>
    <div v-if="isLoadingContractData" class="has-text-centered my-5">
        <p class="is-size-5">Loading contract data...</p>
    </div>
    <div v-else-if="contractErrorMessage" class="has-text-centered my-5">
        <p class="is-size-5 has-text-danger">{{ contractErrorMessage }}</p>
        <button @click="fetchPersonnelByContractCount" class="button is-primary mt-2">
            Retry
        </button>
    </div>
    <div v-else-if="personnelByContractCount.length === 0" class="has-text-centered my-5">
        <p class="is-size-5">No contract personnel data available</p>
    </div>
    <div v-else class="columns is-multiline">
        <div 
            class="column is-3"
            v-for="(item, index) in personnelByContractCount"
            :key="index"    
        >
            <div class="box has-text-centered">
                <div class="columns">
                    <div class="column border-bottom-light-gray">
                        <span class="is-size-5">{{ item.contractname }}</span>
                    </div>
                </div>
                <div class="columns">
                    <div class="column">
                        <span class="is-size-1 has-text-weight-bold">{{ item.count }}</span>
                    </div>
                </div>
                <div class="columns">
                    <div class="column">
                        <span class="is-size-6 is-italic">Personnel Assigned</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>