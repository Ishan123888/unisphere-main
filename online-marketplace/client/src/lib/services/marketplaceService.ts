import apiClient from "@/lib/api/client";
import {
  ItemRequestDto,
  ItemResponseDto,
  SearchParams,
  ApiError,
} from "@/types";

const MARKETPLACE_ENDPOINT = "/marketplace";

/**
 * Marketplace API Service
 * Handles all marketplace-related API calls
 */
export const marketplaceService = {
  /**
   * Create a new item with image upload
   * @param itemData - Item details
   * @param image - Image file
   * @param sellerId - Seller UUID
   * @returns ItemResponseDto
   */
  async createItem(
    itemData: Omit<ItemRequestDto, "sellerId">,
    image: File | undefined,
    sellerId: string
  ): Promise<ItemResponseDto> {
    const formData = new FormData();

    // Note: Backend expects "items" as the part name
    const itemPayload: ItemRequestDto = {
      ...itemData,
      sellerId,
    };

    // Append as a Blob with proper Content-Type for the part
    const itemBlob = new Blob([JSON.stringify(itemPayload)], { type: 'application/json' });
    formData.append("items", itemBlob);

    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await apiClient.post<ItemResponseDto>(
        MARKETPLACE_ENDPOINT,
        formData
      );

      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  /**
   * Get all marketplace items
   * @returns Array of ItemResponseDto
   */
  async getAllItems(): Promise<ItemResponseDto[]> {
    try {
      const response = await apiClient.get<ItemResponseDto[]>(
        MARKETPLACE_ENDPOINT
      );
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  /**
   * Get item by ID
   * @param itemId - Item UUID
   * @returns ItemResponseDto
   */
  async getItemById(itemId: string): Promise<ItemResponseDto> {
    try {
      const response = await apiClient.get<ItemResponseDto>(
        `${MARKETPLACE_ENDPOINT}/${itemId}`
      );
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  /**
   * Get all items by a seller
   * @param sellerId - Seller UUID
   * @returns Array of ItemResponseDto
   */
  async getItemsBySellerId(sellerId: string): Promise<ItemResponseDto[]> {
    try {
      const response = await apiClient.get<ItemResponseDto[]>(
        `${MARKETPLACE_ENDPOINT}/seller/${sellerId}`
      );
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  /**
   * Update an item
   * @param itemId - Item UUID
   * @param itemData - Updated item data (including sellerId for authorization)
   * @returns ItemResponseDto
   */
  async updateItem(
    itemId: string,
    itemData: ItemRequestDto
  ): Promise<ItemResponseDto> {
    try {
      const response = await apiClient.put<ItemResponseDto>(
        `${MARKETPLACE_ENDPOINT}/${itemId}`,
        itemData
      );
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  /**
   * Delete an item
   * @param itemId - Item UUID
   * @param sellerId - Seller UUID (for authorization)
   * @returns void
   */
  async deleteItem(itemId: string, sellerId: string): Promise<void> {
    try {
      await apiClient.delete(`${MARKETPLACE_ENDPOINT}/${itemId}`, {
        params: { sellerId },
      });
    } catch (error) {
      throw error as ApiError;
    }
  },

  /**
   * Search items with filters
   * @param params - Search parameters
   * @returns Array of ItemResponseDto
   */
  async searchItems(params: SearchParams): Promise<ItemResponseDto[]> {
    try {
      const response = await apiClient.get<ItemResponseDto[]>(
        `${MARKETPLACE_ENDPOINT}/search`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },

  /**
   * Update item status
   * @param itemId - Item UUID
   * @param status - New status
   * @param sellerId - Seller UUID
   * @returns ItemResponseDto
   */
  async updateItemStatus(
    itemId: string,
    status: string,
    sellerId: string
  ): Promise<ItemResponseDto> {
    try {
      const response = await apiClient.patch<ItemResponseDto>(
        `${MARKETPLACE_ENDPOINT}/${itemId}/status`,
        {},
        {
          params: { status, sellerId },
        }
      );
      return response.data;
    } catch (error) {
      throw error as ApiError;
    }
  },
};
