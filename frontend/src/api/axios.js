import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import store, { logout } from "../store/store";

// Android emulator host for local machine
const API_URL = "http://10.0.2.2:8000/api/";

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

// attach token
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    console.log("TOKEN SENT:", token);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {}
  return config;
});

// handle 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        await AsyncStorage.removeItem("access_token");
      } catch (e) {}
      try {
        store.dispatch(logout());
      } catch (e) {}
      if (typeof global.onLogout === "function") global.onLogout();
    }
    return Promise.reject(error);
  }
);

export default api;
