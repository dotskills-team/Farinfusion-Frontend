export interface ISchedule {
  _id: string;
  user: string;
  title: string;
  description?: string;
  date: string; 
  time: string; 
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}