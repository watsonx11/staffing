<script setup>
import SectionGenerator from '@/components/SectionGenerator.vue'

const sectionTitle = "Staffing Management"

</script>

<template>
    <SectionGenerator :sectionTitle="sectionTitle" />

    <div class="columns">
        <div class="column">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name:</th>
                        <th><abbr title="Played">Pld</abbr></th>
                        <th><abbr title="Won">W</abbr></th>
                        <th><abbr title="Drawn">D</abbr></th>
                        <th><abbr title="Lost">L</abbr></th>
                        <th><abbr title="Goals for">GF</abbr></th>
                        <th><abbr title="Goals against">GA</abbr></th>
                        <th><abbr title="Goal difference">GD</abbr></th>
                        <th><abbr title="Points">Pts</abbr></th>
                    </tr>
                </thead>
                <tfoot>
                    <tr>
                        <th>Name:</th>
                        <th><abbr title="Played">Pld</abbr></th>
                        <th><abbr title="Won">W</abbr></th>
                        <th><abbr title="Drawn">D</abbr></th>
                        <th><abbr title="Lost">L</abbr></th>
                        <th><abbr title="Goals for">GF</abbr></th>
                        <th><abbr title="Goals against">GA</abbr></th>
                        <th><abbr title="Goal difference">GD</abbr></th>
                        <th><abbr title="Points">Pts</abbr></th>
                    </tr>
                </tfoot>
                <tbody>
                    <tr>
                        <td>Al Almanza</td>
                        <td>38</td>
                        <td>23</td>
                        <td>12</td>
                        <td>3</td>
                        <td>68</td>
                        <td>36</td>
                        <td>+32</td>
                        <td>81</td>
                    </tr>
                    <tr>
                        <td>DeShawn Baldwin</td>
                        <td>38</td>
                        <td>20</td>
                        <td>11</td>
                        <td>7</td>
                        <td>65</td>
                        <td>36</td>
                        <td>+29</td>
                        <td>71</td>
                    </tr>
                </tbody>
            </table>

        </div>
    </div>
</template>