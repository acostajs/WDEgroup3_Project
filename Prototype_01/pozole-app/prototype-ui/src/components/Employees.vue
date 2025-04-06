<template>
	<div>
	  <h1>Employees</h1>
  
	  <div v-if="successMessage" class="success-message">
		{{ successMessage }}
	  </div>
	  <div v-if="errorMessage" class="error-message">
		{{ errorMessage }}
	  </div>
  
	  <div class="filter-section">
		<input type="number" v-model="filters.id" placeholder="Filter by ID" @input="applyFilters" />
		<input type="text" v-model="filters.firstName" placeholder="Filter by First Name" @input="applyFilters" />
		<input type="text" v-model="filters.lastName" placeholder="Filter by Last Name" @input="applyFilters" />
		<input type="email" v-model="filters.email" placeholder="Filter by Email" @input="applyFilters" />
		<button @click="resetFilters">Reset Filters</button>
	  </div>
  
	  <div v-if="isLoading">Loading...</div>
  
	  <div v-if="isEditing && !isLoading">
		<h2>Edit Employee</h2>
		<form @submit.prevent="updateEmployee">
		  <input type="text" v-model="editEmployee.firstName" placeholder="First Name" required />
		  <input type="text" v-model="editEmployee.lastName" placeholder="Last Name" required />
		  <input type="email" v-model="editEmployee.email" placeholder="Email" required />
		  <input type="tel" v-model="editEmployee.phone" placeholder="Phone" required />
		  <input type="date" v-model="editEmployee.hireDate" placeholder="Hire Date" required />
		  <button type="submit">Update</button>
		  <button @click="isEditing = false">Cancel</button>
		</form>
	  </div>
  
	  <div v-else-if="!isLoading">
		<h2>Create Employee</h2>
		<form @submit.prevent="createEmployee">
		  <input type="text" v-model="newEmployee.firstName" placeholder="First Name" required />
		  <input type="text" v-model="newEmployee.lastName" placeholder="Last Name" required />
		  <input type="email" v-model="newEmployee.email" placeholder="Email" required />
		  <input type="tel" v-model="newEmployee.phone" placeholder="Phone" required />
		  <input type="date" v-model="newEmployee.hireDate" placeholder="Hire Date" required />
		  <button type="submit">Create</button>
		</form>
	  </div>
  
	  <table v-if="!isLoading && employees.length > 0">
		<thead>
		  <tr>
			<th @click="handleSort('id')" :class="{ active: sortColumn === 'id' }">ID <span v-if="sortColumn === 'id'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span></th>
			<th @click="handleSort('firstName')" :class="{ active: sortColumn === 'firstName' }">First Name <span v-if="sortColumn === 'firstName'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span></th>
			<th @click="handleSort('lastName')" :class="{ active: sortColumn === 'lastName' }">Last Name <span v-if="sortColumn === 'lastName'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span></th>
			<th @click="handleSort('email')" :class="{ active: sortColumn === 'email' }">Email <span v-if="sortColumn === 'email'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span></th>
			<th @click="handleSort('phone')" :class="{ active: sortColumn === 'phone' }">Phone <span v-if="sortColumn === 'phone'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span></th>
			<th @click="handleSort('hireDate')" :class="{ active: sortColumn === 'hireDate' }">Hire Date <span v-if="sortColumn === 'hireDate'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span></th>
			<th>Actions</th>
		  </tr>
		</thead>
		<tbody>
		  <tr v-for="employee in employees" :key="employee.id">
			<td>{{ employee.id }}</td>
			<td>{{ employee.firstName }}</td>
			<td>{{ employee.lastName }}</td>
			<td>{{ employee.email }}</td>
			<td>{{ employee.phone }}</td>
			<td>{{ employee.hireDate }}</td>
			<td>
			  <button @click="edit(employee)">Edit</button>
			  <button @click="deleteEmployee(employee.id)">Delete</button>
			</td>
		  </tr>
		</tbody>
	  </table>
  
	  <div v-if="!isLoading && employees.length > 0" class="pagination">
		<button :disabled="currentPage === 1" @click="prevPage">Previous</button>
		<span>Page {{ currentPage }}</span>
		<button :disabled="employees.length < pageSize" @click="nextPage">Next</button>
	  </div>
	  <div v-else-if="!isLoading && filters.id && employees.length === 0" class="no-results">
		No employees found with ID: {{ filters.id }}
	  </div>
	  <div v-else-if="!isLoading && filters.firstName && employees.length === 0" class="no-results">
		No employees found with First Name containing: {{ filters.firstName }}
	  </div>
	  <div v-else-if="!isLoading && filters.lastName && employees.length === 0" class="no-results">
		No employees found with Last Name containing: {{ filters.lastName }}
	  </div>
	  <div v-else-if="!isLoading && filters.email && employees.length === 0" class="no-results">
		No employees found with Email containing: {{ filters.email }}
	  </div>
	  <div v-else-if="!isLoading && Object.values(filters).some(val => val) && !employees.length" class="no-results">
		No employees found matching the current filters.
	  </div>
	  <div v-else-if="!isLoading && !employees.length && !Object.values(filters).some(val => val)" class="no-results">
		No employees available.
	  </div>
	  <div v-else-if="!isLoading && !employees.length && Object.values(filters).some(val => val)" class="no-results">
		No employees found matching the current filters.
	  </div>
	</div>
  </template>
  
  <script setup lang="ts">
  import axios from 'axios';
  import { ref, onMounted, watch } from 'vue';
  
  const employees = ref([]);
  const newEmployee = ref({
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	hireDate: '',
  });
  const editEmployee = ref({
	id: 0,
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	hireDate: '',
  });
  const isEditing = ref(false);
  
  const successMessage = ref('');
  const errorMessage = ref('');
  const isLoading = ref(false);
  
  const currentPage = ref(1);
  const pageSize = ref(10);
  const filters = ref({
	id: '',
	firstName: '',
	lastName: '',
	email: '',
  });
  
  const sortColumn = ref('');
  const sortDirection = ref<'asc' | 'desc'>('asc');
  
  const fetchEmployees = async () => {
	isLoading.value = true;
	try {
	  const response = await axios.get('http://localhost:3000/employees', {
		params: {
		  page: currentPage.value,
		  limit: pageSize.value,
		  id: filters.value.id || undefined,
		  firstName: filters.value.firstName || undefined,
		  lastName: filters.value.lastName || undefined,
		  email: filters.value.email || undefined,
		  sortBy: sortColumn.value || undefined,
		  sortOrder: sortDirection.value || undefined,
		},
	  });
	  employees.value = response.data.employees;
	  // Assuming your back-end returns { employees: [], totalPages: ..., currentPage: ... }
	  // You might need to adjust this based on your actual back-end response structure
	} catch (error) {
	  console.error('Error fetching employees:', error);
	  errorMessage.value = 'Failed to fetch employees.';
	} finally {
	  isLoading.value = false;
	}
  };
  
  const createEmployee = async () => {
	isLoading.value = true;
	try {
	  await axios.post('http://localhost:3000/employees', newEmployee.value);
	  await fetchEmployees();
	  newEmployee.value = { firstName: '', lastName: '', email: '', phone: '', hireDate: '' };
	  successMessage.value = 'Employee created successfully.';
	  errorMessage.value = '';
	} catch (error: any) {
	  console.error('Error creating employee:', error);
	  errorMessage.value = error.response?.data?.error || 'Failed to create employee.';
	  successMessage.value = '';
	} finally {
	  isLoading.value = false;
	}
  };
  
  const updateEmployee = async () => {
	isLoading.value = true;
	try {
	  await axios.put(`http://localhost:3000/employees/${editEmployee.value.id}`, editEmployee.value);
	  await fetchEmployees();
	  isEditing.value = false;
	  editEmployee.value = { id: 0, firstName: '', lastName: '', email: '', phone: '', hireDate: '' };
	  successMessage.value = 'Employee updated successfully.';
	  errorMessage.value = '';
	} catch (error: any) {
	  console.error('Error updating employee:', error);
	  errorMessage.value = error.response?.data?.error || 'Failed to update employee.';
	  successMessage.value = '';
	} finally {
	  isLoading.value = false;
	}
  };
  
  const edit = (employee: any) => {
	editEmployee.value = { ...employee };
	isEditing.value = true;
  };
  
  const deleteEmployee = async (id: number) => {
	isLoading.value = true;
	try {
	  await axios.delete(`http://localhost:3000/employees/${id}`);
	  await fetchEmployees();
	  successMessage.value = 'Employee deleted successfully.';
	  errorMessage.value = '';
	} catch (error: any) {
	  console.error('Error deleting employee:', error);
	  errorMessage.value = error.response?.data?.error || 'Failed to delete employee.';
	  successMessage.value = '';
	} finally {
	  isLoading.value = false;
	}
  };
  
  const nextPage = () => {
	currentPage.value++;
	fetchEmployees();
  };
  
  const prevPage = () => {
	if (currentPage.value > 1) {
	  currentPage.value--;
	  fetchEmployees();
	}
  };
  
  const applyFilters = () => {
	currentPage.value = 1;
	fetchEmployees();
  };
  
  const resetFilters = () => {
	filters.value = { id: '', firstName: '', lastName: '', email: '' };
	currentPage.value = 1;
	fetchEmployees();
  };
  
  const handleSort = (column: string) => {
	if (sortColumn.value === column) {
	  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
	} else {
	  sortColumn.value = column;
	  sortDirection.value = 'asc';
	}
	currentPage.value = 1; // Reset to the first page on sorting
	fetchEmployees();
  };
  
  onMounted(async () => {
	await fetchEmployees();
  });
  
  watch([currentPage, filters, sortColumn, sortDirection], fetchEmployees);
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
	gap: 10px;
	align-items: center;
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
  
  th {
	cursor: pointer;
	user-select: none; /* Prevent text selection on click */
  }
  
  th.active {
	font-weight: bold;
  }
  </style>