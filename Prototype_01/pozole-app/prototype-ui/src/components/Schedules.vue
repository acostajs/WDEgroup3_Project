<template>
  <div>
    <h1>Schedules</h1>

    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <div class="filter-section">
      <label for="employeeIdFilter">Filter by Employee:</label>
      <select id="employeeIdFilter" v-model="filters.employeeId" @change="applyFilters">
        <option value="">All Employees</option>
        <option v-for="employee in availableEmployees" :key="employee.id" :value="employee.id">
          {{ employee.firstName }} {{ employee.lastName }} (ID: {{ employee.id }})
        </option>
      </select>
      <label for="dateFilter">Filter by Date:</label>
      <input type="date" id="dateFilter" v-model="filters.date" @input="applyFilters" />
      <button @click="resetFilters">Reset Filters</button>
    </div>

    <div v-if="isLoading">Loading...</div>

    <div v-if="isEditing && !isLoading">
      <h2>Edit Schedule</h2>
      <form @submit.prevent="updateSchedule">
        <label for="editEmployeeId">Employee:</label>
        <select id="editEmployeeId" v-model="editSchedule.employeeId" required>
          <option value="" disabled>Select Employee</option>
          <option v-for="employee in availableEmployees" :key="employee.id" :value="employee.id">
            {{ employee.firstName }} {{ employee.lastName }} (ID: {{ employee.id }})
          </option>
        </select>
        <label for="editDate">Date:</label>
        <input type="date" id="editDate" v-model="editSchedule.date" required />
        <label for="editStartTime">Start Time:</label>
        <input type="time" id="editStartTime" v-model="editSchedule.startTime" required />
        <label for="editEndTime">End Time:</label>
        <input type="time" id="editEndTime" v-model="editSchedule.endTime" required />
        <button type="submit">Update</button>
        <button @click="isEditing = false">Cancel</button>
      </form>
    </div>

    <div v-else-if="!isLoading">
      <h2>Create Schedule</h2>
      <form @submit.prevent="createSchedule">
        <label for="newEmployeeId">Employee:</label>
        <select id="newEmployeeId" v-model="newSchedule.employeeId" required>
          <option value="" disabled>Select Employee</option>
          <option v-for="employee in availableEmployees" :key="employee.id" :value="employee.id">
            {{ employee.firstName }} {{ employee.lastName }} (ID: {{ employee.id }})
          </option>
        </select>
        <label for="newDate">Date:</label>
        <input type="date" id="newDate" v-model="newSchedule.date" required />
        <label for="newStartTime">Start Time:</label>
        <input type="time" id="newStartTime" v-model="newSchedule.startTime" required />
        <label for="newEndTime">End Time:</label>
        <input type="time" id="newEndTime" v-model="newSchedule.endTime" required />
        <button type="submit">Create</button>
      </form>
    </div>

    <table v-if="!isLoading && schedules.length > 0">
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
            <button @click="edit(schedule)">Edit</button>
            <button @click="deleteSchedule(schedule.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!isLoading && schedules.length > 0" class="pagination">
      <button :disabled="currentPage === 1" @click="prevPage">Previous</button>
      <span>Page {{ currentPage }}</span>
      <button :disabled="schedules.length < pageSize" @click="nextPage">Next</button>
    </div>
    <div v-else-if="!isLoading && Object.values(filters).some(val => val) && !schedules.length" class="no-results">
      No schedules found matching the current filters.
    </div>
    <div v-else-if="!isLoading && !schedules.length" class="no-results">
      No schedules available.
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted, watch } from 'vue';

const schedules = ref([]);
const newSchedule = ref({ employeeId: '', date: '', startTime: '', endTime: '' });
const editSchedule = ref({ id: 0, employeeId: '', date: '', startTime: '', endTime: '' });
const isEditing = ref(false);
const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(1);
const filters = ref({ employeeId: '', date: '' });
const availableEmployees = ref([]);

const fetchSchedules = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get('http://localhost:3000/schedules', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        employeeId: filters.value.employeeId || undefined,
        date: filters.value.date || undefined,
      },
    });
    schedules.value = response.data.schedules;
    totalPages.value = response.data.totalPages;
  } catch (error: any) {
    errorMessage.value = 'Failed to fetch schedules.';
  } finally {
    isLoading.value = false;
  }
};

const fetchAvailableEmployees = async () => {
  try {
    const response = await axios.get('http://localhost:3000/employees');
    availableEmployees.value = response.data.employees;
  } catch (error) {
    errorMessage.value = 'Failed to load employee list.';
  }
};

const createSchedule = async () => {
  try {
    await axios.post('http://localhost:3000/schedules', newSchedule.value);
    await fetchSchedules();
    newSchedule.value = { employeeId: '', date: '', startTime: '', endTime: '' };
    successMessage.value = 'Schedule created successfully.';
    errorMessage.value = '';
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to create schedule.';
    successMessage.value = '';
  }
};

const updateSchedule = async () => {
  try {
    await axios.put(`http://localhost:3000/schedules/${editSchedule.value.id}`, editSchedule.value);
    await fetchSchedules();
    isEditing.value = false;
    editSchedule.value = { id: 0, employeeId: '', date: '', startTime: '', endTime: '' };
    successMessage.value = 'Schedule updated successfully.';
    errorMessage.value = '';
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to update schedule.';
    successMessage.value = '';
  }
};

const edit = (schedule: any) => {
  editSchedule.value = { ...schedule };
  isEditing.value = true;
};

const deleteSchedule = async (id: number) => {
  try {
    await axios.delete(`http://localhost:3000/schedules/${id}`);
    await fetchSchedules();
    successMessage.value = 'Schedule deleted successfully.';
    errorMessage.value = '';
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to delete schedule.';
    successMessage.value = '';
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchSchedules();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchSchedules();
  }
};

const applyFilters = () => {
  currentPage.value = 1;
  fetchSchedules();
};

const resetFilters = () => {
  filters.value = { employeeId: '', date: '' };
  currentPage.value = 1;
  fetchSchedules();
};

onMounted(() => {
  fetchSchedules();
  fetchAvailableEmployees();
});

watch(currentPage, fetchSchedules);
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
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pagination button {
  margin: 0 5px;
}
.no-results {
  margin-top: 15px;
  font-style: italic;
  color: #777;
}
</style>