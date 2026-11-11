import axios from 'axios';

// All requests go to the real backend (see vite.config.js proxy)
export default axios.create({ baseURL: '/api', withCredentials: true });