<script setup>
import { ref, watch } from 'vue'
import ButtonDanger from '@/components/buttons/ButtonDanger.vue'

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmation'
  },
  message: {
    type: String,
    default: 'Are you sure you want to perform this action?'
  },
  confirmButtonText: {
    type: String,
    default: 'Confirm'
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel'
  },
  isDanger: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const isModalActive = ref(props.isActive)

// Watch for changes to the isActive prop
watch(() => props.isActive, (newValue) => {
  isModalActive.value = newValue
})

// Handle confirm action
const handleConfirm = () => {
  emit('confirm')
  closeModal()
}

// Handle cancel action
const handleCancel = () => {
  emit('cancel')
  closeModal()
}

// Close the modal
const closeModal = () => {
  isModalActive.value = false
  emit('close')
}
</script>

<template>
    <div class="modal" :class="{ 'is-active': isModalActive }">
        <div class="modal-background" @click="handleCancel"></div>
        <div class="modal-card">
        <header class="modal-card-head" :class="{ 'has-background-danger': isDanger }">
            <p class="modal-card-title" :class="{ 'has-text-white': isDanger }">{{ title }}</p>
            <button class="delete" aria-label="close" @click="handleCancel"></button>
        </header>
        <section class="modal-card-body">
            {{ message }}
        </section>
        <footer class="modal-card-foot">
            <div class="buttons">
                <ButtonDanger 
                :buttonText="confirmButtonText"
                @click="handleConfirm"
                />
                <button class="button" @click="handleCancel">{{ cancelButtonText }}</button>
            </div>
        </footer>
        </div>
    </div>
</template>