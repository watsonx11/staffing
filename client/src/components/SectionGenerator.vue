<script setup>

const props = defineProps({
    sectionTitle: {
        type: String,
        default: 'Default String'
    },
    sectionSubtitle: {
        type: String,
        default: ''
    }
})

</script>

<template>
    <section class="section">
        <h1 class="title">{{ sectionTitle }}</h1>
        <h2 class="subtitle">
            {{ sectionSubtitle }}
        </h2>
    </section>
</template>