<script setup>
import Toggle from '../../src/components/inputs/ToggleSwitch.vue';
import { ref, onMounted } from 'vue';

// New Color Scheme Logic
const primaryColor = ref('#000000');
const secondaryColor = ref('#ffffff');
const thirdColor = ref('#000000');
const fourthColor = ref('#000000');

// Get theme from localStorage or default to 'dark'
const theme = ref(localStorage.getItem('theme') || 'dark');
console.log("starting value for theme is: ", theme.value);

const isToggled = ref(theme.value === 'dark');

onMounted(() => {
  primaryColor.value = localStorage.getItem('--primary-color');
  secondaryColor.value = localStorage.getItem('--secondary-color');
  thirdColor.value = localStorage.getItem('--third-color');
  fourthColor.value = localStorage.getItem('--fourth-color');

  //Update the toggle switch status
  const toggleStatus = localStorage.getItem('theme');
  console.log("toggleStatus:", toggleStatus)
  isToggled.value = toggleStatus === 'dark';
})
console.log("isToggled value is: ", isToggled.value)


// Throttle Color Picker
function throttle(func, delay) {
  let lastCall = 0;
  let timeoutId;

  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay - (now - lastCall));
    }
  };
}

// Throttled color update
const throttledColor = ref();

// Handle Input
const handleInput = (event, type) => {
  updateValue(event.target.value, type)
};

const updateValue = throttle((value, type) => {
  throttledColor.value = value;
  setUpdatedColor(value, type);
}, 500);

// Set updated color
const setUpdatedColor = (value, type) => {
  localStorage.setItem(type, value);
  document.documentElement.style.setProperty(type, value);
}

const handleToggle = (event) => {
  console.log("toggle value is: ", event)
  if (event) {
    theme.value = 'dark';
    localStorage.setItem('theme', 'dark');
    setDarkMode();
    isToggled.value = true
  } else {
    theme.value = 'light';
    localStorage.setItem('theme', 'light');
    setLightMode();
    isToggled.value = false
  }
}

const handleThemeSelection = () => {
  if (theme.value === 'dark') {
    localStorage.setItem('theme', 'dark');
    setDarkMode();
    isToggled.value = true
  } else if (theme.value === 'light') {
    localStorage.setItem('theme', 'light');
    setLightMode();
    isToggled.value = false
  } else if (theme.value === 'custom') {
    localStorage.setItem('theme', 'custom');
    setCustomMode();
    isToggled.value = false
  }
}

const setLightMode = () => {
  document.documentElement.style.setProperty('--primary-color', '#000000');
  document.documentElement.style.setProperty('--secondary-color', '#ffffff');
  document.documentElement.style.setProperty('--third-color', '#000000');
  document.documentElement.style.setProperty('--fourth-color', '#000000');
  // localStorage.setItem('theme', 'dark');
}

const setDarkMode = () => {
  console.log("setting dark mode")
  document.documentElement.style.setProperty('--primary-color', '#ffffff');
  document.documentElement.style.setProperty('--secondary-color', '#000000');
  document.documentElement.style.setProperty('--third-color', '#ffffff');
  document.documentElement.style.setProperty('--fourth-color', '#ffffff');
  // localStorage.setItem('theme', 'light');
}

const setCustomMode = () => {
  document.documentElement.style.setProperty('--primary-color', primaryColor.value);
  document.documentElement.style.setProperty('--secondary-color', secondaryColor.value);
  document.documentElement.style.setProperty('--third-color', thirdColor.value);
  document.documentElement.style.setProperty('--fourth-color', fourthColor.value);
}

</script>

<template>
  <div>
    <div class="settings-grid">
      <h2 class="title">Settings</h2>

      <div class="setting">
        <div class="left">
          <i class='bx bx-sun'></i>
        </div>
        <div class="middle">
          Toggle
          <span :class="{ active: !isToggled }">Light</span>
          /
          <span :class="{ active: isToggled }">Dark</span>
          Mode
        </div>
        <div class="right">
          <Toggle uid="1" :isToggled="isToggled" label="lock-mode" class="toggle" @toggle="handleToggle"
            :initial-value="isToggled">
            Toggle Lock mode
          </Toggle>
        </div>
      </div>

      <div class="setting">
        <div class="left">
          <i class='bx bx-lock'></i>
        </div>
        <div class="middle">
          Selected Theme
        </div>
        <div class="right">
          <select v-model="theme" @change="handleThemeSelection">
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="custom">custom</option>
          </select>
        </div>
      </div>

      <template v-if="theme === 'custom'">

        <!-- Font Colors -->
        <div class="setting">
          <div class="left">
            <i class='bx bx-lock'></i>
          </div>
          <div class="middle">
            Font Color
          </div>
          <div class="right">
            {{ primaryColor }}
            <input type="color" v-model="primaryColor" @input="handleInput($event, '--primary-color')">
          </div>
        </div>

        <!-- Background Color -->
        <div class="setting">
          <div class="left">
            <i class='bx bx-lock'></i>
          </div>
          <div class="middle">
            Background Color
          </div>
          <div class="right">
            {{ secondaryColor }}
            <input type="color" v-model="secondaryColor" @input="handleInput($event, '--secondary-color')">
          </div>
        </div>

        <!-- Third Color -->
        <div class="setting">
          <div class="left">
            <i class='bx bx-lock'></i>
          </div>
          <div class="middle">
            Third Color
          </div>
          <div class="right">
            {{ thirdColor }}
            <input type="color" v-model="thirdColor" @input="handleInput($event, '--third-color')">
          </div>
        </div>

        <!-- Fourth Color -->
        <div class="setting">
          <div class="left">
            <i class='bx bx-lock'></i>
          </div>
          <div class="middle">
            Third Color
          </div>
          <div class="right">
            {{ fourthColor }}
            <input type="color" v-model="fourthColor" @input="handleInput($event, '--fourth-color')">
          </div>
        </div>

      </template>


    </div>
  </div>
</template>

<style scoped>
.left {
  flex: 1;
}

.middle {
  flex: 2;
}

.right {
  flex: 1;
  text-align: right;
}

.right select {
  width: 50%;
}

.active {
  color: #42b883;
}

.settings-grid {
  padding: 2em;
  width: 40%;
  margin: 0 auto;
  display: grid;
  gap: 10px;
}

.setting {
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 30px;
  padding: 5px;
  border-radius: 5px;
  background-color: rgb(16, 15, 28);
  border: 2px solid rgb(16, 15, 28);
}

.setting .icon {
  flex: 1;
  font-size: 1em;
}

.setting .toggle {
  flex: 1;
  justify-content: end;
}

.settings-grid .title {
  margin: 0 auto;
}

/* Simple css to style it like a toggle switch */
.theme-switch-wrapper {
  display: flex;
  align-items: center;
}

.theme-switch-wrapper em {
  margin-left: 10px;
  font-size: 1rem;
}

.theme-switch {
  display: inline-block;
  height: 34px;
  position: relative;
  width: 60px;
}

.theme-switch input {
  display: none;
}

.slider {
  background-color: #ccc;
  bottom: 0;
  cursor: pointer;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: 0.4s;
}

.slider:before {
  background-color: #fff;
  bottom: 4px;
  content: '';
  height: 26px;
  left: 4px;
  position: absolute;
  transition: 0.4s;
  width: 26px;
}

input:checked+.slider {
  background-color: black;
}

input:checked+.slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
