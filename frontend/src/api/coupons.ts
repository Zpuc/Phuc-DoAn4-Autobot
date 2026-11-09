import { apiClient } from './client';

export interface CouponItem {
  id: string;
  code: string;
  description?: string;
  type: 'PERCENT' | 'FIXED_AMOUNT';
  value: number;
  minOrder: number;
  maxDiscount?: number | null;
  usageLimit: number;
  usedCount: number;
  validUntil?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCouponPayload {
  code: string;
  description?: string;
  type: 'PERCENT' | 'FIXED_AMOUNT';
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  usageLimit?: number;
  validUntil?: string | null;
}

export const couponApi = {
  getAllAdmin: (): Promise<CouponItem[]> => apiClient.get('/coupons/admin'),
  getAllActive: (): Promise<CouponItem[]> => apiClient.get('/coupons'),
  create: (payload: CreateCouponPayload): Promise<CouponItem> => apiClient.post('/coupons', payload),
  toggle: (id: string): Promise<CouponItem> => apiClient.patch(`/coupons/${id}/toggle`),
  delete: (id: string): Promise<void> => apiClient.delete(`/coupons/${id}`),
};
