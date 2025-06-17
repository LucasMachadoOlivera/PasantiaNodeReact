import axios from "axios";

axios.defaults.baseURL = `http://${import.meta.env.VITE_HOST}:${
  import.meta.env.VITE_PORT
}`;
axios.defaults.withCredentials = true; // Necesario para manejar cookies de sesión

export default axios;
