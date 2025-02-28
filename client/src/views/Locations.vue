<script setup>
import { ref } from 'vue'
import SectionGenerator from '@/components/SectionGenerator.vue'
import ButtonSuccess from '@/components/buttons/ButtonSuccess.vue';
import InputfieldGenerator from '@/components/InputfieldGenerator.vue';
import ReadOnlyInputFeild from '@/components/buttons/input_fields/ReadOnlyInputFeild.vue';

const sectionTitle = "Location Editor"
const sectionSubtitle = ""


const locations = ref([
    'Pearl Harbor',
    'San Diego',
    'Port Orchard',
    'Cleavland',
    'Las Vegas',
    'Kingsbay',
    'Norfolk',
    'Manassas',
    'Groton',
    'Remote',
])

</script>

<template>
    <SectionGenerator :sectionTitle="sectionTitle" :sectionSubtitle="sectionSubtitle" />
    <div class="box">
        <div class="columns">
            <div class="column is-11">
                <InputfieldGenerator />
            </div>
            <div class="column">
                <ButtonSuccess buttonText="Save" />
            </div>
        </div>
    </div>
    <div class="columns">
        <div class="column is-4">
            <div class="box">
                <div>
                    <ReadOnlyInputFeild valueText="Pearl Harbor"/>
                </div>
                <div>
                    <button class="button is-small">Edit</button>
                    <button class="button is-small">Delete</button>
                </div>
            </div>
        </div>
        <div class="column is-4">
            <div class="box">
                
                <div>
                    <ReadOnlyInputFeild valueText="San Deigo"/>
                </div>
            </div>
        </div>
        <div class="column is-4">
            <div class="box">
                <div>
                    <ReadOnlyInputFeild valueText="Port Orchard"/>
                </div>
            </div>
        </div>
    </div>
</template>