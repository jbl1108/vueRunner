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
              @input="markAsEdited(week, day)"
              :class="{ edited: isEdited(week, day) }"
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

interface EditedFields {
  [key: number]: Record<Day, boolean>;
}

export default defineComponent({
  data() {
    const days: Day[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const weeks: number[] = Array.from({ length: 52 }, (_, i) => i + 1);

    const schedule: WeekSchedule = {};
    const editedFields: EditedFields = {};

    weeks.forEach((week) => {
      schedule[week] = { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: '' };
      editedFields[week] = { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false };
    });

    return {
      days,
      weeks,
      schedule,
      editedFields,
    };
  },
  methods: {
    markAsEdited(week: number, day: Day) {
      this.editedFields[week][day] = true;
    },
    isEdited(week: number, day: Day): boolean {
      return this.editedFields[week][day];
    },
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
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 5px;
}

input.edited {
  background-color: #fffacd; /* Lys gul baggrund for markerede felter */
  border: 1px solid #ffd700; /* Gylden kant */
}
</style>
