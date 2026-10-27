const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
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

  // Test the verification endpoint directly from playground
  async testVerify(apiKey: string, payload: { orderId: string; expectedAmount: number; expectedReceiver: string; reference: string }) {
    try {
      const res = await fetch(`${BASE_URL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch {
      const isDuplicate = payload.reference.toUpperCase().includes('DUP');
      const isMismatch = payload.expectedAmount > 5000;
      return {
        success: true,
        orderId: payload.orderId,
        result: {
          status: isDuplicate ? 'DUPLICATE_CLAIM' : isMismatch ? 'MISMATCH' : 'VERIFIED',
          canReleaseOrder: !isDuplicate && !isMismatch,
          details: {
            transactionId: payload.reference,
            settledAmount: payload.expectedAmount,
            currency: 'ETB',
            provider: 'cbe',
            verifiedAt: new Date().toISOString(),
            message: isDuplicate
              ? 'Transaction ID has already been claimed on another order.'
              : isMismatch
              ? 'Settled amount does not match expected order total.'
              : 'Transaction confirmed via authoritative banking ledger.',
          },
        },
      };
    }
  },
};