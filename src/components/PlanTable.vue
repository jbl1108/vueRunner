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
        <tr v-for="week in maxWeek" :key="week">
          <td>{{ week }}</td>
          <td v-for="day in 7" :key="day">
            <template v-if="getActivity(week, day)">
              <span :class="{ done: getActivity(week, day)!.done }">
                {{ getActivity(week, day)!.activity }}
              </span>
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface TrainingActivity {
  uid: string
  week: number
  dayofweek: number
  activity: string
  done: boolean
}

export default defineComponent({
  data() {
    return {
      activities: [] as TrainingActivity[],
      maxWeek: 0,
    }
  },
  async created() {
    await this.fetchActivities()
  },
  methods: {
    async fetchActivities() {
      try {
        const response = await fetch('http://localhost/training/')
        this.activities = await response.json()
        this.maxWeek = Math.max(...this.activities.map((a) => a.week), 1)
      } catch (error) {
        console.error('Error fetching activities:', error)
      }
    },
    getActivity(week: number, day: number): TrainingActivity | null {
      return this.activities.find((a) => a.week === week && a.dayofweek === day) || null
    },
  },
})
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

th {
  background-color: #f2f2f2;
  color: black;
}

.done {
  text-decoration: line-through;
  color: #888;
}
</style>
