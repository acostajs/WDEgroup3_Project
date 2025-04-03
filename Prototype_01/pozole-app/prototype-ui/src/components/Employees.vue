<template>
	<div>
	  <h1>Employees</h1>
  
	  <h2>Create Employee</h2>
	  <form @submit.prevent="createEmployee">
		<input type="text" v-model="newEmployee.firstName" placeholder="First Name" />
		<input type="text" v-model="newEmployee.lastName" placeholder="Last Name" />
		<input type="email" v-model="newEmployee.email" placeholder="Email" />
		<input type="text" v-model="newEmployee.phone" placeholder="Phone" />
		<input type="date" v-model="newEmployee.hireDate" placeholder="Hire Date" />
		<button type="submit">Create</button>
	  </form>
  
	  <table>
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
  
  const employees = ref([]);
  const newEmployee = ref({
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	hireDate: '',
  });
  
  const fetchEmployees = async () => {
	try {
	  const response = await axios.get('http://localhost:3000/employees');
	  employees.value = response.data;
	} catch (error) {
	  console.error('Error fetching employees:', error);
	}
  };
  
  const createEmployee = async () => {
	try {
	  await axios.post('http://localhost:3000/employees', newEmployee.value);
	  await fetchEmployees(); // Refresh the employee list
	  newEmployee.value = { firstName: '', lastName: '', email: '', phone: '', hireDate: '' }; // Reset form
	} catch (error) {
	  console.error('Error creating employee:', error);
	}
  };
  
  onMounted(fetchEmployees);
  </script>