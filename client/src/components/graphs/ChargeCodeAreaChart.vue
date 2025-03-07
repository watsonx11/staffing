<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'vue-chartjs'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps({
  // Personnel data
  person: {
    type: Object,
    required: true
  },
  // Optional range
  months: {
    type: Number,
    default: 12
  },
  // Display props
  title: {
    type: String,
    default: 'Charge Code Allocation'
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

// Create a date range starting from today for the specified number of months
const generateDateRange = () => {
  const today = new Date()
  const dates = []
  
  for (let i = 0; i < props.months; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
    dates.push(date)
  }
  
  return dates
}

// Date range for the chart
const dateRange = ref(generateDateRange())

// Format date as "MMM YYYY"
const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date)
}

// Check if a charge code is active for a given date
const isChargeCodeActive = (chargeCode, date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  
  return chargeCode.endDate >= firstDayOfMonth && chargeCode.startDate <= lastDayOfMonth
}

// Calculate allocation for a charge code in a specific month
const calculateMonthlyAllocation = (chargeCode, date) => {
  if (!isChargeCodeActive(chargeCode, date)) {
    return 0
  }
  
  const year = date.getFullYear()
  const month = date.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // Calculate the start day (max of charge code start and month start)
  const startDate = new Date(Math.max(
    chargeCode.startDate.getTime(),
    new Date(year, month, 1).getTime()
  ))
  
  // Calculate the end day (min of charge code end and month end)
  const endDate = new Date(Math.min(
    chargeCode.endDate.getTime(),
    new Date(year, month + 1, 0).getTime()
  ))
  
  // Calculate days active in month
  const startDay = startDate.getDate()
  const endDay = endDate.getDate()
  const daysActive = endDay - startDay + 1
  
  // Calculate average percentage for the month
  return (chargeCode.percentage * daysActive) / daysInMonth
}

// Generate random colors for charge codes
const generateColors = (count) => {
  const colors = []
  for (let i = 0; i < count; i++) {
    const hue = (i * 137.5) % 360 // Use golden angle to spread colors
    colors.push(`hsla(${hue}, 70%, 60%, 0.7)`)
  }
  return colors
}

// Prepare chart data
const chartData = computed(() => {
  if (!props.person || !props.person.chargeCodes || props.person.chargeCodes.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }
  
  // Create labels from date range
  const labels = dateRange.value.map(date => formatDate(date))
  
  // Generate background colors for each charge code
  const backgroundColors = generateColors(props.person.chargeCodes.length)
  
  // Create datasets for each charge code
  const datasets = props.person.chargeCodes.map((chargeCode, index) => {
    const data = dateRange.value.map(date => calculateMonthlyAllocation(chargeCode, date))
    
    return {
      label: chargeCode.name,
      data: data,
      backgroundColor: backgroundColors[index],
      borderColor: backgroundColors[index].replace('0.7', '1'),
      borderWidth: 1,
      fill: true
    }
  })
  
  return {
    labels,
    datasets
  }
})

// Default chart options
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
      title: {
        display: true,
        text: 'Month'
      }
    },
    y: {
      stacked: true,
      min: 0,
      max: 100,
      title: {
        display: true,
        text: 'Allocation (%)'
      }
    }
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 15
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
          const label = context.dataset.label || ''
          const value = Math.round(context.raw * 10) / 10
          return `${label}: ${value}%`
        }
      }
    }
  }
}

// Merge default options with user-provided options
const mergedOptions = computed(() => {
  // Use a simple spread for merging
  return { ...defaultOptions, ...props.options }
})

// Watch for change in personnel or months to update the date range
watch(() => props.months, () => {
  dateRange.value = generateDateRange()
})

// Watch for title changes
watch(() => props.title, (newTitle) => {
  if (mergedOptions.value?.plugins?.title) {
    mergedOptions.value.plugins.title.display = !!newTitle
    mergedOptions.value.plugins.title.text = newTitle || ''
  }
})

// Check if there's data to display
const hasData = computed(() => {
  return props.person && 
         props.person.chargeCodes && 
         props.person.chargeCodes.length > 0 &&
         chartData.value.datasets.some(dataset => dataset.data.some(value => value > 0))
})
</script>

<template>
  <div class="area-chart-container" :style="{ height: height }">
    <h2 v-if="title" class="chart-title">{{ title }}</h2>
    <div v-if="loading" class="loading-indicator">
      <slot name="loading">Loading data...</slot>
    </div>
    <div v-else-if="error" class="error-message">
      <slot name="error">{{ error }}</slot>
    </div>
    <div v-else-if="!hasData" class="no-data-message">
      <slot name="empty">No charge code data available for the selected time period</slot>
    </div>
    <div v-else class="chart-wrapper">
      <Line 
        :data="chartData" 
        :options="mergedOptions" 
      />
    </div>
  </div>
</template>

<style scoped>
.area-chart-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.chart-title {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.2rem;
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
  font-style: italic;
}

.error-message {
  color: #d32f2f;
}
</style>