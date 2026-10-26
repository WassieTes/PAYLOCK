export type VerificationStatus = string;

export interface Verification {
  id: string;
  orderId?: string | null;
  transactionReference?: string | null;
  customerName?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  status: VerificationStatus;
  createdAt: string;
  paymentMethod?: string | null;
  riskScore?: number | null;
}

export interface MerchantProfile {
  businessName?: string;
  email?: string;
}
