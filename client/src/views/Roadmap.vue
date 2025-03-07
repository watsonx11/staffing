<script setup>
import { ref } from 'vue'
import SectionGenerator from '@/components/SectionGenerator.vue'

const sectionTitle = "Roadmap"
</script>

<template>
    <SectionGenerator :sectionTitle="sectionTitle" />
    <hr>
    <div class="content">
        <p class="title">Completed</p>
        <ul class="complete">
            <li>Add custom staffing favicon</li>
            <li>Add the abilty to search locations</li>
            <li>Add a Focus on current month button in the Staffing page</li>
            <li>Dashboard count of people with up coming charge code changes</li>
            <li>Added employee by location pi chart to reports</li>
            <li>See the first day and last day of a persons assigned charge code in the drop down view per code</li>
            <li>Fix/Update overlap of dates and percentages on staffing page</li>
            <li>Set active link text to be a different (?gold?) color</li>
            <li>Added additional contract filtering in add charge code modal</li>
            <li>Stacked graph for individuals</li>
            <li>Add edit/add charge code for person on stacked graph</li>
        </ul>
        <hr>
        <p class="title">In Progress Development Items</p>
        <ul class="in-progress">
        </ul>
        <hr>
        <p class="title">Upcoming Development Items</p>
        <ul>
            <li>How many people are going to start a new charge code in the next rolling 14 days?</li>
                <ul>
                    <li>List of people and what charge code</li>
                    <li>?email generation? to simiply informing them?</li>
                </ul>
            <li>GDMS Accounting month/hours vice month/month for staffing</li>
            <li>Quick visual (bar graph?) underneath the percetages for each charge code showing a rough start/end of the charging?</li>
            <li>Ability to quickly focus on the Over/Under Allocated by clicking on the Home page to the Staffing Page?</li>
            <li>Add a expand/collapse all button on the staffing page to easily open/close all personnel cards</li>
            <li>Change default date to +1 month vice +1year in charge code add modal</li>
            <li>Add Engineering tag to Personnel</li>
            <li>Add the ability to not flag a person is > or < 100% based on being supported by other programs</li>
            <li>Add FTE/Month calculation based on accounting month</li>
            <li>OIDC integration</li>
            <li>Ability to bulk edit personnel and a single charge code</li>
            <li>Ability to bulk edit personnel and a charge code percentage</li>
            <li>Ability to bulk edit personnel and a charge code end date</li>
            <li>Flag for charge code is assigned to person and is > < POP</li>
            <li>Add Font Awesome icons</li>
            <li>Audit log for each page...</li>
            <li>Calendar view for understanding people and charge codes</li>
            <li>Add the ability for users to add a request to the roadmap</li>
            <li>Update loading masks to use skeletons</li>
            <li>Add Next Month, Over/Under Allocated to Dashboard</li>
            <li>Future contract forecast capability (e.g. non awarded but planned for staffing)</li>
            <li>Add the ability for users to add items to the roadmap, vice it just being a static list...</li>
            <li>Add the ability for users to be able to rank features on the roadmap (likes?)</li>
            <li>Dashboard section for information of personnel staffing changes made in the last (filterable) time</li>
        </ul>
        <hr>
        <p class="title">Potential Development Items</p>
        <ul class="potential">
            <li>Next 6 week view?</li>
            <li>6 Week percentage planning?</li>
            <li>"What if" staffing?  When you change someone from what they currently are staffed at you get a notificaion they are now at x, during bulk edit?</li>
        </ul>
    </div>
</template>
<style scoped>

.potential li {
    color: purple;
}

.in-progress li {
    color: blue;
}

.complete li {
    text-decoration: line-through;
    color: green;
}
</style>