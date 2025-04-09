import axios from 'axios';
import VueCookies from 'vue-cookies';
import { useRouter } from 'vue-router';
const router = useRouter();
const api = axios.create({
    baseURL: 'https://ptpservice-434977812465.europe-west1.run.app/api/',
    headers: {
        Authorization: `Bearer ${VueCookies.get('token')}`,
      'Content-Type': 'application/json',
    },
});  

const getAccessToken = () => VueCookies.get('token');
const getRefreshToken = () => VueCookies.get('refreshToken');

api.interceptors.request.use(
  config => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) throw new Error('Refresh token nem elérhető');
  
          const { data } = await api.post('/auth/refresh-token', {
            Id: VueCookies.get('passengerID'),
            refreshToken: refreshToken,
          });
  

          VueCookies.set('token', data.token);
          VueCookies.set('refreshToken', data.refreshToken);
  
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh sikertelen:', refreshError);
          VueCookies.set('token', '');
          VueCookies.set('refreshToken', '');
          return Promise.reject(refreshError);
          
        }
      }
      return Promise.reject(error);
    }
  );
  
export default api;