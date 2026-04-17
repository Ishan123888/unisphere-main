/**
 * Loading Skeleton Component
 * Reusable skeleton loaders for better UX during loading states
 */

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "w-full",
  height = "h-4",
  className = "",
  animated = true,
}) => {
  return (
    <div
      className={`bg-gray-200 rounded ${width} ${height} ${
        animated ? "animate-pulse" : ""
      } ${className}`}
    />
  );
};

export const ItemCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-4">
        <Skeleton className="w-24 h-4 mb-3" />
        <Skeleton className="w-full h-6 mb-2" />
        <Skeleton className="w-full h-4 mb-3" />
        <Skeleton className="w-32 h-6 mb-2" />
        <Skeleton className="w-full h-10 mt-4" />
      </div>
    </div>
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="w-full h-10 mb-4" />
      <Skeleton className="w-full h-10 mb-4" />
      <Skeleton className="w-full h-32 mb-4" />
      <Skeleton className="w-full h-10 mb-4" />
      <Skeleton className="w-full h-48 mb-4" />
      <div className="flex gap-3">
        <Skeleton className="flex-1 h-12" />
        <Skeleton className="flex-1 h-12" />
      </div>
    </div>
  );
};
