import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.withCredentials = true; // Necesario para manejar cookies de sesión

export default axios;
