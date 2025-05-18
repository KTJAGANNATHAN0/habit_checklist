// DOM Elements
const themeToggle = document.getElementById("theme-toggle")
const themeDropdown = document.getElementById("theme-dropdown")
const themeOptions = document.querySelectorAll(".theme-option")
const themeIcon = document.getElementById("theme-icon")
const themeText = document.getElementById("theme-text")
const tabs = document.querySelectorAll(".tab")
const tabContents = document.querySelectorAll(".tab-content")
const habitsList = document.getElementById("habits-list")
const emptyHabits = document.getElementById("empty-habits")
const habitForm = document.getElementById("habit-form")
const habitNameInput = document.getElementById("habit-name")
const habitDescriptionInput = document.getElementById("habit-description")
const habitReminderInput = document.getElementById("habit-reminder")
const addHabitBtn = document.getElementById("add-habit-btn")
const nameError = document.getElementById("name-error")
const progressFill = document.getElementById("progress-fill")
const progressLights = document.getElementById("progress-lights")
const completionPercentage = document.getElementById("completion-percentage")
const mechaProgress = document.getElementById("mecha-progress")
const katanaProgress = document.getElementById("katana-progress")
const prevMonthBtn = document.getElementById("prev-month")
const nextMonthBtn = document.getElementById("next-month")
const calendarTitle = document.getElementById("calendar-title")
const calendarDays = document.getElementById("calendar-days")

// State
let habits = []
let logs = []
let currentTheme = "mecha"
const currentDate = new Date()
let selectedDate = new Date()

// Initialize
function init() {
  loadFromLocalStorage()
  renderHabits()
  updateProgress()
  renderCalendar()
  setupEventListeners()
}

// Local Storage
function loadFromLocalStorage() {
  const storedHabits = localStorage.getItem("habits")
  const storedLogs = localStorage.getItem("habit-logs")
  const storedTheme = localStorage.getItem("progress-theme")

  if (storedHabits) {
    habits = JSON.parse(storedHabits)
  }

  if (storedLogs) {
    logs = JSON.parse(storedLogs)
  }

  if (storedTheme) {
    currentTheme = storedTheme
    updateThemeUI()
  }
}

function saveToLocalStorage() {
  localStorage.setItem("habits", JSON.stringify(habits))
  localStorage.setItem("habit-logs", JSON.stringify(logs))
  localStorage.setItem("progress-theme", currentTheme)
}

// Event Listeners
function setupEventListeners() {
  // Theme toggle
  themeToggle.addEventListener("click", () => {
    themeDropdown.classList.toggle("hidden")
  })

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!themeToggle.contains(e.target) && !themeDropdown.contains(e.target)) {
      themeDropdown.classList.add("hidden")
    }
  })

  // Theme options
  themeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      currentTheme = option.dataset.theme
      updateThemeUI()
      themeDropdown.classList.add("hidden")
      saveToLocalStorage()
      updateProgress()
    })
  })

  // Tabs
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"))
      tab.classList.add("active")

      const tabName = tab.dataset.tab
      tabContents.forEach((content) => {
        content.classList.remove("active")
      })

      document.getElementById(`${tabName}-content`).classList.add("active")
    })
  })

  // Habit form
  habitForm.addEventListener("submit", (e) => {
    e.preventDefault()
    addHabit()
  })

  // Calendar navigation
  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1)
    renderCalendar()
  })

  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1)
    renderCalendar()
  })
}

// Theme UI
function updateThemeUI() {
  if (currentTheme === "mecha") {
    themeIcon.textContent = "⚙️"
    themeText.textContent = "Mecha Theme"
    mechaProgress.classList.remove("hidden")
    katanaProgress.classList.add("hidden")
  } else {
    themeIcon.textContent = "⚔️"
    themeText.textContent = "Katana Theme"
    mechaProgress.classList.add("hidden")
    katanaProgress.classList.remove("hidden")
  }
}

// Habits
function addHabit() {
  const name = habitNameInput.value.trim()
  const description = habitDescriptionInput.value.trim()
  const reminderTime = habitReminderInput.value

  if (!name) {
    nameError.textContent = "Habit name is required"
    return
  }

  nameError.textContent = ""

  const newHabit = {
    id: generateId(),
    name,
    description,
    reminderTime,
    createdAt: new Date().toISOString(),
  }

  habits.push(newHabit)
  saveToLocalStorage()
  renderHabits()
  updateProgress()

  // Reset form
  habitNameInput.value = ""
  habitDescriptionInput.value = ""
  habitReminderInput.value = ""

  // Switch to habits tab
  tabs[0].click()
}

function toggleHabit(habitId, completed) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Remove existing log for this habit and date if it exists
  logs = logs.filter((log) => {
    const logDate = new Date(log.date)
    logDate.setHours(0, 0, 0, 0)
    return !(log.habitId === habitId && logDate.getTime() === today.getTime())
  })

  // Add new log if completed
  if (completed) {
    logs.push({
      id: `${habitId}-${today.toISOString()}`,
      habitId,
      date: today.toISOString(),
      completed,
    })
  }

  saveToLocalStorage()
  renderHabits()
  updateProgress()
}

function deleteHabit(habitId) {
  habits = habits.filter((habit) => habit.id !== habitId)
  logs = logs.filter((log) => log.habitId !== habitId)
  saveToLocalStorage()
  renderHabits()
  updateProgress()
}

function renderHabits() {
  if (habits.length === 0) {
    emptyHabits.classList.remove("hidden")
    habitsList.innerHTML = ""
    return
  }

  emptyHabits.classList.add("hidden")

  const habitsHTML = habits
    .map((habit) => {
      const isCompleted = getHabitStatus(habit.id)

      return `
      <div class="habit-item ${isCompleted ? "completed" : ""}">
        <div class="habit-check">
          <input 
            type="checkbox" 
            id="${habit.id}" 
            class="habit-checkbox" 
            ${isCompleted ? "checked" : ""}
            onchange="toggleHabit('${habit.id}', this.checked)"
          >
          <div class="habit-info">
            <label for="${habit.id}" class="habit-name">${habit.name}</label>
            ${habit.description ? `<p class="habit-description">${habit.description}</p>` : ""}
            ${habit.reminderTime ? `<div class="habit-reminder">Reminder: ${habit.reminderTime}</div>` : ""}
          </div>
        </div>
        <button class="habit-delete" onclick="deleteHabit('${habit.id}')">
          ✕
        </button>
      </div>
    `
    })
    .join("")

  habitsList.innerHTML = habitsHTML
}

function getHabitStatus(habitId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return logs.some((log) => {
    const logDate = new Date(log.date)
    logDate.setHours(0, 0, 0, 0)
    return log.habitId === habitId && logDate.getTime() === today.getTime() && log.completed
  })
}

// Progress
function updateProgress() {
  const completionRate = getCompletionRate()
  const roundedRate = Math.round(completionRate)

  completionPercentage.textContent = `${roundedRate}%`
  progressFill.style.width = `${completionRate}%`

  // Update progress lights
  if (completionRate >= 20) {
    progressLights.classList.remove("hidden")
    progressLights.innerHTML = `
      <div class="progress-light"></div>
      <div class="progress-light small"></div>
    `
  } else {
    progressLights.classList.add("hidden")
  }

  // Update katana progress if that theme is active
  if (currentTheme === "katana") {
    drawKatanaProgress(completionRate)
  }
}

function getCompletionRate() {
  if (habits.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const completedToday = logs.filter((log) => {
    const logDate = new Date(log.date)
    logDate.setHours(0, 0, 0, 0)
    return logDate.getTime() === today.getTime() && log.completed
  }).length

  return (completedToday / habits.length) * 100
}

function drawKatanaProgress(completionRate) {
  const canvas = katanaProgress
  const ctx = canvas.getContext("2d")

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Set canvas dimensions if needed
  if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }

  // Draw katana
  const progress = completionRate / 100
  const katanaLength = canvas.width * 0.8
  const startX = canvas.width * 0.1
  const endX = startX + katanaLength
  const y = canvas.height / 2

  // Draw katana handle
  ctx.beginPath()
  ctx.moveTo(startX, y)
  ctx.lineTo(startX + katanaLength * 0.2, y)
  ctx.lineWidth = 8
  ctx.strokeStyle = "#4B5563"
  ctx.stroke()

  // Draw katana blade background
  ctx.beginPath()
  ctx.moveTo(startX + katanaLength * 0.2, y)
  ctx.lineTo(endX, y)
  ctx.lineWidth = 4
  ctx.strokeStyle = "#374151"
  ctx.stroke()

  // Draw progress on blade
  ctx.beginPath()
  ctx.moveTo(startX + katanaLength * 0.2, y)
  ctx.lineTo(startX + katanaLength * 0.2 + (endX - (startX + katanaLength * 0.2)) * progress, y)
  ctx.lineWidth = 4
  ctx.strokeStyle = "#EF4444"
  ctx.stroke()

  // Draw katana tip
  if (progress > 0.95) {
    ctx.beginPath()
    ctx.moveTo(endX, y)
    ctx.lineTo(endX + 10, y - 5)
    ctx.lineTo(endX + 5, y)
    ctx.lineTo(endX + 10, y + 5)
    ctx.lineTo(endX, y)
    ctx.fillStyle = "#EF4444"
    ctx.fill()
  }
}

// Calendar
function renderCalendar() {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Update calendar title
  calendarTitle.textContent = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Clear calendar
  calendarDays.innerHTML = ""

  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement("div")
    emptyDay.className = "calendar-day empty"
    calendarDays.appendChild(emptyDay)
  }

  // Add days of month
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div")
    day.className = "calendar-day"
    day.textContent = i

    const currentDateObj = new Date(year, month, i)
    currentDateObj.setHours(0, 0, 0, 0)

    // Check if this day is today
    if (currentDateObj.getTime() === today.getTime()) {
      day.classList.add("today")
    }

    // Check if this day is selected
    if (
      selectedDate &&
      currentDateObj.getDate() === selectedDate.getDate() &&
      currentDateObj.getMonth() === selectedDate.getMonth() &&
      currentDateObj.getFullYear() === selectedDate.getFullYear()
    ) {
      day.classList.add("selected")
    }

    day.addEventListener("click", () => {
      document.querySelectorAll(".calendar-day").forEach((d) => d.classList.remove("selected"))
      day.classList.add("selected")
      selectedDate = new Date(year, month, i)
    })

    calendarDays.appendChild(day)
  }
}

// Utility functions
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Make functions available globally
window.toggleHabit = toggleHabit
window.deleteHabit = deleteHabit

// Initialize the app
document.addEventListener("DOMContentLoaded", init)
