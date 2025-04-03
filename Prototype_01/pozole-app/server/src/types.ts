// types.ts

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string;
}

export interface Schedule {
  id: number;
  employeeId: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface CreateScheduleRequest {
  employeeId: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface Performance {
  id: number;
  employeeId: number;
  performanceDate: string;
  performanceRating: number;
  performanceComment: string;
}

export interface CreatePerformanceRequest {
  employeeId: number;
  performanceDate: string;
  performanceRating: number;
  performanceComment: string;
}