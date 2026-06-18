import API from './axios';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// ── Events ────────────────────────────────────────────────────────────────────
export const getEvents = (params) => API.get('/events', { params });
export const getEventById = (id) => API.get(`/events/${id}`);
export const createEvent = (data) => API.post('/events', data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);

// ── Registrations ─────────────────────────────────────────────────────────────
export const registerForEvent = (id) => API.post(`/events/${id}/register`);
export const cancelRegistration = (id) => API.delete(`/events/${id}/register`);
export const getAttendees = (id) => API.get(`/events/${id}/attendees`);
export const getMyEvents = () => API.get('/users/my-events');
