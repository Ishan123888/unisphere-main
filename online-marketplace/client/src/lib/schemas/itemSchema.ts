import { z } from "zod";
import { ItemCategory } from "@/types";

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Zod schema for item creation
export const itemFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must not exceed 1000 characters"),

  category: z.enum([
    ItemCategory.BOOKS,
    ItemCategory.ELECTRONICS,
    ItemCategory.LAB_EQUIPMENT,
    ItemCategory.FURNITURE,
    ItemCategory.APPAREL,
    ItemCategory.SERVICES,
    ItemCategory.MISC,
    ItemCategory.OTHERS,
  ]),

  price: z
    .number()
    .positive("Price must be greater than 0")
    .max(999999, "Price is too high"),

  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "File size must be less than 5MB"
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only JPEG, PNG, WebP, and GIF images are accepted"
    ),
});

export type ItemFormSchema = z.infer<typeof itemFormSchema>;

/**
 * Client-side validation utilities
 */
export const validateItemForm = async (data: unknown) => {
  try {
    return itemFormSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join(".");
        fieldErrors[path] = err.message;
      });
      return { errors: fieldErrors };
    }
    throw error;
  }
};
