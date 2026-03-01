<template>
  <div>
    <h2>Ugeplan</h2>
    <table>
      <thead>
        <tr>
          <th>Uge</th>
          <th>Mandag</th>
          <th>Tirsdag</th>
          <th>Onsdag</th>
          <th>Torsdag</th>
          <th>Fredag</th>
          <th>Lørdag</th>
          <th>Søndag</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="week in weeks" :key="week">
          <td>{{ week }}</td>
          <td v-for="day in days" :key="day">
            <input
              type="text"
              v-model="schedule[week][day]"
              placeholder="Indtast aktivitet"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface WeekSchedule {
  [key: number]: Record<Day, string>;
}

export default defineComponent({
  data() {
    const days: Day[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const weeks: number[] = Array.from({ length: 52 }, (_, i) => i + 1);

    const schedule: WeekSchedule = {};
    weeks.forEach((week) => {
      schedule[week] = { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' };
    });

    return {
      days,
      weeks,
      schedule,
    };
  },
});
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

th {
  background-color: #f2f2f2;
  color: black;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 5px;
}
</style>
