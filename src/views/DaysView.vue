<script setup>
import { ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import '@vuepic/vue-datepicker/dist/main.css';
import ButtonComponent from '../components/ButtonComponent.vue'

let id = 0
const days = ref([])
const newHabit = ref('')
const originalHabits = ref([])
const storedDays = localStorage.getItem('days')
const storedOriginalHabits = localStorage.getItem('originalHabits')
const storedId = localStorage.getItem('id')
const currentIndex = ref(0)
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const minDate = ref('');
const maxDate = ref('');
let today = new Date();
let pastYear = new Date();
pastYear.setFullYear(today.getFullYear() - 1);
let nextYear = new Date();
nextYear.setFullYear(today.getFullYear() + 1);
minDate.value = pastYear.toISOString().split('T')[0];
maxDate.value = nextYear.toISOString().split('T')[0];

if (storedDays) {
  days.value = JSON.parse(storedDays)
} else {
  days.value = []
}

if (storedOriginalHabits) {
  originalHabits.value = JSON.parse(storedOriginalHabits)
} else {
  originalHabits.value = []
}

if (storedId) {
  id = JSON.parse(storedId)
} else {
  id = 0
}

const setCalendarDate = () => {
  calendarDate.value = days.value[currentIndex.value].date
}

const previousDay = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    setCalendarDate();
  }
}

const nextDay = () => {
  if (currentIndex.value < days.value.length - 1) {
    currentIndex.value++
    setCalendarDate();
  }
}

const onCalendarChange = () => {
  currentIndex.value = days.value.findIndex((day) => day.date === calendarDate.value)
}

const currentDate = new Date()
for (let i = -365; i <= 365; i++) {
  const date = new Date(currentDate)
  date.setDate(date.getDate() + i)
  days.value.push({
    id: i,
    date: date.toISOString().split('T')[0],
    dayName: date.getDay(),
    habits: ref()
  })
}
currentIndex.value = currentIndex.value + 365
const calendarDate = ref(days.value[currentIndex.value].date);
const addHabit = () => {
  originalHabits.value.push({
    id: id++,
    habitTask: newHabit.value,
    done: false,
    isEditing: false,
    stopped: ref(false)
  })
  updateDays()
  newHabit.value = ''
}

const editHabit = (habit) => {
  habit.isEditing = true
}

const saveHabit = (habit) => {
  habit.isEditing = false
  updateDays()
}

const removeHabit = (habit) => {
  originalHabits.value = originalHabits.value.filter((t) => t !== habit)
  updateDays()
}

const updateDays = () => {
  days.value.forEach((day) => {
    const newHabits = JSON.parse(JSON.stringify(originalHabits.value))
    if (day.habits) {
      day.habits.forEach((habit) => {
        const newHabit = newHabits.find((h) => h.id === habit.id)
        if (newHabit) {
          newHabit.done = habit.done
        }
      })
    }
    day.habits = newHabits
  })
  localStorage.setItem('days', JSON.stringify(days.value))
  localStorage.setItem('originalHabits', JSON.stringify(originalHabits.value))
  localStorage.setItem('id', JSON.stringify(id))
}

const cancelEdit = (habit) => {
  habit.isEditing = false
}

const stopHabit = (habit) => {
  habit.stopped = true
  updateDays()
}

const unstopHabit = (habit) => {
  habit.stopped = false
  updateDays()
}

const route = useRoute()
const router = useRouter()

watchEffect(() => {
  const newDate = route.params.date
  currentIndex.value = days.value.findIndex((day) => day.date === newDate)
})

watch(
  () => currentIndex.value,
  (newIndex) => {
    if (newIndex >= 0 && newIndex < days.value.length) {
      router.push(`/day/${days.value[newIndex].date}`)
    }
  }
)
</script>

<template>
  <section>
    <div class="wrapper">
      <div class="card">
        <h2 id="date">{{ days[currentIndex].date }}</h2>
        <h2 id="day">{{ daysOfWeek[days[currentIndex].dayName] }}</h2>
        <div id="calendar-container">
          <input
            type="date"
            v-model="calendarDate"
            @change="onCalendarChange"
            :min="minDate" :max="maxDate"
          />
        </div>
        <h2 id="habits-completed">Habits completed today: {{ days[currentIndex]?.habits?.filter(habit => habit.done && !habit.stopped).length }}</h2>
        <ul id="habits">
          <li
            v-for="task in days[currentIndex].habits"
            :key="task.id"
            v-show="!task.stopped"
            :class="{ done: task.done }"
          >
            <input
              type="checkbox"
              v-model="task.done"
              :disabled="new Date() < new Date(days[currentIndex].date)"
              @change="updateDays"
            />
            {{ task.habitTask }}
          </li>
        </ul>
        <!-- <button id="back-btn" @click="previousDay" :disabled="currentIndex === 0">&lt;</button> -->
        <ButtonComponent
          id="back-btn"
          @click="previousDay"
          :disabled="currentIndex === 0"
          label="&lt;"
        />
        <ButtonComponent
          id="next-btn"
          @click="nextDay"
          :disabled="currentIndex === days.length - 1"
          label="&gt;"
        />
      </div>
    </div>
    <div class="habit-wrapper">
      <p>Number of habits: {{ originalHabits.length }}</p>
      <form @submit.prevent="addHabit">
        <input v-model="newHabit" />
        <button :disabled="newHabit === ''">Add a habit</button>
      </form>
      <transition-group name="habit-list" tag="ul" id="original-habits">
        <li v-for="habit in originalHabits" :key="habit.id">
          <input
            v-if="habit.isEditing"
            type="text"
            v-model="habit.habitTask"
            @change="saveHabit(habit)"
            @blur="cancelEdit(habit)"
            v-focus
          />
          <span v-else @dblclick="editHabit(habit)">
            {{ habit.habitTask }}
          </span>
          <div id="edit-btns">
            <button class="delete" @click="removeHabit(habit)">X</button>
            <button v-if="!habit.stopped" @click="stopHabit(habit)">Stop</button>
            <button v-else @click="unstopHabit(habit)">Resume</button>
          </div>
        </li>
      </transition-group>
      <p>Double click to edit the habit's name.</p>
    </div>
  </section>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Titillium+Web:wght@400;600&display=swap');

:root {
  --btn-color: #904e55;
  --btn-color-shade: #564e58;
  --card-color: #f2efe9;
  --habits-color: #bfb48f;
}

* {
  font-family: 'Titillium Web', sans-serif;
}

button {
  border-radius: 5px;
}

.card {
  display: grid;
  grid-template-rows: auto auto 1fr 1fr;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-template-areas:
    'back-btn date-title date-title calendar-title next-btn'
    'back-btn day-title day-title day-title next-btn'
    'back-btn habits-completed habits-completed habits-completed next-btn'
    'back-btn habits habits habits next-btn';
  background-color: var(--card-color);
  min-height: 500px;
  width: 80%;
  margin: 0 auto;
  margin-top: 50px;
  border-radius: 12px;
}

#date {
  grid-area: date-title;
  display: flex;
  justify-content: center;
  font-size: 40px;
}

#calendar-container {
  display: flex;
  align-items: center;
  grid-area: calendar-title;
  transform: scale(1.5);
}

#day {
  grid-area: day-title;
  display: flex;
  justify-content: center;
  font-size: 40px;
}

#habits-completed {
  grid-area: habits-completed;
  display: flex;
  justify-content: center;
  font-size: 14px;
}

#back-btn,
#next-btn {
  grid-area: back-btn;
  background-color: var(--btn-color);
  border: none;
  border-radius: 10px 0 0 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 40px;
}

#next-btn {
  grid-area: next-btn;
  border-radius: 0 10px 10px 0;
}

#back-btn:hover,
#next-btn:hover {
  background-color: var(--btn-color-shade);
}

#habits {
  grid-area: habits;
  padding-left: 40px;
  margin-bottom: 20px;
  list-style: none;
  list-style-type: none;
}

form {
  display: flex;
  justify-content: start;
  width: 60%;
  margin-top: 20px;
}

form > input {
  border: 2px solid #8c6f6f; /* Add a border with a solid color */
  border-radius: 10px; /* Adjust the radius to control the roundness of the corners */
  padding: 5px;
  margin-right: 8px;
  font-size: 24px;
}

form > button {
  font-size: 24px;
}

#habits > li {
  list-style: none;
  font-size: 24px;
}

#habits > li > input {
  transform: scale(1.5);
}

.habit-wrapper {
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  width: 80%;
  margin: 30px auto;
  background-color: var(--habits-color);
  border-radius: 10px;
}

#original-habits {
  width: 60%;
  padding-left: 0;
  list-style: none;
  list-style-type: none;
}

#original-habits > li {
  display: flex;
  word-wrap: break-word;
  justify-content: space-between;
  margin-bottom: 15px;
  min-width: auto;
  height: 30px;
  font-size: 24px;
}

#original-habits > li > input {
  font-size: 24px;
}

#edit-btns > .delete {
  margin-right: 5px;
}

#edit-btns > button {
  font-size: 24px;
}

.done {
  text-decoration: line-through;
}

.habit-list-enter-active,
.habit-list-leave-active {
  transition: all 0.5s ease;
}

.habit-list-enter-from,
.habit-list-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

@media (width <= 1024px) {
  #date {
    font-size: 36px;
  }

  #calendar-container {
    transform: scale(1.2);
  }
}

@media (width <= 832px) {
  .card {
    width: 90%;
    margin: 30px auto;
    grid-template-rows: auto auto 1fr 1fr;
    grid-template-columns: 35px 1fr 1fr 1fr 35px;
  }

  .habit-wrapper {
    width: 90%;
    margin: 30px auto;
  }

  #back-btn {
    font-size: 25px;
  }

  #next-btn {
    font-size: 25px;
  }

  form {
    width: auto;
  }

  form > input {
    font-size: 16px;
    padding: 5px;
  }

  form > button {
    font-size: 20px;
  }

  #original-habits {
    width: 80%;
  }

  #original-habits > li {
    width: auto;
    font-size: 20px;
  }

  #edit-btns > button {
    font-size: 20px;
  }
}

@media (width <= 500px) {
  #date {
    font-size: 24px;
  }

  #calendar-container {
    transform: scale(0.9);
    justify-content: center;
  }

  #day {
    font-size: 24px;
  }

  .card {
    grid-template-rows: auto auto auto 1fr 1fr;
    grid-template-columns: 35px 1fr 1fr 1fr 35px;
    grid-template-areas:
      'back-btn date-title date-title date-title next-btn'
      'back-btn calendar-title calendar-title calendar-title next-btn'
      'back-btn day-title day-title day-title next-btn'
      'back-btn habits-completed habits-completed habits-completed next-btn'
      'back-btn habits habits habits next-btn';
  }
}
</style>
