import { useState } from 'react';
import Image from 'next/image';
import toast from "react-hot-toast";

import { assets } from '@/assets/assets';
import { useAppContext } from "@/context/AppContext";

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);
    const { user } = useAppContext();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    userId: user.id,
                    rating,
                    comment: comment.trim(),
                }),
            });

            const data = await response.json();
            if (data.success) {
                setRating(0);
                setComment('');
                onReviewSubmitted();
                toast.success('Review submitted successfully!');
                location.reload();
            } else {
                toast.error(data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Write a Review</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating
                    </label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="p-1 transition-transform hover:scale-110"
                            >
                                <Image
                                    src={
                                        star <= (hoveredRating || rating)
                                            ? assets.star_icon
                                            : assets.star_dull_icon
                                    }
                                    alt="star"
                                    className="h-6 w-6"
                                />
                            </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                            {rating > 0 && `${rating} out of 5 stars`}
                        </span>
                    </div>
                </div>

                {/* Comment Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        maxLength={1000}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                        {comment.length}/1000 Characters
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="w-full py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
