<template>
    <div>
      <h1>Schedules</h1>
  
      <div v-if="isEditing">
        <h2>Edit Schedule</h2>
        <form @submit.prevent="updateSchedule">
          <input type="number" v-model="editSchedule.employeeId" placeholder="Employee ID" />
          <input type="date" v-model="editSchedule.date" placeholder="Date" />
          <input type="time" v-model="editSchedule.startTime" placeholder="Start Time" />
          <input type="time" v-model="editSchedule.endTime" placeholder="End Time" />
          <button type="submit">Update</button>
          <button @click="isEditing = false">Cancel</button>
        </form>
      </div>
  
      <div v-else>
        <h2>Create Schedule</h2>
        <form @submit.prevent="createSchedule">
          <input type="number" v-model="newSchedule.employeeId" placeholder="Employee ID" />
          <input type="date" v-model="newSchedule.date" placeholder="Date" />
          <input type="time" v-model="newSchedule.startTime" placeholder="Start Time" />
          <input type="time" v-model="newSchedule.endTime" placeholder="End Time" />
          <button type="submit">Create</button>
        </form>
      </div>
  
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
              <button @click="edit(schedule)">Edit</button>
              <button @click="deleteSchedule(schedule.id)">Delete</button>
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
  const newSchedule = ref({
    employeeId: 0,
    date: '',
    startTime: '',
    endTime: '',
  });
  const editSchedule = ref({
    id: 0,
    employeeId: 0,
    date: '',
    startTime: '',
    endTime: '',
  });
  const isEditing = ref(false);
  
  const fetchSchedules = async () => {
    try {
      const response = await axios.get('http://localhost:3000/schedules');
      schedules.value = response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };
  
  const createSchedule = async () => {
    try {
      await axios.post('http://localhost:3000/schedules', newSchedule.value);
      await fetchSchedules();
      newSchedule.value = { employeeId: 0, date: '', startTime: '', endTime: '' };
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };
  
  const updateSchedule = async () => {
    try {
      await axios.put(`http://localhost:3000/schedules/${editSchedule.value.id}`, editSchedule.value);
      await fetchSchedules();
      isEditing.value = false;
      editSchedule.value = { id: 0, employeeId: 0, date: '', startTime: '', endTime: '' };
    } catch (error) {
      console.error('Error updating schedule:', error);
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
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };
  
  onMounted(fetchSchedules);
  </script>