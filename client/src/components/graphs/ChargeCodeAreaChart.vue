<script setup>
import { ref, computed, watch, onMounted, defineAsyncComponent } from 'vue'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'vue-chartjs'

// Import modals as async components
const AddChargeCodeModal = defineAsyncComponent(() => import('@/components/staffing/AddChargeCodeModal.vue'))
const EditChargeCodesModal = defineAsyncComponent(() => import('@/components/staffing/EditChargeCodesModal.vue'))

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps({
  // Personnel data
  person: {
    type: Object,
    required: false,
    default: null
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
  },
  // Required for charge code management
  availableChargeCodes: {
    type: Array,
    default: () => []
  },
  availableContracts: {
    type: Array,
    default: () => []
  }
})

// Define emits
const emit = defineEmits(['addChargeCode', 'updateChargeCodes'])

// Modal control states
const activeModals = ref({
  add: false,
  edit: false
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

// Calculate coverage status
const coverageStatus = computed(() => {
  if (!props.person) return null;
  
  const coveragePercentage = props.person.coverage_percentage || 100;
  
  // Calculate the total allocation for the most recent month
  const currentMonth = dateRange.value[0]; // First month in our range (which is the current month)
  
  // Sum up all charge code allocations for this month
  let totalAllocation = 0;
  if (props.person.chargeCodes) {
    props.person.chargeCodes.forEach(chargeCode => {
      totalAllocation += calculateMonthlyAllocation(chargeCode, currentMonth);
    });
  }
  
  // Round to 1 decimal place
  totalAllocation = Math.round(totalAllocation * 10) / 10;
  
  // Check different coverage states
  const isCoverageMet = totalAllocation >= coveragePercentage;
  const isOverallocated = totalAllocation > 100;
  
  return {
    coveragePercentage,
    totalAllocation,
    isCoverageMet,
    isOverallocated
  };
});

// Calculate the max Y-axis value based on actual allocation
const yAxisMax = computed(() => {
  const defaultMax = 100;
  
  if (!props.person || !props.person.chargeCodes || props.person.chargeCodes.length === 0) {
    return defaultMax;
  }
  
  // Find the maximum allocation in any month
  let maxAllocation = 0;
  
  // Check allocation for each month in the date range
  dateRange.value.forEach(date => {
    let monthlyTotal = 0;
    
    // Sum all charge codes for this month
    props.person.chargeCodes.forEach(chargeCode => {
      monthlyTotal += calculateMonthlyAllocation(chargeCode, date);
    });
    
    maxAllocation = Math.max(maxAllocation, monthlyTotal);
  });
  
  // If max allocation is below default, return default
  if (maxAllocation <= defaultMax) {
    return defaultMax;
  }
  
  // Otherwise add 10% padding and round up to nearest 10
  return Math.ceil(maxAllocation * 1.1 / 10) * 10;
});

// Prepare chart data
const chartData = computed(() => {
  if (!props.person || !props.person.chargeCodes || props.person.chargeCodes.length === 0) {
    return {
      labels: dateRange.value.map(date => formatDate(date)),
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

// Default chart options with dynamic max Y axis based on coverage
const chartOptions = computed(() => {
  return {
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
        max: yAxisMax.value,
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
});

// Merge default options with user-provided options
const mergedOptions = computed(() => {
  // Use a deep merge strategy to ensure nested properties like scales.y.max are properly merged
  const options = JSON.parse(JSON.stringify(chartOptions.value));
  
  if (props.options) {
    // Merge top-level properties
    for (const key in props.options) {
      if (key === 'scales' && props.options.scales) {
        options.scales = options.scales || {};
        // Ensure scales.y.max from our computed property isn't overridden
        for (const axisKey in props.options.scales) {
          options.scales[axisKey] = options.scales[axisKey] || {};
          for (const propKey in props.options.scales[axisKey]) {
            // Skip the max property for y-axis to preserve our dynamic calculation
            if (!(axisKey === 'y' && propKey === 'max')) {
              options.scales[axisKey][propKey] = props.options.scales[axisKey][propKey];
            }
          }
        }
      } else if (key === 'plugins' && props.options.plugins) {
        options.plugins = options.plugins || {};
        for (const pluginKey in props.options.plugins) {
          options.plugins[pluginKey] = {
            ...options.plugins[pluginKey],
            ...props.options.plugins[pluginKey]
          };
        }
      } else {
        options[key] = props.options[key];
      }
    }
  }
  
  return options;
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

// Functions to handle modal actions
const openAddModal = () => {
  activeModals.value.add = true
}

const openEditModal = () => {
  activeModals.value.edit = true
}

const handleAddChargeCode = (newChargeCode) => {
  emit('addChargeCode', props.person, newChargeCode)
  activeModals.value.add = false
}

const handleUpdateChargeCodes = (updatedChargeCodes) => {
  emit('updateChargeCodes', props.person, updatedChargeCodes)
  activeModals.value.edit = false
}
</script>

<template>
  <div class="area-chart-container" :style="{ height: height }">
    <div class="chart-header">
      <div class="chart-header-left">
        <h2 v-if="title" class="chart-title">{{ title }}</h2>
        
        <!-- Add coverage status indicator -->
        <div v-if="person && coverageStatus" class="coverage-status">
          <span class="coverage-label">Coverage: </span>
          <span class="coverage-value" :class="{ 
            'is-success': coverageStatus.isCoverageMet && !coverageStatus.isOverallocated, 
            'is-warning': !coverageStatus.isCoverageMet,
            'is-danger': coverageStatus.isOverallocated
          }">
            {{ coverageStatus.totalAllocation }}% / {{ coverageStatus.coveragePercentage }}%
          </span>
        </div>
      </div>
      
      <!-- Add action buttons to match the staffing page -->
      <div v-if="person && !loading" class="chart-actions">
        <button class="button is-success is-small is-outlined" @click="openAddModal">Add</button>
        <button class="button is-info is-small is-outlined" :disabled="!person.chargeCodes || person.chargeCodes.length === 0" @click="openEditModal">Edit</button>
      </div>
    </div>
    
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
    
    <!-- Add Charge Code Modal -->
    <AddChargeCodeModal 
      v-if="activeModals.add" 
      :person="person"
      :availableChargeCodes="availableChargeCodes"
      :availableContracts="availableContracts"
      @close="activeModals.add = false"
      @add="handleAddChargeCode"
    />

    <!-- Edit Charge Codes Modal -->
    <EditChargeCodesModal 
      v-if="activeModals.edit" 
      :person="person"
      :availableChargeCodes="availableChargeCodes"
      @close="activeModals.edit = false"
      @update="handleUpdateChargeCodes"
    />
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

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chart-title {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.coverage-status {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  margin-top: 4px;
}

.coverage-label {
  font-weight: 600;
  margin-right: 5px;
}

.coverage-value {
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #f5f5f5;
  font-weight: 500;
}

.coverage-value.is-success {
  background-color: rgba(35, 209, 96, 0.2);
  color: #257953;
}

.coverage-value.is-warning {
  background-color: rgba(255, 221, 87, 0.2);
  color: #946c00;
}

.coverage-value.is-danger {
  background-color: rgba(241, 70, 104, 0.2);
  color: #c53030;
}

.chart-actions {
  display: flex;
  gap: 8px;
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