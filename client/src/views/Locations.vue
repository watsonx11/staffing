<script setup>
import SectionGenerator from '@/components/SectionGenerator.vue'
import ButtonSuccess from '@/components/buttons/ButtonSuccess.vue';

const sectionTitle = "Location Editor"
const sectionSubtitle = ""

</script>

<template>
    <SectionGenerator :sectionTitle="sectionTitle" :sectionSubtitle="sectionSubtitle" />
    <div class="box">
        <div class="columns">
            <div class="column is-11">
                <input
                    class="input is-primary"
                    type="text"
                    placeholder="Primary input"
                />
            </div>
            <div class="column">
                <ButtonSuccess buttonText="Save" />
            </div>
        </div>
    </div>
</template>