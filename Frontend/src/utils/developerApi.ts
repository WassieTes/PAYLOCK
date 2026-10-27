const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1').replace(/\/+$/, '');

function getAuthHeader(): Record<string, string> {
  const token =
    localStorage.getItem('paylock_access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface ApiLogItem {
  id: string;
  method: string;
  endpoint: string;
  statusCode: number;
  outcome: string | null;
  orderId: string | null;
  latencyMs: number;
  createdAt: string;
}

export interface VerificationTestResult {
  id: string;
  orderId: string;
  status: string;
  canReleaseOrder: boolean;
  transactionId: string | null;
  settledAmount: number | null;
  extractedAmount: number | null;
  provider: string | null;
  reason: string | null;
  createdAt: string;
}

export const developerApi = {
  // Fetch merchant's active API keys
  async getKeys(): Promise<ApiKeyItem[]> {
    try {
      const res = await fetch(`${BASE_URL}/dashboard/keys`, {
        credentials: 'omit',
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed to fetch keys');
      return await res.json();
    } catch {
      // Fallback for demo when backend is offline
      return [
        {
          id: 'mock-key-1',
          name: 'Main E-Commerce Integration',
          keyPrefix: 'pl_live_4a8f9b...',
          isActive: true,
          lastUsedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        },
      ];
    }
  },

  // Create a new API key
  async createKey(name: string): Promise<{ id: string; name: string; keyPrefix: string; rawKey: string }> {
    try {
      const res = await fetch(`${BASE_URL}/dashboard/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to create key');
      return await res.json();
    } catch {
      const randomSecret = Array.from(crypto.getRandomValues(new Uint8Array(18)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const rawKey = `pl_live_${randomSecret}`;
      return {
        id: `mock-${Date.now()}`,
        name: name || 'Demo Store Key',
        keyPrefix: `${rawKey.substring(0, 14)}...`,
        rawKey,
      };
    }
  },

  // Revoke an existing API key
  async revokeKey(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/dashboard/keys/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      return res.ok;
    } catch {
      return true;
    }
  },

  // Fetch API audit logs
  async getLogs(): Promise<ApiLogItem[]> {
    try {
      const res = await fetch(`${BASE_URL}/dashboard/logs`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed to fetch logs');
      return await res.json();
    } catch {
      return [
        {
          id: 'log-1',
          method: 'POST',
          endpoint: '/api/v1/verify',
          statusCode: 200,
          outcome: 'VERIFIED',
          orderId: 'ORD-8941',
          latencyMs: 342,
          createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        },
        {
          id: 'log-2',
          method: 'POST',
          endpoint: '/api/v1/verify',
          statusCode: 200,
          outcome: 'DUPLICATE_CLAIM',
          orderId: 'ORD-8940',
          latencyMs: 120,
          createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
        },
        {
          id: 'log-3',
          method: 'POST',
          endpoint: '/api/v1/verify',
          statusCode: 401,
          outcome: 'UNAUTHORIZED',
          orderId: null,
          latencyMs: 35,
          createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        },
      ];
    }
  },

  // Exercise the same authenticated verification service as the receipt form.
  async testVerify(payload: {
    orderId: string;
    expectedAmount: number;
    expectedReceiver: string;
    reference: string;
    receiptUrl?: string;
  }): Promise<VerificationTestResult> {
    const formData = new FormData();
    formData.append('orderId', payload.orderId);
    formData.append('expectedAmount', String(payload.expectedAmount));
    formData.append('expectedReceiver', payload.expectedReceiver);
    if (payload.reference) formData.append('reference', payload.reference);
    if (payload.receiptUrl) formData.append('receiptUrl', payload.receiptUrl);

    const res = await fetch(`${BASE_URL}/verifications/manual`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    const result: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        typeof result === 'object' &&
        result !== null &&
        'message' in result &&
        typeof result.message === 'string'
          ? result.message
          : `Verification request failed (HTTP ${res.status}).`;
      throw new Error(message);
    }
    if (
      typeof result !== 'object' ||
      result === null ||
      !('status' in result) ||
      typeof result.status !== 'string' ||
      !('canReleaseOrder' in result) ||
      typeof result.canReleaseOrder !== 'boolean' ||
      !('id' in result) ||
      typeof result.id !== 'string' ||
      !('orderId' in result) ||
      typeof result.orderId !== 'string' ||
      !('transactionId' in result) ||
      !(typeof result.transactionId === 'string' || result.transactionId === null) ||
      !('settledAmount' in result) ||
      !(typeof result.settledAmount === 'number' || result.settledAmount === null) ||
      !('extractedAmount' in result) ||
      !(typeof result.extractedAmount === 'number' || result.extractedAmount === null) ||
      !('provider' in result) ||
      !(typeof result.provider === 'string' || result.provider === null) ||
      !('reason' in result) ||
      !(typeof result.reason === 'string' || result.reason === null) ||
      !('createdAt' in result) ||
      typeof result.createdAt !== 'string'
    ) {
      throw new Error('The verification service returned an unexpected response.');
    }
    return result as VerificationTestResult;
  },
};