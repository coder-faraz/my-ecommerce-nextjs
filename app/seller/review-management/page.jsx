'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from "@/context/AppContext";
import Image from 'next/image';
import toast from 'react-hot-toast';

const AdminReviewComponent = () => {
    const [reviews, setReviews] = useState([]);
    const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('pending');
    const [actionLoading, setActionLoading] = useState({});
    const [rejectionModal, setRejectionModal] = useState({ show: false, reviewId: null, reason: '' });

    const { user } = useAppContext();

    const fetchReviews = async (status = 'pending', page = 1) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/review/seller-list?status=${status}&page=${page}&limit=10`);

            if (data.success) {
                setReviews(data.reviews);
                setCounts(data.counts);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews(selectedStatus, currentPage);
    }, [selectedStatus, currentPage]);

    const handleApprove = async (reviewId) => {
        try {
            setActionLoading(prev => ({ ...prev, [reviewId]: 'approving' }));

            const { data } = await axios.put('/api/review/seller-list', {
                reviewId,
                action: 'approve',
                userId: user?.id
            });

            if (data.success) {
                fetchReviews(selectedStatus, currentPage);
                toast.success('Review approved successfully!');
            }
        } catch (error) {
            console.error('Error approving review:', error);
            toast.error('Failed to approve review');
        } finally {
            setActionLoading(prev => ({ ...prev, [reviewId]: null }));
        }
    };

    const handleReject = async () => {
        if (!rejectionModal.reason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            setActionLoading(prev => ({ ...prev, [rejectionModal.reviewId]: 'rejecting' }));

            const { data } = await axios.put('/api/review/seller-list', {
                reviewId: rejectionModal.reviewId,
                action: 'reject',
                userId: user?.id,
                rejectionReason: rejectionModal.reason
            });

            if (data.success) {
                setRejectionModal({ show: false, reviewId: null, reason: '' });
                fetchReviews(selectedStatus, currentPage);
                toast.success('Review rejected successfully!');
            }
        } catch (error) {
            console.error('Error rejecting review:', error);
            toast.error('Failed to reject review');
        } finally {
            setActionLoading(prev => ({ ...prev, [rejectionModal.reviewId]: null }));
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            setActionLoading(prev => ({ ...prev, [reviewId]: 'deleting' }));

            const { data } = await axios.delete(`/api/review/seller-list?reviewId=${reviewId}`);

            if (data.success) {
                fetchReviews(selectedStatus, currentPage);
                toast.success('Review deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        } finally {
            setActionLoading(prev => ({ ...prev, [reviewId]: null }));
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span key={index} className={`text-lg ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
            </span>
        ));
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
                {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Management</h1>
                <p className="text-gray-600">Manage and moderate customer reviews</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-yellow-600">Pending</p>
                            <p className="text-2xl font-bold text-yellow-900">{counts.pending}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-green-600">Approved</p>
                            <p className="text-2xl font-bold text-green-900">{counts.approved}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-red-600">Rejected</p>
                            <p className="text-2xl font-bold text-red-900">{counts.rejected}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">Total</p>
                            <p className="text-2xl font-bold text-blue-900">{counts.total}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {['pending', 'approved', 'rejected', 'all'].map((status) => (
                        <button
                            key={status}
                            onClick={() => {
                                setSelectedStatus(status);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedStatus === status
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            {status !== 'all' && (
                                <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                                    {counts[status]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No reviews found</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="bg-white border rounded-lg p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-3">
                                        {review.productImage && (
                                            <Image
                                                src={review.productImage[0]}
                                                alt={review.productName}
                                                className="w-12 h-12 object-cover rounded-lg"
                                                width={48}
                                                height={48}
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-medium text-gray-900">{review.productName}</h3>
                                            <p className="text-sm text-gray-600">
                                                by {review.userName} ({review.userEmail})
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex">{renderStars(review.rating)}</div>
                                        <span className="text-sm text-gray-600">({review.rating}/5)</span>
                                        {getStatusBadge(review.status)}
                                    </div>

                                    {review.comment && (
                                        <p className="text-gray-700 mb-3">{review.comment}</p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>Submitted: {formatDate(review.createdAt)}</span>
                                        {!review.rejectionReason && review.approvedAt && (
                                            <span>Approved: {formatDate(review.approvedAt)}</span>
                                        )}
                                        {review.rejectionReason && (
                                            <span>Rejected: {formatDate(review.approvedAt)}</span>
                                        )}
                                        {review.approverName && (
                                            <span>by {review.approverName}</span>
                                        )}
                                    </div>

                                    {review.rejectionReason && (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-800">
                                                <strong>Rejection Reason:</strong> {review.rejectionReason}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 ml-4">
                                    {review.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(review._id)}
                                                disabled={actionLoading[review._id]}
                                                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                                            >
                                                {actionLoading[review._id] === 'approving' ? 'Approving...' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => setRejectionModal({ show: true, reviewId: review._id, reason: '' })}
                                                disabled={actionLoading[review._id]}
                                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        disabled={actionLoading[review._id]}
                                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 disabled:opacity-50"
                                    >
                                        {actionLoading[review._id] === 'deleting' ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={!pagination.hasPrevPage}
                        className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <span className="px-4 py-2">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                        disabled={!pagination.hasNextPage}
                        className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Rejection Modal */}
            {rejectionModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium mb-4">Reject Review</h3>
                        <textarea
                            value={rejectionModal.reason}
                            onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Please provide a reason for rejection..."
                            className="w-full p-3 border rounded-lg resize-none"
                            rows={4}
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setRejectionModal({ show: false, reviewId: null, reason: '' })}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading[rejectionModal.reviewId]}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                            >
                                {actionLoading[rejectionModal.reviewId] === 'rejecting' ? 'Rejecting...' : 'Reject Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReviewComponent;
