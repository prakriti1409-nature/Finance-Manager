import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// **Android emulator** host for local machine
const API_URL = "http://10.0.2.2:8000/api/";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // ignore
  }
  return config;
});

export default api;
