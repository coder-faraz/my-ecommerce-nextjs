'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';

import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import { Utility } from '@/lib';

const ProductEditModal = ({ isOpen, onClose, productId, onProductUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: '',
        categoryId: '',
        color: '',
        description: '',
        price: '',
        discountPercent: '',
        discountedPrice: '',
        quantity: '',
        images: [],
        rating: '',
        reviewCount: '',
        salesCount: '',
        isFeatured: false,
        isActive: true,
        isTrending: false,
        isNewArrival: false
    });

    const { getToken } = useAppContext();
    const { capitalizeFirstLetter } = Utility();

    // Fetch product details
    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get(`/api/product/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                const product = data.product;
                setFormData({
                    name: product.name || '',
                    brand: product.brand || '',
                    category: product.category || '',
                    categoryId: product.categoryId?._id || '',
                    color: product.color || '',
                    description: product.description || '',
                    price: product.price || '',
                    discountPercent: product.discountPercent || '',
                    discountedPrice: product.discountedPrice || '',
                    quantity: product.quantity || '',
                    images: product.images || [],
                    rating: product.rating || '',
                    reviewCount: product.reviewCount || '',
                    salesCount: product.salesCount || '',
                    isFeatured: product.isFeatured || false,
                    isActive: product.isActive !== undefined ? product.isActive : true,
                    isTrending: product.isTrending || false,
                    isNewArrival: product.isNewArrival || false
                });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch product details');
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/category/list', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                console.log(data, 'categorie')
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        if (isOpen && productId) {
            fetchProductDetails();
            fetchCategories();
        }
    }, [isOpen, productId]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Auto-calculate discounted price when price or discount percent changes
        if (name === 'price' || name === 'discountPercent') {
            const price = name === 'price' ? parseFloat(value) || 0 : parseFloat(formData.price) || 0;
            const discountPercent = name === 'discountPercent' ? parseFloat(value) || 0 : parseFloat(formData.discountPercent) || 0;

            if (price > 0 && discountPercent > 0) {
                const discountedPrice = price - (price * discountPercent / 100);
                setFormData(prev => ({
                    ...prev,
                    discountedPrice: discountedPrice.toFixed(2)
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    discountedPrice: '0'
                }));
            }
        }
    };

    // Handle category selection
    const handleCategoryChange = (e) => {
        const selectedCategoryId = e.target.value;
        const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);

        setFormData(prev => ({
            ...prev,
            categoryId: selectedCategoryId,
            category: selectedCategory ? selectedCategory.name : ''
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name.trim()) {
            toast.error('Product name is required');
            return;
        }

        if (!formData.brand.trim()) {
            toast.error('Brand is required');
            return;
        }

        if (!formData.categoryId) {
            toast.error('Category is required');
            return;
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            toast.error('Valid price is required');
            return;
        }

        try {
            setSaving(true);
            const token = await getToken();

            // Prepare update data
            const updateData = {
                name: formData.name.trim(),
                brand: formData.brand.trim(),
                category: formData.category,
                categoryId: formData.categoryId,
                color: formData.color.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                discountPercent: parseFloat(formData.discountPercent) || 0,
                discountedPrice: parseFloat(formData.discountedPrice) || 0,
                quantity: parseInt(formData.quantity) || 0,
                images: formData.images,
                rating: parseFloat(formData.rating) || 0,
                reviewCount: parseInt(formData.reviewCount) || 0,
                salesCount: parseInt(formData.salesCount) || 0,
                isFeatured: formData.isFeatured,
                isActive: formData.isActive,
                isTrending: formData.isTrending,
                isNewArrival: formData.isNewArrival
            };

            const { data } = await axios.put(`/api/product/${productId}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success('Product updated successfully!');
                onProductUpdate(); // Refresh the product list
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update product');
            console.error('Error updating product:', error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Edit Product</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                            disabled={saving}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Brand *
                                    </label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleCategoryChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>
                                                {capitalizeFirstLetter(category.name)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Color
                                    </label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>

                            {/* Pricing & Inventory */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Pricing & Inventory</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discount Percent (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="discountPercent"
                                        value={formData.discountPercent}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Discounted Price
                                    </label>
                                    <input
                                        type="number"
                                        name="discountedPrice"
                                        value={formData.discountedPrice}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rating
                                        </label>
                                        <input
                                            type="number"
                                            name="rating"
                                            value={formData.rating}
                                            onChange={handleInputChange}
                                            step="0.1"
                                            min="0"
                                            max="5"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Review Count
                                        </label>
                                        <input
                                            type="number"
                                            name="reviewCount"
                                            value={formData.reviewCount}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sales Count
                                    </label>
                                    <input
                                        type="number"
                                        name="salesCount"
                                        value={formData.salesCount}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Status Flags */}
                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Status</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-sm text-gray-700">Active</label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-sm text-gray-700">Featured</label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isTrending"
                                        checked={formData.isTrending}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-sm text-gray-700">Trending</label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="isNewArrival"
                                        checked={formData.isNewArrival}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-sm text-gray-700">New Arrival</label>
                                </div>
                            </div>
                        </div>

                        {/* Product Images Preview */}
                        {formData.images.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
                                <div className="flex flex-wrap gap-4">
                                    {formData.images.map((image, index) => (
                                        <div key={index} className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                            <Image
                                                src={image}
                                                alt={`Product image ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                width={80}
                                                height={80}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-8 flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                )}
                                {saving ? 'Updating...' : 'Update Product'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProductEditModal;
