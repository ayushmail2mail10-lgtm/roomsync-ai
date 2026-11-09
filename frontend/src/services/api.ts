const API_BASE = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('roomsync_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('roomsync_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('roomsync_token');
};

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(errorData.detail || `HTTP Error ${response.status}`);
  }

  return response.json();
};

export const api = {
  // Auth
  register: (data: any) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchWithAuth('/auth/me'),

  // Profile
  getMyProfile: () => fetchWithAuth('/profiles/me'),
  updateMyProfile: (data: any) => fetchWithAuth('/profiles/me', { method: 'PUT', body: JSON.stringify(data) }),
  getUserProfile: (userId: number) => fetchWithAuth(`/profiles/${userId}`),

  // Matches
  exploreRoommates: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.append(k, String(v));
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchWithAuth(`/matches/explore${query}`);
  },
  getMatchBreakdown: (targetUserId: number) => fetchWithAuth(`/matches/${targetUserId}/compatibility`),

  // Expenses & Rent
  getGroups: () => fetchWithAuth('/expenses/groups'),
  createGroup: (data: any) => fetchWithAuth('/expenses/groups', { method: 'POST', body: JSON.stringify(data) }),
  getGroupExpenses: (groupId: number) => fetchWithAuth(`/expenses/groups/${groupId}/expenses`),
  addExpense: (groupId: number, data: any) => fetchWithAuth(`/expenses/groups/${groupId}/expenses`, { method: 'POST', body: JSON.stringify(data) }),
  markSplitPaid: (splitId: number, upiRef?: string) => fetchWithAuth(`/expenses/splits/${splitId}/pay?upi_ref=${encodeURIComponent(upiRef || 'UPI-AXIS-994821')}`, { method: 'POST' }),
  generateUpiQr: (data: { payee_upi: string; payee_name: string; amount: number; note?: string }) => 
    fetchWithAuth('/expenses/upi-qr', { method: 'POST', body: JSON.stringify(data) }),
  getDashboardSummary: () => fetchWithAuth('/expenses/dashboard-summary'),

  // Chat
  getConversations: () => fetchWithAuth('/chat/conversations'),
  startConversation: (recipientId: number, initialMessage?: string) => 
    fetchWithAuth('/chat/conversations/start', { method: 'POST', body: JSON.stringify({ recipient_id: recipientId, initial_message: initialMessage }) }),
  getMessages: (conversationId: number) => fetchWithAuth(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: number, text: string, isIcebreaker: boolean = false) => 
    fetchWithAuth('/chat/messages', { method: 'POST', body: JSON.stringify({ conversation_id: conversationId, text, is_icebreaker: isIcebreaker }) }),
  getIcebreakers: () => fetchWithAuth('/chat/icebreakers'),

  // Verification & Safety
  getVerificationStatus: () => fetchWithAuth('/verification/status'),
  verifyAadhaar: (aadhaarNumber: string, otp: string) => 
    fetchWithAuth('/verification/verify-aadhaar', { method: 'POST', body: JSON.stringify({ aadhaar_number: aadhaarNumber, otp }) }),
  verifyPan: (panNumber: string, fullName: string) => 
    fetchWithAuth('/verification/verify-pan', { method: 'POST', body: JSON.stringify({ pan_number: panNumber, full_name: fullName }) }),
  verifyWorkEmail: (workEmail: string, companyName: string) => 
    fetchWithAuth('/verification/verify-work-email', { method: 'POST', body: JSON.stringify({ work_email: workEmail, company_name: companyName }) }),
  getSafeMeets: () => fetchWithAuth('/verification/safe-meets'),
  scheduleSafeMeet: (data: any) => fetchWithAuth('/verification/safe-meets', { method: 'POST', body: JSON.stringify(data) }),
  reportBlock: (data: any) => fetchWithAuth('/verification/report-block', { method: 'POST', body: JSON.stringify(data) }),
  getSafemeetCafes: () => fetchWithAuth('/verification/cafes'),

  // Administration (Protected by require_admin)
  getAdminMetrics: () => fetchWithAuth('/admin/metrics'),
  getAdminUsers: () => fetchWithAuth('/admin/users'),
  toggleUserStatus: (userId: number) => fetchWithAuth(`/admin/users/${userId}/toggle-status`, { method: 'POST' }),
  approveVerification: (userId: number) => fetchWithAuth(`/admin/verifications/${userId}/approve`, { method: 'POST' }),
  getAdminReports: () => fetchWithAuth('/admin/reports'),

  // Properties & Rooms (Phase 4)
  getProperties: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.append(k, String(v));
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchWithAuth(`/properties${query}`);
  },
  getProperty: (id: number) => fetchWithAuth(`/properties/${id}`),
  getMyProperties: () => fetchWithAuth('/properties/my-listings'),
  createProperty: (data: any) => fetchWithAuth('/properties', { method: 'POST', body: JSON.stringify(data) }),
  updateProperty: (id: number, data: any) => fetchWithAuth(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  archiveProperty: (id: number) => fetchWithAuth(`/properties/${id}`, { method: 'DELETE' }),
  addRoomToProperty: (propertyId: number, data: any) => fetchWithAuth(`/properties/${propertyId}/rooms`, { method: 'POST', body: JSON.stringify(data) }),

  // Applications (Phase 4)
  applyForProperty: (propertyId: number, data: { room_id?: number | null; message?: string; move_in_date?: string; proposed_budget?: number }) =>
    fetchWithAuth(`/applications/properties/${propertyId}/apply`, { method: 'POST', body: JSON.stringify(data) }),
  getMyApplications: () => fetchWithAuth('/applications/my-applications'),
  getIncomingApplications: (filters: { property_id?: number; status_filter?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.property_id) params.append('property_id', String(filters.property_id));
    if (filters.status_filter) params.append('status_filter', filters.status_filter);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchWithAuth(`/applications/incoming${query}`);
  },
  decideApplication: (applicationId: number, decision: 'accepted' | 'rejected' | 'shortlisted') =>
    fetchWithAuth(`/applications/${applicationId}/decision`, { method: 'POST', body: JSON.stringify({ decision }) }),
};

