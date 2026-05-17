import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const setGoal = (goal) => api.post('/goal', { goal });
export const getAgents = () => api.get('/agents');
export const requestChapter2 = () => api.post('/chapter2/request');

export default api;
