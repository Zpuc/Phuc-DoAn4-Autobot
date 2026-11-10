import { apiClient } from './client';

export interface ReviewItem {
  id: string;
  productId: string;
  userId?: string | null;
  userName: string;
  userEmail?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  imageUrl?: string | null;
  gradeTag?: string | null;
  likes: number;
  likedUserIds?: string[];
  createdAt: string;
  user?: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export interface ReviewStats {
  total: number;
  average: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ProductReviewsResponse {
  productId: string;
  stats: ReviewStats;
  reviews: ReviewItem[];
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  userName: string;
  userEmail?: string;
  title?: string;
  comment: string;
  imageUrl?: string;
  gradeTag?: string;
}

export const reviewApi = {
  getByProduct: (productId: string): Promise<ProductReviewsResponse> =>
    apiClient.get(`/reviews/product/${productId}`),
  getMyReviewedProducts: (): Promise<{ productIds: string[] }> =>
    apiClient.get('/reviews/my-reviewed-products'),
  create: (payload: CreateReviewPayload): Promise<ReviewItem> =>
    apiClient.post('/reviews', payload),
  like: (id: string): Promise<ReviewItem> =>
    apiClient.post(`/reviews/${id}/like`),
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/reviews/${id}`),
};

