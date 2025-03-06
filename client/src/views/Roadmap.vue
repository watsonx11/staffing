<script setup>
import { ref } from 'vue'
import SectionGenerator from '@/components/SectionGenerator.vue'

const sectionTitle = "Roadmap"
</script>

<template>
    <SectionGenerator :sectionTitle="sectionTitle" />
    <hr>
    <div class="content">
        <ul>
            <li class="complete">Add custom staffing favicon</li>
            <li>Add Engineering tag to Personnel</li>
            <li>Add the ability to not flag a person is > or < 100% based on being supported by other programs</li>
            <li>Ability to bulk edit personnel and a single charge code</li>
            <li>Ability to bulk edit personnel and a charge code percentage</li>
            <li>Ability to bulk edit personnel and a charge code end date</li>
            <li>Flag for charge code is assigned to person and is > < POP</li>
            <li>Add Font Awesome icons</li>
            <li>Stacked graph for individuals</li>
            <li>Audit log for each page...</li>
            <li>Calendar view for understanding people and charge code</li>
            <li>Upcoming staffing changes</li>
            <li>Keycloak integration</li>
        </ul>
    </div>
</template>
<style scoped>
.complete {
    text-decoration: line-through;
}
</style>