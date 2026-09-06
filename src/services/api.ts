import {
  Complaint,
  Prediction,
  HistoricalCase,
  IntelligenceReport,
  ActivityLog,
  AppNotification,
  DashboardStats,
  User,
  VictimEvidence,
  RecoveryStatus,
  SihAtmLocation,
  SihMuleTransaction,
  SihPredictionRequest,
  SihPredictionResult,
  SihModelMetrics
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('mha_cybercrime_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('mha_cybercrime_token', data.token);
    return data;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    organization: string;
    role?: 'officer' | 'admin';
  }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    localStorage.setItem('mha_cybercrime_token', data.token);
    return data;
  },

  async forgotPassword(email: string, newPassword?: string): Promise<{ message: string; email?: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password reset failed');
    return data;
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Session expired');
    return data.user || data;
  },

  logout() {
    localStorage.removeItem('mha_cybercrime_token');
  },

  // Complaints
  async getComplaints(filters?: { fraudType?: string; status?: string; search?: string }): Promise<Complaint[]> {
    const params = new URLSearchParams();
    if (filters?.fraudType && filters.fraudType !== 'All') params.append('fraudType', filters.fraudType);
    if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/complaints?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch complaints');
    return Array.isArray(data) ? data : data.complaints || [];
  },

  async getComplaint(id: string): Promise<{ complaint: Complaint; prediction?: Prediction }> {
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch complaint');
    return data;
  },

  async getCaseInvestigation(id: string): Promise<{
    complaint: Complaint;
    victim: {
      victimId: string;
      name: string;
      email: string;
      mobile: string;
      address: string;
      city?: string;
      state?: string;
      aadhaar?: string;
      registrationDate?: string;
    };
    prediction?: Prediction;
    evidence: VictimEvidence[];
    recovery?: RecoveryStatus;
    historicalSimilar: Array<HistoricalCase & { matchScore?: number }>;
    assignments: any[];
    officers: any[];
  }> {
    const res = await fetch(`${API_BASE}/complaints/${id}/investigation`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch case investigation dossier');
    return data;
  },

  async createComplaint(payload: Partial<Complaint>): Promise<{
    complaint: Complaint;
    prediction: Prediction;
    report: IntelligenceReport;
  }> {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit complaint');
    return data;
  },

  async updateComplaintStatus(
    id: string,
    params: {
      status?: string;
      noteText?: string;
      priority?: 'Critical' | 'High' | 'Medium' | 'Low';
      amountFrozen?: number;
      amountRecovered?: number;
    }
  ): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update complaint status');
    return data;
  },

  async assignOfficer(
    id: string,
    payload: {
      officerId?: string;
      officerName: string;
      designation?: string;
      organization?: string;
      contact?: string;
      badgeNumber?: string;
      instructions?: string;
    }
  ): Promise<Complaint> {
    const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to assign officer');
    return data;
  },

  async getOfficers(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/officers`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch officers');
    return Array.isArray(data) ? data : [];
  },

  // Predictions
  async getPredictions(): Promise<Prediction[]> {
    const res = await fetch(`${API_BASE}/predictions`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch predictions');
    return Array.isArray(data) ? data : data.predictions || [];
  },

  async regeneratePrediction(complaintId: string): Promise<Prediction> {
    const res = await fetch(`${API_BASE}/predictions/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ complaintId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to regenerate prediction');
    return data;
  },

  // Historical Cases
  async getHistoricalCases(): Promise<HistoricalCase[]> {
    const res = await fetch(`${API_BASE}/historical-cases`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch historical cases');
    return Array.isArray(data) ? data : [];
  },

  async createHistoricalCase(item: Partial<HistoricalCase>): Promise<HistoricalCase> {
    const res = await fetch(`${API_BASE}/historical-cases`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add historical case');
    return data;
  },

  async importHistoricalCases(items: Partial<HistoricalCase>[]): Promise<{ success: boolean; count: number; total: number }> {
    const res = await fetch(`${API_BASE}/historical-cases/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to import historical cases');
    return data;
  },

  // Reports
  async getReports(): Promise<IntelligenceReport[]> {
    const res = await fetch(`${API_BASE}/reports`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch reports');
    return Array.isArray(data) ? data : data.reports || [];
  },

  async getReport(id: string): Promise<IntelligenceReport> {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch report');
    return data;
  },

  // Analytics
  async getAnalytics(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics');
    return data;
  },

  // Tactical Alert Dispatch
  async dispatchAlert(data: {
    complaintId: string;
    zoneName: string;
    atmName?: string;
    policeStation?: string;
    urgency?: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/interventions/dispatch`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to dispatch alert');
    return resData;
  },

  // Notifications & Logs
  async getNotifications(): Promise<AppNotification[]> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch notifications');
    return Array.isArray(data) ? data : [];
  },

  async markNotificationAsRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
  },

  async getLogs(): Promise<ActivityLog[]> {
    const res = await fetch(`${API_BASE}/logs`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch logs');
    return Array.isArray(data) ? data : [];
  },

  // SIH Cybercrime Predictive Intelligence APIs (from manalgharat61/sih-cybercrime-intelligence)
  async sihPredict(req: SihPredictionRequest): Promise<SihPredictionResult> {
    const res = await fetch(`${API_BASE}/sih/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'SIH Prediction failed');
    return data;
  },

  async getSihAtms(params?: { zone?: string; bank?: string; highRisk?: boolean }): Promise<SihAtmLocation[]> {
    const query = new URLSearchParams();
    if (params?.zone) query.append('zone', params.zone);
    if (params?.bank) query.append('bank', params.bank);
    if (params?.highRisk) query.append('highRisk', 'true');
    const res = await fetch(`${API_BASE}/sih/atms?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch ATMs');
    return Array.isArray(data) ? data : [];
  },

  async getSihMuleTransactions(params?: { limit?: number; search?: string }): Promise<SihMuleTransaction[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${API_BASE}/sih/mule-transactions?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch mule transactions');
    return Array.isArray(data) ? data : [];
  },

  async getSihModelMetrics(): Promise<SihModelMetrics> {
    const res = await fetch(`${API_BASE}/sih/model-metrics`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch model metrics');
    return data;
  }
};

function getVictimAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('mha_victim_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const victimApi = {
  // Auth
  async login(identifier: string, password: string): Promise<{ victim: any; token: string }> {
    const res = await fetch(`${API_BASE}/victim/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('mha_victim_token', data.token);
    return data;
  },

  async register(victimData: {
    name: string;
    mobile: string;
    email: string;
    password: string;
    aadhaar?: string;
    address: string;
    city?: string;
    state?: string;
  }): Promise<{ victim: any; token: string }> {
    const res = await fetch(`${API_BASE}/victim/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(victimData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    localStorage.setItem('mha_victim_token', data.token);
    return data;
  },

  async sendOtp(identifier: string): Promise<{ success: boolean; message: string; demoOtp?: string }> {
    const res = await fetch(`${API_BASE}/victim/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    return data;
  },

  async verifyOtpLogin(identifier: string, otp: string): Promise<{ victim: any; token: string }> {
    const res = await fetch(`${API_BASE}/victim/auth/verify-otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'OTP verification failed');
    localStorage.setItem('mha_victim_token', data.token);
    return data;
  },

  async forgotPassword(identifier: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/victim/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, otp, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password reset failed');
    return data;
  },

  async getMe(): Promise<any> {
    const res = await fetch(`${API_BASE}/victim/auth/me`, {
      headers: getVictimAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Session expired');
    return data.victim;
  },

  logout() {
    localStorage.removeItem('mha_victim_token');
  },

  getToken(): string | null {
    return localStorage.getItem('mha_victim_token');
  },

  // Dashboard
  async getDashboard(): Promise<{
    stats: any;
    recentComplaints: any[];
    notifications: any[];
  }> {
    const res = await fetch(`${API_BASE}/victim/dashboard`, {
      headers: getVictimAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch dashboard data');
    return data;
  },

  // Complaints
  async getComplaints(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/victim/complaints`, {
      headers: getVictimAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch complaints');
    return Array.isArray(data) ? data : [];
  },

  async getComplaint(id: string): Promise<{
    complaint: any;
    evidence: any[];
    recovery?: any;
    prediction?: any;
  }> {
    const res = await fetch(`${API_BASE}/victim/complaints/${id}`, {
      headers: getVictimAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch complaint dossier');
    return data;
  },

  async fileComplaint(formData: {
    fraudType: string;
    amountLost: number;
    bankName: string;
    accountNumber?: string;
    upiId?: string;
    transactionId?: string;
    transactionDate?: string;
    transactionTime?: string;
    complaintDescription: string;
    evidenceFiles?: Array<{
      fileName: string;
      fileType: 'image' | 'pdf' | 'audio' | 'document';
      fileSize: string;
      dataUrl?: string;
      description?: string;
    }>;
  }): Promise<{ success: boolean; complaint: any; prediction?: any }> {
    const res = await fetch(`${API_BASE}/victim/complaints`, {
      method: 'POST',
      headers: getVictimAuthHeaders(),
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to file complaint');
    return data;
  },

  // Evidence Center
  async getEvidence(complaintId?: string): Promise<any[]> {
    const url = complaintId ? `${API_BASE}/victim/evidence?complaintId=${encodeURIComponent(complaintId)}` : `${API_BASE}/victim/evidence`;
    const res = await fetch(url, {
      headers: getVictimAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch evidence');
    return Array.isArray(data) ? data : [];
  },

  async uploadEvidence(evidenceData: {
    complaintId: string;
    fileName: string;
    fileType: 'image' | 'pdf' | 'audio' | 'document';
    fileSize: string;
    dataUrl?: string;
    description: string;
  }): Promise<{ success: boolean; evidence: any }> {
    const res = await fetch(`${API_BASE}/victim/evidence`, {
      method: 'POST',
      headers: getVictimAuthHeaders(),
      body: JSON.stringify(evidenceData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload evidence');
    return data;
  },

  async deleteEvidence(evidenceId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/victim/evidence/${evidenceId}`, {
      method: 'DELETE',
      headers: getVictimAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete evidence');
  },

  // Recovery Status
  async getRecovery(complaintId?: string): Promise<any[]> {
    const url = complaintId ? `${API_BASE}/victim/recovery?complaintId=${encodeURIComponent(complaintId)}` : `${API_BASE}/victim/recovery`;
    const res = await fetch(url, {
      headers: getVictimAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch recovery status');
    return Array.isArray(data) ? data : [];
  },

  // Notifications
  async getNotifications(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/victim/notifications`, {
      headers: getVictimAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch notifications');
    return Array.isArray(data) ? data : [];
  },

  async markNotificationAsRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/victim/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getVictimAuthHeaders()
    });
  },

  async markAllNotificationsAsRead(): Promise<void> {
    await fetch(`${API_BASE}/victim/notifications/read-all`, {
      method: 'POST',
      headers: getVictimAuthHeaders()
    });
  },

  // AI Citizen Cyber Assistant
  async askAiAssistant(question: string, complaintId?: string): Promise<{
    advice: string;
    keySteps: string[];
    emergencyHelpline: string;
    timestamp: string;
  }> {
    const res = await fetch(`${API_BASE}/victim/ai-assistant`, {
      method: 'POST',
      headers: getVictimAuthHeaders(),
      body: JSON.stringify({ question, complaintId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get AI advisor response');
    return data;
  }
};

