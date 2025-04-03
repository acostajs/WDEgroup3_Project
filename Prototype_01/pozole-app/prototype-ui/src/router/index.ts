import { createRouter, createWebHistory } from 'vue-router';
import Employees from '../components/Employees.vue';
import Schedules from '../components/Schedules.vue'; 
import Performances from '../components/Performances.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/employees',
      name: 'Employees',
      component: Employees,
    },
    {
      path: '/schedules',
      name: 'Schedules',
      component: Schedules, // Add this route
    },
    {
      path: '/performances',
      name: 'Performances',
      component: Performances,
    },
  ],
});

export default router;