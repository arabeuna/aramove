import axios from 'axios';

const api = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      url: error.config.url,
      method: error.config.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api; 

async function makeRequest(method, endpoint, data) {
  const token = localStorage.getItem('token');
  try {
    const response = await axios({
      method,
      url: `${process.env.REACT_APP_API_URL}${endpoint}`,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
}

export { makeRequest }; 