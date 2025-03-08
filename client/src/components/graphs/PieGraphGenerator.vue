<script setup>
import { computed, watch } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js'
import { Pie } from 'vue-chartjs'

  // Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title)

const props = defineProps({
    // Data props
    data: {
        type: Array,
        required: true,
        default: () => []
    },
    labelKey: {
        type: String,
        default: 'label'
    },
    valueKey: {
        type: String,
        default: 'value'
    },
    colorKey: {
        type: String,
        default: null
    },
    
    // Display props
    title: {
        type: String,
        default: null
    },
    height: {
        type: String,
        default: '400px'
    },
    options: {
        type: Object,
        default: () => ({})
    },
    
    // State props
    loading: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: null
    }
})

// Check if we have data to display
const hasData = computed(() => {
    return props.data && props.data.length > 0
})

// Generate chart data from input data
const chartData = computed(() => {
    // Extract labels and values from the data using the specified keys
    const labels = props.data.map(item => item[props.labelKey] || 'Undefined')
    const values = props.data.map(item => item[props.valueKey] || 0)
    
    // Generate or use provided colors
    const backgroundColors = props.data.map((item, index) => {
      // If a colorKey is provided and the item has that key, use it
        if (props.colorKey && item[props.colorKey]) {
            return item[props.colorKey]
        }

      // Otherwise generate a color based on index
    const hue = (index * 137.5) % 360 // Use golden angle to spread colors
        return `hsl(${hue}, 70%, 60%)`
    })
    
    return {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }
        ]
    }
})

// Default chart options
const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'right',
            labels: {
                padding: 20,
                    font: {
                        size: 12
                    }
            }
        },
        title: {
            display: !!props.title,
            text: props.title || '',
            font: {
                size: 16
            }
        },
        tooltip: {
            callbacks: {
                label: (context) => {
                    const label = context.label || ''
                    const value = context.raw || 0
                    const total = context.dataset.data.reduce((a, b) => a + b, 0)
                    const percentage = Math.round((value / total) * 100)
                    return `${label}: ${value} (${percentage}%)`
                }   
            }
        }
    }
}

// Merge default options with user-provided options
const mergedOptions = computed(() => {
    // If you don't have deepMerge, you can use a simple spread instead
    // return { ...defaultOptions, ...props.options }
    
    // Deep merge implementation (better for nested objects)
    // Implement deepMerge or use lodash's _.merge
    return typeof deepMerge === 'function' 
        ? deepMerge(defaultOptions, props.options)
        : { ...defaultOptions, ...props.options }
})

// Update title in options when title prop changes
watch(() => props.title, (newTitle) => {
    if (mergedOptions.value?.plugins?.title) {
        mergedOptions.value.plugins.title.display = !!newTitle
        mergedOptions.value.plugins.title.text = newTitle || ''
    }
})
</script>

<template>
    <div class="pie-chart-container is-flex is-flex-direction-column" :style="{ height: height }">
        <h2 class="mt-0 mb-2 is-size-5" v-if="title">{{ title }}</h2>
        <div v-if="loading" class="loading-indicator is-italic">
            <slot name="loading">Loading data...</slot>
        </div>
        <div v-else-if="error" class="error-message has-text-danger is-italic">
            <slot name="error">{{ error }}</slot>
        </div>
        <div v-else-if="!hasData" class="no-data-message is-italic">
            <slot name="empty">No data available</slot>
        </div>
        <div v-else class="chart-wrapper">
            <Pie 
            :data="chartData" 
            :options="mergedOptions" 
            />
        </div>
    </div>
</template>

<style scoped>
.pie-chart-container {
    width: 100%;
    border-radius: 8px;
    background-color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 16px;
}

h2 {
    color: #333;
}

.chart-wrapper {
    flex-grow: 1;
    position: relative;
}

.loading-indicator, 
.error-message, 
.no-data-message {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
}

</style>