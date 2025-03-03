// src/composables/useBulmaCalendar.js
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import bulmaCalendar from 'bulma-calendar';
import 'bulma-calendar/dist/css/bulma-calendar.min.css';

export function useBulmaCalendar(modelValue, emit, options = {}) {
  const calendarRef = ref(null);
  let calendar = null;

  // Apply sensible defaults
  const calendarOptions = {
    type: 'date',
    displayMode: 'default',
    dateFormat: 'MM/DD/YYYY', 
    closeOnSelect: true,
    showClearButton: true,
    showTodayButton: true,
    ...options
  };

  onMounted(() => {
    if (!calendarRef.value) return;
    
    // Initialize the calendar on the referenced element
    calendar = bulmaCalendar.attach(calendarRef.value, calendarOptions);
    
    if (calendar && calendar.length > 0) {
      // Set initial value if provided
      if (modelValue.value) {
        calendar[0].value(new Date(modelValue.value));
      }
      
      // Direct event handling
      calendar[0].on('select', value => {
        if (value && value.data && value.data.date && value.data.date.start) {
          const date = value.data.date.start;
          const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
          emit('update:modelValue', formattedDate);
        }
      });
      
      calendar[0].on('clear', () => {
        emit('update:modelValue', '');
      });
    }
  });

  // Watch for external value changes
  watch(modelValue, (newValue) => {
    if (calendar && calendar.length > 0 && newValue) {
      calendar[0].value(new Date(newValue));
    }
  });

  onBeforeUnmount(() => {
    calendar = null;
  });

  return {
    calendarRef,
    calendar
  };
}