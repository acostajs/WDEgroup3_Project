<template>
    <div>
      <h1>Schedules</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Employee ID</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="schedule in schedules" :key="schedule.id">
            <td>{{ schedule.id }}</td>
            <td>{{ schedule.employeeId }}</td>
            <td>{{ schedule.date }}</td>
            <td>{{ schedule.startTime }}</td>
            <td>{{ schedule.endTime }}</td>
            <td>
              <button>Edit</button>
              <button>Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup lang="ts">
  import axios from 'axios';
  import { ref, onMounted } from 'vue';
  
  const schedules = ref([]);
  
  const fetchSchedules = async () => {
    try {
      const response = await axios.get('http://localhost:3000/schedules');
      schedules.value = response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };
  
  onMounted(fetchSchedules);
  </script>