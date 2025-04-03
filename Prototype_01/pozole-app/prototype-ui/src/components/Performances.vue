<template>
    <div>
      <h1>Performances</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Employee ID</th>
            <th>Performance Date</th>
            <th>Performance Rating</th>
            <th>Performance Comment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="performance in performances" :key="performance.id">
            <td>{{ performance.id }}</td>
            <td>{{ performance.employeeId }}</td>
            <td>{{ performance.performanceDate }}</td>
            <td>{{ performance.performanceRating }}</td>
            <td>{{ performance.performanceComment }}</td>
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
  
  const performances = ref([]);
  
  const fetchPerformances = async () => {
    try {
      const response = await axios.get('http://localhost:3000/performances');
      performances.value = response.data;
    } catch (error) {
      console.error('Error fetching performances:', error);
    }
  };
  
  onMounted(fetchPerformances);
  </script>