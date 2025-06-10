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
    const [showSuccess, setShowSuccess] = useState(false);
    const { user } = useAppContext();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user?.id) {
            toast.error('Please login to submit a review');
            return;
        }

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

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
                setShowSuccess(true);
                toast.success('Review submitted successfully! It will appear after admin approval.');

                // Hide success message after 5 seconds
                setTimeout(() => setShowSuccess(false), 5000);

                if (onReviewSubmitted) {
                    onReviewSubmitted();
                }
            } else {
                toast.error(data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRatingText = (rating) => {
        const ratingData = {
            1: { text: 'Poor', emoji: '😞' },
            2: { text: 'Fair', emoji: '😐' },
            3: { text: 'Good', emoji: '🙂' },
            4: { text: 'Very Good', emoji: '😊' },
            5: { text: 'Excellent', emoji: '🤩' },
        };

        if (!ratingData[rating]) return '';
        const { emoji, text } = ratingData[rating];
        return `${emoji}  ${text}`;
    };

    if (!user) {
        return (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-xl border border-orange-200 text-center shadow-sm">
                <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Share Your Experience</h3>
                <p className="text-gray-600 mb-6 text-lg">Help others make informed decisions by writing a review</p>
                <button
                    onClick={() => window.location.href = '/login'}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login to Write Review
                </button>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-xl border border-green-200 text-center shadow-sm">
                <div className="mb-4">
                    <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                <p className="text-gray-600 mb-4 text-lg">Your review has been submitted successfully</p>
                <div className="bg-white p-4 rounded-lg border border-green-200 mb-4">
                    <p className="text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Pending Approval
                        </span>
                        <br />
                        Your review will be visible once approved by our admin team
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Write a Review</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating Section */}
                <div className="bg-gray-50 p-6 rounded-xl">
                    <label className="block text-lg font-semibold text-gray-800 mb-4">
                        How would you rate this product? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="p-2 transition-all duration-200 hover:scale-125 focus:outline-none focus:scale-125"
                                >
                                    <Image
                                        src={
                                            star <= (hoveredRating || rating)
                                                ? assets.star_icon
                                                : assets.star_dull_icon
                                        }
                                        alt="star"
                                        className="h-8 w-8 sm:h-10 sm:w-10"
                                        width={40}
                                        height={40}
                                    />
                                </button>
                            ))}
                        </div>
                        {(hoveredRating || rating) > 0 && (
                            <div className="text-center">
                                <p className="text-lg font-medium text-gray-800">
                                    {getRatingText(hoveredRating || rating)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {hoveredRating || rating} out of 5 stars
                                </p>
                            </div>
                        )}
                        {rating === 0 && (
                            <p className="text-sm text-red-500 text-center">Please select a rating to continue</p>
                        )}
                    </div>
                </div>

                {/* Comment Section */}
                <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                        Tell us about your experience
                    </label>
                    <div className="relative">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What did you like or dislike about this product? How did it meet your expectations? Would you recommend it to others?"
                            rows={5}
                            maxLength={1000}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-700 placeholder-gray-400 transition-all duration-200"
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                            {comment.length}/1000
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        <span className="inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Your review helps other customers make informed decisions
                        </span>
                    </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting || rating === 0}
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting Review...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Submit Review
                            </>
                        )}
                    </button>
                </div>

                {/* Admin Approval Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="font-medium text-blue-800 mb-1">Review Process</h4>
                            <p className="text-sm text-blue-700">
                                Your review will be carefully reviewed by our team before being published.
                                This helps maintain quality and authenticity of reviews on our platform.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
