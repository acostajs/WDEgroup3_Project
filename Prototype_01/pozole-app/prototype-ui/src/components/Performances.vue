<template>
    <div>
      <h1>Performances</h1>
  
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
  
      <div v-if="isLoading">Loading...</div>
  
      <div v-if="isEditing && !isLoading">
        <h2>Edit Performance</h2>
        <form @submit.prevent="updatePerformance">
          <select v-model="editPerformance.employeeId">
            <option v-for="employee in employees" :key="employee.id" :value="employee.id">
              {{ employee.firstName }} {{ employee.lastName }} (ID: {{ employee.id }})
            </option>
          </select>
          <input type="date" v-model="editPerformance.performanceDate" placeholder="Performance Date" required />
          <input type="number" v-model="editPerformance.performanceRating" placeholder="Performance Rating" />
          <textarea v-model="editPerformance.performanceComment" placeholder="Performance Comment"></textarea>
          <button type="submit">Update</button>
          <button @click="isEditing = false">Cancel</button>
        </form>
      </div>
  
      <div v-else-if="!isLoading">
        <h2>Create Performance</h2>
        <form @submit.prevent="createPerformance">
          <select v-model="newPerformance.employeeId">
            <option v-for="employee in employees" :key="employee.id" :value="employee.id">
              {{ employee.firstName }} {{ employee.lastName }} (ID: {{ employee.id }})
            </option>
          </select>
          <input type="date" v-model="newPerformance.performanceDate" placeholder="Performance Date" required />
          <input type="number" v-model="newPerformance.performanceRating" placeholder="Performance Rating" />
          <textarea v-model="newPerformance.performanceComment" placeholder="Performance Comment"></textarea>
          <button type="submit">Create</button>
        </form>
      </div>
  
      <table v-if="!isLoading">
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
          <tr v-for="performance in paginatedPerformances" :key="performance.id">
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
  
      <div v-if="!isLoading" class="pagination">
        <button :disabled="currentPage === 1" @click="currentPage--">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="currentPage++">Next</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import axios from 'axios';
  import { ref, onMounted, computed, watch } from 'vue';
  
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
  
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalPages = ref(1);
  
  const successMessage = ref('');
  const errorMessage = ref('');
  const isLoading = ref(false);
  
  const fetchPerformances = async () => {
    isLoading.value = true;
    try {
      const response = await axios.get(
        `http://localhost:3000/performances?page=${currentPage.value}&limit=${itemsPerPage.value}`
      );
      performances.value = response.data.performances;
      totalPages.value = Math.ceil(response.data.total / itemsPerPage.value);
    } catch (error) {
      console.error('Error fetching performances:', error);
      errorMessage.value = 'Failed to fetch performances.';
    } finally {
      isLoading.value = false;
    }
  };
  
  const createPerformance = async () => {
    isLoading.value = true;
    try {
      await axios.post('http://localhost:3000/performances', newPerformance.value);
      await fetchPerformances();
      newPerformance.value = { employeeId: 0, performanceDate: '', performanceRating: 0, performanceComment: '' };
      successMessage.value = 'Performance created successfully.';
      errorMessage.value = '';
    } catch (error: any) {
      console.error('Error creating performance:', error);
      errorMessage.value = error.response?.data?.error || 'Failed to create performance.';
      successMessage.value = '';
    } finally {
      isLoading.value = false;
    }
  };
  
  const updatePerformance = async () => {
    isLoading.value = true;
    try {
      await axios.put(`http://localhost:3000/performances/${editPerformance.value.id}`, editPerformance.value);
      await fetchPerformances();
      isEditing.value = false;
      editPerformance.value = { id: 0, employeeId: 0, performanceDate: '', performanceRating: 0, performanceComment: '' };
      successMessage.value = 'Performance updated successfully.';
      errorMessage.value = '';
    } catch (error: any) {
      console.error('Error updating performance:', error);
      errorMessage.value = error.response?.data?.error || 'Failed to update performance.';
      successMessage.value = '';
    } finally {
      isLoading.value = false;
    }
  };
  
  const edit = (performance: any) => {
    editPerformance.value = { ...performance };
    isEditing.value = true;
  };
  
  const deletePerformance = async (id: number) => {
    isLoading.value = true;
    try {
      await axios.delete(`http://localhost:3000/performances/${id}`);
      await fetchPerformances();
      successMessage.value = 'Performance deleted successfully.';
      errorMessage.value = '';
    } catch (error: any) {
      console.error('Error deleting performance:', error);
      errorMessage.value = error.response?.data?.error || 'Failed to delete performance.';
      successMessage.value = '';
    } finally {
      isLoading.value = false;
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
  
  const paginatedPerformances = computed(() => performances.value);
  
  // Watch for changes in currentPage
  watch(currentPage, async () => {
    await fetchPerformances();
  });
  
  </script>
  
  <style scoped>
  .success-message {
    color: green;
    margin-bottom: 10px;
  }
  
  .error-message {
    color: red;
    margin-bottom: 10px;
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  .pagination button {
    margin: 0 5px;
    padding: 5px 10px;
  }
  </style>