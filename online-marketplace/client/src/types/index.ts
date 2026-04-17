/**
 * Marketplace Types and Interfaces
 */

export enum ItemCategory {
  BOOKS = "BOOKS",
  ELECTRONICS = "ELECTRONICS",
  LAB_EQUIPMENT = "LAB_EQUIPMENT",
  FURNITURE = "FURNITURE",
  APPAREL = "APPAREL",
  SERVICES = "SERVICES",
  MISC = "MISC",
  OTHERS = "OTHERS",
}

export enum ItemStatus {
  AVAILABLE = "AVAILABLE",
  LOCKED = "LOCKED",
  SOLD = "SOLD",
}

export interface ItemRequestDto {
  sellerId: string; // UUID
  itemCategory: ItemCategory;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface ItemResponseDto {
  itemId: string; // UUID
  itemCategory: ItemCategory;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  status: ItemStatus;
  sellerId: string; // UUID
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
}

export interface CreateItemFormData {
  title: string;
  description: string;
  category: ItemCategory;
  price: number;
  image?: File;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SearchParams {
  status?: ItemStatus;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
}
