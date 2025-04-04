<template>
	<div>
	  <h1>Employees</h1>
  
	  <div v-if="successMessage" class="success-message">
		{{ successMessage }}
	  </div>
	  <div v-if="errorMessage" class="error-message">
		{{ errorMessage }}
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
  
	  <table v-if="!isLoading">
		<thead>
		  <tr>
			<th>ID</th>
			<th>First Name</th>
			<th>Last Name</th>
			<th>Email</th>
			<th>Phone</th>
			<th>Hire Date</th>
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
  
	  <div v-if="!isLoading" class="pagination">
		<button :disabled="currentPage === 1" @click="prevPage">Previous</button>
		<span>Page {{ currentPage }}</span>
		<button :disabled="employees.length < pageSize" @click="nextPage">Next</button>
	  </div>
	</div>
  </template>
  
  <script setup lang="ts">
  import axios from 'axios';
  import { ref, onMounted } from 'vue';
  
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
  const pageSize = ref(10); // Adjust as needed
  
  const fetchEmployees = async () => {
	isLoading.value = true;
	try {
	  const response = await axios.get(`http://localhost:3000/employees?page=${currentPage.value}&limit=${pageSize.value}`);
	  employees.value = response.data;
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
  
  onMounted(async () => {
	await fetchEmployees();
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
	margin-top: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
  }
  
  .pagination button {
	margin: 0 5px;
  }
  </style>