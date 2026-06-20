/**
 * Central API configuration.
 *
 * CHANGE HERE IF: your backend is running on a different URL/port
 * (e.g. when you deploy it online, change BASE_URL to your live
 * backend URL instead of localhost).
 */

import axios from "axios";

export const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;
