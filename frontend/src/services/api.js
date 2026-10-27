const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear token if expired and not on login page
    if (!endpoint.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || data?.detail || JSON.stringify(data) || `Request failed (${response.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  auth: {
    login: (username, password) => apiRequest('/auth/login/', { method: 'POST', body: JSON.stringify({ username, password }) }),
    me: () => apiRequest('/auth/me/'),
  },
  dashboard: {
    getMetrics: () => apiRequest('/reporting/metrics/dashboard/'),
  },
  properties: {
    getBuildings: () => apiRequest('/properties/buildings/'),
    getFlats: (params = '') => apiRequest(`/properties/flats/${params}`),
    createFlat: (data) => apiRequest('/properties/flats/', { method: 'POST', body: JSON.stringify(data) }),
    updateFlat: (id, data) => apiRequest(`/properties/flats/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  residents: {
    getResidents: (params = '') => apiRequest(`/residents/${params}`),
    createResident: (data) => apiRequest('/residents/', { method: 'POST', body: JSON.stringify(data) }),
    updateResident: (id, data) => apiRequest(`/residents/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  occupancy: {
    getHistory: (params = '') => apiRequest(`/occupancy/${params}`),
    createOccupancy: (data) => apiRequest('/occupancy/', { method: 'POST', body: JSON.stringify(data) }),
    terminate: (id, data) => apiRequest(`/occupancy/${id}/terminate/`, { method: 'POST', body: JSON.stringify(data) }),
  },
  billing: {
    getInvoices: (params = '') => apiRequest(`/billing/invoices/${params}`),
    createInvoice: (data) => apiRequest('/billing/invoices/', { method: 'POST', body: JSON.stringify(data) }),
    runBillingCycle: (data) => apiRequest('/billing/invoices/run_billing_cycle/', { method: 'POST', body: JSON.stringify(data) }),
    getPayments: (params = '') => apiRequest(`/billing/payments/${params}`),
    recordPayment: (data) => apiRequest('/billing/payments/', { method: 'POST', body: JSON.stringify(data) }),
    getPolicies: () => apiRequest('/billing/policies/'),
  },
  maintenance: {
    getTickets: (params = '') => apiRequest(`/maintenance/tickets/${params}`),
    createTicket: (data) => apiRequest('/maintenance/tickets/', { method: 'POST', body: JSON.stringify(data) }),
    transitionTicket: (id, data) => apiRequest(`/maintenance/tickets/${id}/transition/`, { method: 'POST', body: JSON.stringify(data) }),
  },
  visitors: {
    getLogs: (params = '') => apiRequest(`/visitors/logs/${params}`),
    checkin: (data) => apiRequest('/visitors/logs/', { method: 'POST', body: JSON.stringify(data) }),
    checkout: (id) => apiRequest(`/visitors/logs/${id}/checkout/`, { method: 'POST' }),
  },
  amenities: {
    getFacilities: () => apiRequest('/amenities/facilities/'),
    getBookings: (params = '') => apiRequest(`/amenities/reservations/${params}`),
    createBooking: (data) => apiRequest('/amenities/reservations/', { method: 'POST', body: JSON.stringify(data) }),
    cancelBooking: (id) => apiRequest(`/amenities/reservations/${id}/cancel/`, { method: 'POST' }),
  },
  parking: {
    getSlots: (params = '') => apiRequest(`/parking/slots/${params}`),
    getAllocations: (params = '') => apiRequest(`/parking/allocations/${params}`),
    createAllocation: (data) => apiRequest('/parking/allocations/', { method: 'POST', body: JSON.stringify(data) }),
    releaseAllocation: (id) => apiRequest(`/parking/allocations/${id}/release/`, { method: 'POST' }),
  },
  reporting: {
    getDefaulters: () => apiRequest('/reporting/metrics/defaulters/'),
    getSLA: () => apiRequest('/reporting/metrics/sla/'),
    getSettings: () => apiRequest('/reporting/settings/'),
    updateSetting: (id, data) => apiRequest(`/reporting/settings/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    getCapstoneInfo: () => apiRequest('/reporting/capstone/info/'),
  },
  audit: {
    getLogs: (params = '') => apiRequest(`/audit/logs/${params}`),
  },
  users: {
    getUsers: (params = '') => apiRequest(`/users/${params}`),
    createUser: (data) => apiRequest('/users/', { method: 'POST', body: JSON.stringify(data) }),
    getStaff: (params = '') => apiRequest(`/staff/${params}`),
  }
};
