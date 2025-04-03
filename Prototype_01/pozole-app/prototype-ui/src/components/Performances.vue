<template>
    <div>
      <h1>Performances</h1>
  
      <div v-if="isEditing">
        <h2>Edit Performance</h2>
        <form @submit.prevent="updatePerformance">
          <select v-model="editPerformance.employeeId">
            <option v-for="employee in employees" :key="employee.id" :value="employee.id">
              {{ employee.firstName }} {{ employee.lastName }} (ID: {{ employee.id }})
            </option>
          </select>
          <input type="date" v-model="editPerformance.performanceDate" placeholder="Performance Date" />
          <input type="number" v-model="editPerformance.performanceRating" placeholder="Performance Rating" />
          <textarea v-model="editPerformance.performanceComment" placeholder="Performance Comment"></textarea>
          <button type="submit">Update</button>
          <button @click="isEditing = false">Cancel</button>
        </form>
      </div>
  
      <div v-else>
        <h2>Create Performance</h2>
        <form @submit.prevent="createPerformance">
          <select v-model="newPerformance.employeeId">
            <option v-for="employee in employees" :key="employee.id" :value="employee.id">
              {{ employee.firstName }} {{ employee.lastName }} (ID: {{ employee.id }})
            </option>
          </select>
          <input type="date" v-model="newPerformance.performanceDate" placeholder="Performance Date" />
          <input type="number" v-model="newPerformance.performanceRating" placeholder="Performance Rating" />
          <textarea v-model="newPerformance.performanceComment" placeholder="Performance Comment"></textarea>
          <button type="submit">Create</button>
        </form>
      </div>
  
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
              <button @click="edit(performance)">Edit</button>
              <button @click="deletePerformance(performance.id)">Delete</button>
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
  const newPerformance = ref({
    employeeId: 0,
    performanceDate: '',
    performanceRating: 0,
    performanceComment: '',
  });
  const editPerformance = ref({
    id: 0,
    employeeId: 0,
    performanceDate: '',
    performanceRating: 0,
    performanceComment: '',
  });
  const isEditing = ref(false);
  const employees = ref([]);
  
  const fetchPerformances = async () => {
    try {
      const response = await axios.get('http://localhost:3000/performances');
      performances.value = response.data;
    } catch (error) {
      console.error('Error fetching performances:', error);
    }
  };
  
  const createPerformance = async () => {
    try {
      await axios.post('http://localhost:3000/performances', newPerformance.value);
      await fetchPerformances();
      newPerformance.value = { employeeId: 0, performanceDate: '', performanceRating: 0, performanceComment: '' };
    } catch (error) {
      console.error('Error creating performance:', error);
    }
  };
  
  const updatePerformance = async () => {
    try {
      await axios.put(`http://localhost:3000/performances/${editPerformance.value.id}`, editPerformance.value);
      await fetchPerformances();
      isEditing.value = false;
      editPerformance.value = { id: 0, employeeId: 0, performanceDate: '', performanceRating: 0, performanceComment: '' };
    } catch (error) {
      console.error('Error updating performance:', error);
    }
  };
  
  const edit = (performance: any) => {
    editPerformance.value = { ...performance };
    isEditing.value = true;
  };
  
  const deletePerformance = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/performances/${id}`);
      await fetchPerformances();
    } catch (error) {
      console.error('Error deleting performance:', error);
    }
  };
  
  onMounted(async () => {
    await fetchPerformances();
    await fetchEmployees();
  });
  
  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:3000/employees');
      employees.value = response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };
  </script>