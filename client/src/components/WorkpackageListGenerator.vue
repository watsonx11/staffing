<script setup>

const props = defineProps({
    inputArray: {
        type: Array
    }
})

</script>

<template>
    <div class="columns is-multiline">
        <div class="column is-12"
            v-for="(item, index) in inputArray"
            :key="index"
        >
            <div class="box">
            {{ item.contractNumber }}
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>