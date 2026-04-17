"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemFormSchema, ItemFormSchema } from "@/lib/schemas/itemSchema";
import { marketplaceService } from "@/lib/services/marketplaceService";
import { ItemCategory, ApiError } from "@/types";
import { getSellerId, formatCategory } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { FormField, FormSelect, FormTextArea } from "@/components/common/FormFields";
import { ImagePreview } from "@/components/common/ImagePreview";
import { Toast, ToastType } from "@/components/common/Toast";

/**
 * Create Item Form Component
 * Handles item creation with image upload
 */
export const CreateItemForm: React.FC = () => {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ItemFormSchema>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: ItemCategory.MISC,
      price: 0,
    },
  });

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

      const sellerId = getSellerId();
      if (!sellerId) {
        throw new Error("Unable to identify seller. Please refresh and try again.");
      }

      // Create item via API
      const response = await marketplaceService.createItem(
        {
          title: data.title,
          description: data.description,
          itemCategory: data.category,
          price: data.price,
        },
        imageFile || undefined,
        sellerId
      );

      setToast({
        type: "success",
        message: "Item created successfully! Redirecting...",
      });

      // Reset form
      reset();
      handleClearImage();

      // Redirect to marketplace after 2 seconds
      setTimeout(() => {
        router.push("/marketplace");
      }, 2000);
    } catch (error) {
      const apiError = error as ApiError;
      setToast({
        type: "error",
        message:
          apiError.message || "Failed to create item. Please try again.",
      });
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = Object.values(ItemCategory).map((cat) => ({
    value: cat,
    label: formatCategory(cat),
  }));

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Field */}
        <FormField
          label="Item Title"
          placeholder="Enter item title"
          required
          {...register("title")}
          error={errors.title?.message}
          helperText="A clear, descriptive title helps buyers find your item"
        />

        {/* Category Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-600">*</span>
          </label>
          <select
            {...register("category")}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer text-gray-900 ${
              errors.category ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Description Field */}
        <FormTextArea
          label="Description"
          placeholder="Describe your item in detail (minimum 20 characters)"
          required
          rows={5}
          {...register("description")}
          error={errors.description?.message}
          helperText="Provide detailed information about the condition, features, and specifications"
        />

        {/* Price Field */}
        <FormField
          label="Price (USD)"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          required
          {...register("price", { valueAsNumber: true })}
          error={errors.price?.message}
          helperText="Set a competitive price for your item"
        />

        {/* Image Upload Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Product Image <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <div className="mb-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
            />
          </div>
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Accepted formats: JPEG, PNG, WebP, GIF (Max 5MB)
          </p>
          <div className="mt-3">
            <ImagePreview file={imageFile} onClear={handleClearImage} />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            size="lg"
            className="flex-1"
          >
            {isSubmitting ? "Creating Item..." : "Create Item"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => {
              reset();
              handleClearImage();
            }}
            disabled={isSubmitting}
          >
            Clear Form
          </Button>
        </div>
      </form>
    </>
  );
};
