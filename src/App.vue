<template>
  <div>
    <h2>Ugeplan</h2>
    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
    <p v-else-if="isLoading" role="status">Henter ugeplan...</p>
    <p v-else role="status">{{ statusMessage }}</p>
    <div class="table-scroll">
      <table class="schedule-table">
        <thead>
          <tr>
            <th class="week-heading">Uge</th>
            <th v-for="day in days" :key="day.number">{{ day.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="week in weeks" :key="week">
            <th scope="row" class="week-number">{{ week }}</th>
            <td v-for="day in days" :key="day.number">
              <div class="activity-cell">
                <input
                  type="text"
                  v-model="schedule[week]![day.number]!"
                  @input="markAsEdited(week, day.number)"
                  @change="saveTraining(week, day.number)"
                  :class="{
                    edited: isEdited(week, day.number),
                    done: activities[cellKey(week, day.number)]?.done,
                  }"
                  placeholder="Tilføj aktivitet"
                  :aria-label="`Uge ${week}, ${day.label}`"
                />
                <input
                  v-if="activities[cellKey(week, day.number)]"
                  class="done-checkbox"
                  type="checkbox"
                  :checked="activities[cellKey(week, day.number)]?.done"
                  :aria-label="`Markér aktivitet i uge ${week}, ${day.label} som udført`"
                  :title="`Markér aktivitet i uge ${week}, ${day.label} som udført`"
                  @change="setActivityDone(week, day.number, $event)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  createTraining,
  deleteTraining,
  fetchTrainings,
  updateTraining,
} from './services/trainingApi'

interface Training {
  uid: string
  week: number
  dayofweek: number
  activity: string
  done: boolean
}

type WeekSchedule = Record<number, Record<number, string>>
type TrainingByCell = Record<string, Training>
type EditedFields = Record<number, Record<number, boolean>>

const cellKey = (week: number, day: number) => `${week}-${day}`

export default defineComponent({
  data() {
    const days = [
      { number: 1, label: 'Mandag' },
      { number: 2, label: 'Tirsdag' },
      { number: 3, label: 'Onsdag' },
      { number: 4, label: 'Torsdag' },
      { number: 5, label: 'Fredag' },
      { number: 6, label: 'Lørdag' },
      { number: 7, label: 'Søndag' },
    ]
    const weeks: number[] = Array.from({ length: 52 }, (_, i) => i + 1)

    const schedule: WeekSchedule = {}
    const editedFields: EditedFields = {}

    weeks.forEach((week) => {
      schedule[week] = Object.fromEntries(days.map(({ number }) => [number, '']))
      editedFields[week] = Object.fromEntries(days.map(({ number }) => [number, false]))
    })

    return {
      days,
      weeks,
      schedule,
      editedFields,
      cellKey,
      activities: {} as TrainingByCell,
      isLoading: true,
      statusMessage: '',
      errorMessage: '',
    }
  },
  async created() {
    await this.loadTrainings()
  },
  methods: {
    async loadTrainings() {
      this.isLoading = true
      this.errorMessage = ''
      try {
        const trainings = await fetchTrainings()
        trainings.forEach((training) => {
          const key = cellKey(training.week, training.dayofweek)
          this.activities[key] = training
          if (this.schedule[training.week]?.[training.dayofweek] !== undefined) {
            this.schedule[training.week]![training.dayofweek] = training.activity
          }
        })
        this.statusMessage = ''
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Ugeplanen kunne ikke hentes.'
      } finally {
        this.isLoading = false
      }
    },
    markAsEdited(week: number, day: number) {
      this.editedFields[week]![day] = true
    },
    isEdited(week: number, day: number): boolean {
      return this.editedFields[week]![day] ?? false
    },
    async setActivityDone(week: number, day: number, event: Event) {
      const key = cellKey(week, day)
      const existing = this.activities[key]
      if (!existing) return

      const done = (event.target as HTMLInputElement).checked
      this.errorMessage = ''
      this.activities[key] = { ...existing, done }

      try {
        const saved = await updateTraining(existing.uid, {
          week: existing.week,
          dayofweek: existing.dayofweek,
          activity: existing.activity,
          done,
        })
        this.activities[key] = saved
        this.statusMessage = 'Ændringer gemt.'
      } catch (error) {
        this.activities[key] = existing
        this.errorMessage =
          error instanceof Error ? error.message : 'Aktiviteten kunne ikke opdateres.'
      }
    },
    async saveTraining(week: number, day: number) {
      const key = cellKey(week, day)
      const existing = this.activities[key]
      const activity = this.schedule[week]![day]!.trim()
      this.errorMessage = ''

      try {
        if (!activity) {
          if (existing) {
            await deleteTraining(existing.uid)
            delete this.activities[key]
          }
          this.editedFields[week]![day] = false
          this.statusMessage = 'Ændringer gemt.'
          return
        }

        const training = { week, dayofweek: day, activity, done: existing?.done ?? false }
        const saved = existing
          ? await updateTraining(existing.uid, training)
          : await createTraining(training)
        this.activities[key] = saved
        this.schedule[week]![day] = saved.activity
        this.editedFields[week]![day] = false
        this.statusMessage = 'Ændringer gemt.'
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Ændringen kunne ikke gemmes.'
      }
    },
  },
})
</script>

<style scoped>
.table-scroll {
  width: 100%;
  overflow: auto;
  border: 1px solid #d5e0dc;
  border-radius: 6px;
  background: #fffefa;
  box-shadow: 0 8px 24px rgb(26 55 48 / 8%);
}

.schedule-table {
  width: 100%;
  min-width: 860px;
  border-collapse: separate;
  border-spacing: 0;
  color: #23332f;
  table-layout: fixed;
}

.schedule-table th,
.schedule-table td {
  height: 56px;
  padding: 6px 8px;
  border-right: 1px solid #e3e9e5;
  border-bottom: 1px solid #e3e9e5;
  text-align: center;
}

.schedule-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 48px;
  background: #214f45;
  color: #fffefa;
  font-size: 0.82rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.schedule-table .week-heading,
.schedule-table .week-number {
  position: sticky;
  left: 0;
  width: 72px;
}

.schedule-table .week-heading {
  z-index: 3;
  background: #183e37;
}

.schedule-table .week-number {
  z-index: 1;
  background: #f0f4ef;
  color: #39574e;
  font-variant-numeric: tabular-nums;
  font-weight: 650;
}

.schedule-table tbody tr:nth-child(even) td {
  background: #f8faf7;
}

.schedule-table tbody tr:hover td {
  background: #eef5f0;
}

.schedule-table td:last-child,
.schedule-table th:last-child {
  border-right: 0;
}

.schedule-table tbody tr:last-child th,
.schedule-table tbody tr:last-child td {
  border-bottom: 0;
}

.activity-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.schedule-table input[type='text'] {
  width: 100%;
  box-sizing: border-box;
  min-height: 36px;
  padding: 7px 8px;
  border: 1px solid transparent;
  border-radius: 3px;
  outline: none;
  background: transparent;
  color: #23332f;
  font: inherit;
  text-align: center;
  transition:
    border-color 140ms ease,
    background-color 140ms ease,
    box-shadow 140ms ease;
}

.schedule-table input[type='text']::placeholder {
  color: #9aa8a0;
  opacity: 0;
  transition: opacity 140ms ease;
}

.schedule-table td:hover input[type='text']::placeholder,
.schedule-table input[type='text']:focus::placeholder {
  opacity: 1;
}

.schedule-table input[type='text']:hover {
  border-color: #c7d7ce;
  background: #fffefa;
}

.schedule-table input[type='text']:focus-visible {
  border-color: #bd6b3d;
  background: #fffefa;
  box-shadow: 0 0 0 3px rgb(189 107 61 / 18%);
}

.schedule-table input[type='text'].edited {
  border-color: #d49a45;
  background: #fff4d8;
}

.schedule-table input[type='text'].done {
  color: #74857c;
  text-decoration: line-through;
}

.schedule-table .done-checkbox {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: #39745e;
  cursor: pointer;
}

p[role='alert'] {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-left: 3px solid #b84d3e;
  background: #fff0ec;
  color: #7d2f25;
}

p[role='status'] {
  min-height: 1.5em;
  margin: 0 0 10px;
  color: #61736b;
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .schedule-table {
    min-width: 820px;
  }
}
</style>
