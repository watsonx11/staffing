<!-- Create a bulma CSS select drop down -->
<script setup>

const props = defineProps({
    selectTitle: {
        type: String,
        default: "Default Select"
    },
    optionsArray: {
        type: Array,
        default: [ 'Option One', 'Option Two' ]
    }
})

</script>

<template>
    <div class="select">
        <select>
            <option selected disabled>{{ selectTitle }}</option>
            <option
                v-for="(option, index) in optionsArray"
                :key="index"
            >
                {{ option }}
            
            </option>
        </select>
    </div>
</template>