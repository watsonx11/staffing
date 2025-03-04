<script setup>
import { ref } from 'vue'
import SectionGenerator from '@/components/SectionGenerator.vue'
import ButtonSuccess from '@/components/buttons/ButtonSuccess.vue'

const sectionTitle = 'Contract Line Item Admin'

const dynamicSectionVisible = ref(true) // TODO update this to false after UI design complete
const dynamicSectionTitle = ref('')

const contractList = ref([
    { contractNumber: 'N00024-24-C-6240', programName: 'Nosis', projectNumber: '538111' },
    { contractNumber: 'G302879', programName: 'APDL', projectNumber: '536606' },
])

const selectedOption = ref('')

const updateSelectedOption = () => {
    dynamicSectionVisible.value = true
    dynamicSectionTitle.value = selectedOption.value
}

const lineItemArray = ref([
    { field: 'taskTI', label: 'Task or TI number', placeholder: '1001', type: 'text', colLength: 'is-2' },
    { field: 'projectTask', label: 'Project Task', placeholder: '111', type: 'text' },
    { field: 'startDate', label: 'Start Date', placeholder: '01/30/2025', type: 'date' },
    { field: 'endDate', label: 'End Date', placeholder: '01/30/2026', type: 'date' },

])

</script>

<template>
    <SectionGenerator :sectionTitle="sectionTitle" />
    <div class="columns">
        <div class="column is-3 is-flex is-justify-content-end">
            <div class="select">
                <select v-model="selectedOption">
                    <option value="" disabled>Select Contract</option>
                    <option
                         v-for="(item, index) in contractList"
                         :key="index"
                        >
                            {{ item.contractNumber }} ({{ item.programName }})
                    </option>
                </select>
            </div>
        </div>
        <div class="column is-flex is-justify-content-start">
            <div>
                <button class="button" @click="updateSelectedOption">Select</button>
            </div>
        </div>
    </div>
    <hr>
    <div v-if="!dynamicSectionVisible">
        <div class="columns is-centered">
            <div class="column is-three-quarters">
                <article class="message is-info">
                    <div class="message-header">
                        <p>Select a Contract to Add/Edit Line Items</p>
                    </div>
                </article>
            </div>
        </div>
    </div>
    <div v-else>
        <div class="columns">
            <div class="column">
                <SectionGenerator :sectionTitle="dynamicSectionTitle" />
            </div>
        </div>
        <div class="columns">
            <div class="column">
                <div class="box"
                    v-for="(item, index) in lineItemArray"
                    :key="index"
                >
                    <div class="columns">
                        <div
                            class="column is-2"
                            :class="item.colLength"
                        >
                            <label class="label">{{ item.label }}:</label>
                            <input 
                                :type="item.type" class="input" :placeholder="item.placeholder"
                        >
                        </div>
                        <div class="column is-2">
                            <label class="label">Project Task:</label>
                            <input type="text" class="input" placeholder="111">
                        </div>
                        <div class="column is-2">
                            <label class="label">Start Date:</label>
                            <input type="date" class="input" placeholder="01-01-2025">
                        </div>
                        <div class="column is-2">
                            <label class="label">End Date:</label>
                            <input type="date" class="input" placeholder="01-01-2026">
                        </div>
                        <div class="column is-flex is-justify-content-end">
                            <div class="buttons">
                                <ButtonSuccess buttonText="Save" />
                                <ButtonSuccess buttonText="+" extraClass="is-outlined" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>