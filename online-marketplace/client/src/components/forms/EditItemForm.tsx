"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemFormSchema, ItemFormSchema } from "@/lib/schemas/itemSchema";
import { marketplaceService } from "@/lib/services/marketplaceService";
import { ItemResponseDto, ApiError } from "@/types";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { FormField, FormSelect, FormTextArea } from "@/components/common/FormFields";
import { ImagePreview } from "@/components/common/ImagePreview";
import { Toast, ToastType } from "@/components/common/Toast";

interface EditItemFormProps {
  itemId: string;
  onSuccess?: () => void;
}

/**
 * Edit Item Form Component
 * Handles item updates
 */
export const EditItemForm: React.FC<EditItemFormProps> = ({
  itemId,
  onSuccess,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [item, setItem] = useState<ItemResponseDto | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ItemFormSchema>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      price: 0,
    },
  });

  /**
   * Load item data on mount
   */
  useEffect(() => {
    const loadItem = async () => {
      try {
        setIsLoading(true);
        const itemData = await marketplaceService.getItemById(itemId);
        setItem(itemData);
        
        // Set form values
        reset({
          title: itemData.title,
          description: itemData.description,
          category: itemData.itemCategory,
          price: itemData.price,
        });
      } catch (err) {
        setToast({
          type: "error",
          message: "Failed to load item. Please try again.",
        });
        console.error("Error loading item:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (itemId) {
      loadItem();
    }
  }, [itemId, reset]);

  /**
   * Handle image file selection
   */
  const handleImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        setImageFile(files[0]);
      }
    },
    []
  );

  /**
   * Clear selected image
   */
  const handleClearImage = useCallback(() => {
    setImageFile(null);
  }, []);

  /**
   * Handle form submission
   */
  const onSubmit: SubmitHandler<ItemFormSchema> = async (data) => {
    try {
      setIsSubmitting(true);

      if (!item?.sellerId) {
        throw new Error("Seller information is missing");
      }

      // Update item with sellerId included
      await marketplaceService.updateItem(itemId, {
        title: data.title,
        description: data.description,
        itemCategory: data.category,
        price: data.price,
        sellerId: item.sellerId,
      });

      setToast({
        type: "success",
        message: "Item updated successfully! Redirecting...",
      });

      // Redirect to seller dashboard after 2 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/seller-dashboard");
        }
      }, 2000);
    } catch (error) {
      const apiError = error as ApiError;
      setToast({
        type: "error",
        message: apiError.message || "Failed to update item. Please try again.",
      });
      console.error("Error updating item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">Item not found</p>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <FormField
            label="Title"
            placeholder="Item title"
            error={errors.title?.message}
            {...register("title")}
          />
        </div>

        {/* Description */}
        <div>
          <FormTextArea
            label="Description"
            placeholder="Item description"
            error={errors.description?.message}
            rows={4}
            {...register("description")}
          />
        </div>

        {/* Category and Price Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <FormSelect
              label="Category"
              error={errors.category?.message}
              options={[
                { value: "ELECTRONICS", label: "Electronics" },
                { value: "CLOTHING", label: "Clothing" },
                { value: "BOOKS", label: "Books" },
                { value: "HOME", label: "Home & Garden" },
                { value: "SPORTS", label: "Sports" },
                { value: "TOYS", label: "Toys" },
                { value: "MISC", label: "Miscellaneous" },
              ]}
              {...register("category")}
            />
          </div>

          {/* Price */}
          <div>
            <FormField
              label="Price ($)"
              type="number"
              placeholder="0.00"
              step="0.01"
              error={errors.price?.message}
              {...register("price", { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Current Image */}
        {item?.imageUrl && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Current Image
            </p>
            <img
              src={getImageUrl(item.imageUrl)}
              alt={item.title}
              className="w-full max-w-xs h-64 object-cover rounded"
            />
            <p className="text-xs text-gray-600 mt-2">
              Note: Image updates are not currently supported in the edit form.
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            size="lg"
          >
            {isSubmitting ? "Updating..." : "Update Item"}
          </Button>
          <Button
            type="button"
            onClick={() => router.push("/seller-dashboard")}
            disabled={isSubmitting}
            variant="secondary"
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
};
