import React from "react";
import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
}

export default function StarRating({ rating, size = 16 }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-x-0.5 text-primary">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} size={size} className="fill-primary text-primary" />
      ))}
      {hasHalfStar && <StarHalf size={size} className="fill-primary text-primary" />}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-divider" />
      ))}
    </div>
  );
}
