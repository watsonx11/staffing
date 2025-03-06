// src/composables/useConfig.js
import config from '@/services/config.js'

export function useConfig() {
    return {
    apiAddress: config.apiAddress
    }
}

// To use this add the following to each component

// Inside <script setup>
// import { useConfig } from '@/composables/useConfig'
// const { apiAddress } = useConfig()

// Use it directly
// const response = await fetch(`${apiAddress}/api/personnel`)