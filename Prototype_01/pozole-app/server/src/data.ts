export interface Employee {
    id: number;
    name: string;
    role: string;
  }

export interface Schedule {
    id: number;
    employeeId: number;
    date: string;
    startTime: string;
    endTime: string;
}
