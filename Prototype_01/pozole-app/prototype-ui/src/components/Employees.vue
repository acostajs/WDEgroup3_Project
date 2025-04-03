<template>
	<div>
	  <h1>Employees</h1>
  
	  <div v-if="isEditing">
		<h2>Edit Employee</h2>
		<form @submit.prevent="updateEmployee">
		  <input type="text" v-model="editEmployee.firstName" placeholder="First Name" />
		  <input type="text" v-model="editEmployee.lastName" placeholder="Last Name" />
		  <input type="email" v-model="editEmployee.email" placeholder="Email" />
		  <input type="text" v-model="editEmployee.phone" placeholder="Phone" />
		  <input type="date" v-model="editEmployee.hireDate" placeholder="Hire Date" />
		  <button type="submit">Update</button>
		  <button @click="isEditing = false">Cancel</button>
		</form>
	  </div>
  
	  <div v-else>
		<h2>Create Employee</h2>
		<form @submit.prevent="createEmployee">
		  <input type="text" v-model="newEmployee.firstName" placeholder="First Name" />
		  <input type="text" v-model="newEmployee.lastName" placeholder="Last Name" />
		  <input type="email" v-model="newEmployee.email" placeholder="Email" />
		  <input type="text" v-model="newEmployee.phone" placeholder="Phone" />
		  <input type="date" v-model="newEmployee.hireDate" placeholder="Hire Date" />
		  <button type="submit">Create</button>
		</form>
	  </div>
  
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
			  <button @click="edit(employee)">Edit</button>
			  <button @click="deleteEmployee(employee.id)">Delete</button>
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
  const editEmployee = ref({
	id: 0,
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	hireDate: '',
  });
  const isEditing = ref(false);
  
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
	  await fetchEmployees();
	  newEmployee.value = { firstName: '', lastName: '', email: '', phone: '', hireDate: '' };
	} catch (error) {
	  console.error('Error creating employee:', error);
	}
  };
  
  const updateEmployee = async () => {
	try {
	  await axios.put(`http://localhost:3000/employees/${editEmployee.value.id}`, editEmployee.value);
	  await fetchEmployees();
	  isEditing.value = false;
	  editEmployee.value = { id: 0, firstName: '', lastName: '', email: '', phone: '', hireDate: '' };
	} catch (error) {
	  console.error('Error updating employee:', error);
	}
  };
  
  const deleteEmployee = async (id: number) => {
	try {
	  await axios.delete(`http://localhost:3000/employees/${id}`);
	  await fetchEmployees();
	} catch (error) {
	  console.error('Error deleting employee:', error);
	}
  };
  
  const edit = (employee: any) => {
	editEmployee.value = { ...employee };
	isEditing.value = true;
  };
  
  onMounted(fetchEmployees);
  </script>