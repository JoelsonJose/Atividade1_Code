const BACKEND_API_URL = 'https://atividade1-code.onrender.com/api';
const COUNTRIES_API_URL = 'https://restcountries.com/v3.1/all?fields=name,flags,translations,region,capital';

export const fetchCountries = async () => {
  try {
    const response = await fetch(COUNTRIES_API_URL);
    return await response.json();
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

export const authService = {
  login: async (username, password) => {
    const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return await response.json();
  },
  register: async (username, password) => {
    const response = await fetch(`${BACKEND_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return await response.json();
  },
};

export const characterService = {
  getAll: async (token) => {
    const response = await fetch(`${BACKEND_API_URL}/characters`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  },
  save: async (token, charData) => {
    const { _id, ...data } = charData;
    const method = _id ? 'PUT' : 'POST';
    const url = _id ? `${BACKEND_API_URL}/characters/${_id}` : `${BACKEND_API_URL}/characters`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  },
  delete: async (token, id) => {
    const response = await fetch(`${BACKEND_API_URL}/characters/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  },
  updateScore: async (token, id, score, level) => {
    const response = await fetch(`${BACKEND_API_URL}/characters/${id}/score`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ score, level }),
    });
    return await response.json();
  },
};
