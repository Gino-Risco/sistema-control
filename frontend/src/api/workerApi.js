import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const workerApi = axios.create({
  baseURL: `${API_BASE_URL}/workers`,
  timeout: 10000
});

export default workerApi;