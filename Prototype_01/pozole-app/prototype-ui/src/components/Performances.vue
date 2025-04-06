<template>
  <div>
    <h1>Performances</h1>

    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <div class="filter-section">
      <label for="employeeIdFilter">Filter by Employee:</label>
      <select id="employeeIdFilter" v-model="filters.employeeId" @change="applyFilters">
        <option value="">All Employees</option>
        <option v-for="employee in employees" :key="employee.id" :value="employee.id">
          {{ employee.firstName }} {{ employee.lastName }} (ID: {{ employee.id }})
        </option>
      </select>
      <label for="dateFilter">Filter by Date:</label>
      <input type="date" id="dateFilter" v-model="filters.performanceDate" @input="applyFilters" />
      <button @click="resetFilters">Reset Filters</button>
    </div>

    <div v-if="isLoading">Loading...</div>

    <div v-if="isEditing && !isLoading">
      <h2>Edit Performance</h2>
      <form @submit.prevent="updatePerformance">
        <label for="editEmployeeId">Employee:</label>
        <select id="editEmployeeId" v-model="editPerformance.employeeId" required>
          <option v-for="employee in employees" :key="employee.id" :value="employee.id">
            {{ employee.firstName }} {{ employee.lastName }} (ID: {{ employee.id }})
          </option>
        </select>
        <label for="editDate">Performance Date:</label>
        <input type="date" id="editDate" v-model="editPerformance.performanceDate" required />
        <label for="editRating">Performance Rating:</label>
        <input type="number" id="editRating" v-model="editPerformance.performanceRating" />
        <label for="editComment">Performance Comment:</label>
        <textarea id="editComment" v-model="editPerformance.performanceComment"></textarea>
        <button type="submit">Update</button>
        <button @click="isEditing = false">Cancel</button>
      </form>
    </div>

    <div v-else-if="!isLoading">
      <h2>Create Performance</h2>
      <form @submit.prevent="createPerformance">
        <label for="newEmployeeId">Employee:</label>
        <select id="newEmployeeId" v-model="newPerformance.employeeId" required>
          <option v-for="employee in employees" :key="employee.id" :value="employee.id">
            {{ employee.firstName }} {{ employee.lastName }} (ID: {{ employee.id }})
          </option>
        </select>
        <label for="newDate">Performance Date:</label>
        <input type="date" id="newDate" v-model="newPerformance.performanceDate" required />
        <label for="newRating">Performance Rating:</label>
        <input type="number" id="newRating" v-model="newPerformance.performanceRating" />
        <label for="newComment">Performance Comment:</label>
        <textarea id="newComment" v-model="newPerformance.performanceComment"></textarea>
        <button type="submit">Create</button>
      </form>
    </div>

    <table v-if="!isLoading && performances.length > 0">
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

    <div v-if="!isLoading && performances.length > 0" class="pagination">
      <button :disabled="currentPage === 1" @click="prevPage">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="performances.length < itemsPerPage * currentPage / totalPages" @click="nextPage">Next</button>
    </div>
    <div v-else-if="!isLoading && Object.values(filters).some(val => val) && !performances.length" class="no-results">
      No performances found matching the current filters.
    </div>
    <div v-else-if="!isLoading && !performances.length" class="no-results">
      No performances available.
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted, watch } from 'vue';

const performances = ref([]);
const newPerformance = ref({ employeeId: 0, performanceDate: '', performanceRating: 0, performanceComment: '' });
const editPerformance = ref({ id: 0, employeeId: 0, performanceDate: '', performanceRating: 0, performanceComment: '' });
const isEditing = ref(false);
const employees = ref([]);

const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(1);
const filters = ref({ employeeId: '', performanceDate: '' });

const successMessage = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const fetchPerformances = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get('http://localhost:3000/performances', {
      params: {
        page: currentPage.value,
        limit: itemsPerPage.value,
        employeeId: filters.value.employeeId || undefined,
        performanceDate: filters.value.performanceDate || undefined,
      },
    });
    performances.value = response.data.performances;
    totalPages.value = Math.ceil(response.data.total / itemsPerPage.value);
  } catch (error: any) {
    errorMessage.value = 'Failed to fetch performances.';
  } finally {
    isLoading.value = false;
  }
};

const createPerformance = async () => {
  try {
    await axios.post('http://localhost:3000/performances', newPerformance.value);
    await fetchPerformances();
    newPerformance.value = { employeeId: 0, performanceDate: '', performanceRating: 0, performanceComment: '' };
    successMessage.value = 'Performance created successfully.';
    errorMessage.value = '';
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to create performance.';
    successMessage.value = '';
  }
};

const updatePerformance = async () => {
  try {
    await axios.put(`http://localhost:3000/performances/${editPerformance.value.id}`, editPerformance.value);
    await fetchPerformances();
    isEditing.value = false;
    editPerformance.value = { id: 0, employeeId: 0, performanceDate: '', performanceRating: 0, performanceComment: '' };
    successMessage.value = 'Performance updated successfully.';
    errorMessage.value = '';
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to update performance.';
    successMessage.value = '';
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
    successMessage.value = 'Performance deleted successfully.';
    errorMessage.value = '';
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to delete performance.';
    successMessage.value = '';
  }
};

const fetchEmployees = async () => {
  try {
    const response = await axios.get('http://localhost:3000/employees');
    employees.value = response.data.employees;
  } catch (error) {
    console.error('Error fetching employees:', error);
    errorMessage.value = 'Failed to load employee list.';
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchPerformances();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchPerformances();
  }
};

const applyFilters = () => {
  currentPage.value = 1;
  fetchPerformances();
};

const resetFilters = () => {
  filters.value = { employeeId: '', performanceDate: '' };
  currentPage.value = 1;
  fetchPerformances();
};

onMounted(async () => {
  await fetchPerformances();
  await fetchEmployees();
});

watch(currentPage, fetchPerformances);
watch(filters, applyFilters);
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

.filter-section {
  margin-bottom: 15px;
  display: flex;
  gap: 15px;
  align-items: center;
}

.filter-section label {
  margin-right: 5px;
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

.no-results {
  margin-top: 15px;
  font-style: italic;
  color: #777;
}
</style>