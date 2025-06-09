'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from '@/context/AppContext';
import toast from 'react-hot-toast';

const CouponManagement = () => {
    const { user } = useAppContext();
    const [coupons, setCoupons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        maxDiscountAmount: '',
        usageLimit: '',
        userUsageLimit: '',
        startDate: '',
        expiryDate: '',
        minOrderAmount: '',
        maxOrderAmount: '',
        applicableProducts: [],
        applicableCategories: [],
        excludedProducts: [],
        excludedCategories: [],
        newUsersOnly: false,
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCoupons();
        fetchCategories();
        fetchProducts();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/coupon');
            const data = await response.json();
            if (response.ok) setCoupons(data.coupons);
            else setError(data.message || 'Error fetching coupons');
        } catch (error) {
            console.error('Error fetching coupons:', error);
            setError('Error fetching coupons');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('/api/category/list');
            if (data.success) {
                setCategories(data.categories);
            }
            else setError(data.message || 'Error fetching categories');
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Error fetching categories');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/product/list');
            const data = await response.json();
            if (response.ok) {
                setProducts(data.allProducts);
            }
            else setError(data.message || 'Error fetching products');
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Error fetching products');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMultiSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: prev[name].includes(value)
                ? prev[name].filter(item => item !== value)
                : [...prev[name], value]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const url = editingCoupon ? `/api/coupon/${editingCoupon._id}` : '/api/coupon';
            const method = editingCoupon ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                fetchCoupons();
                resetForm();
                toast.success(editingCoupon ? 'Coupon updated successfully!' : 'Coupon created successfully!');
            } else {
                setError(data.message || 'Error saving coupon');
            }
        } catch (error) {
            console.error('Error saving coupon:', error);
            setError('Error saving coupon');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            ...coupon,
            startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
            expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
        });
        setShowForm(true);
    };

    const handleDelete = async (couponId) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            setLoading(true);
            try {
                const response = await fetch(`/api/coupon/${couponId}`, { method: 'DELETE' });
                const data = await response.json();
                if (response.ok) {
                    fetchCoupons();
                    toast.success(data.message || 'Coupon deleted successfully!');
                } else {
                    setError(data.message || 'Error deleting coupon');
                }
            } catch (error) {
                console.error('Error deleting coupon:', error);
                setError('Error deleting coupon');
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            description: '',
            discountType: 'percentage',
            discountValue: '',
            maxDiscountAmount: '',
            usageLimit: '',
            userUsageLimit: '',
            startDate: '',
            expiryDate: '',
            minOrderAmount: '',
            maxOrderAmount: '',
            applicableProducts: [],
            applicableCategories: [],
            excludedProducts: [],
            excludedCategories: [],
            newUsersOnly: false,
            isActive: true
        });
        setEditingCoupon(null);
        setShowForm(false);
        setError('');
    };

    const generateCouponCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'DISC';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, code: result }));
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Coupon Management</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    disabled={loading}
                >
                    Create New Coupon
                </button>
            </div>

            {error && <div className="text-red-600 mb-4">{error}</div>}
            {loading && <div className="text-gray-600 mb-4">Loading...</div>}

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                            </h2>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Coupon Code</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleInputChange}
                                            className="flex-1 mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="Enter coupon code"
                                            required
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={generateCouponCode}
                                            className="mt-1 bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700"
                                            disabled={loading}
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Coupon Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="Display name for admin"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="What is this coupon for?"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Discount Type</label>
                                    <select
                                        name="discountType"
                                        value={formData.discountType}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        disabled={loading}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Discount Value {formData.discountType === 'percentage' ? '(%)' : '($)'}
                                    </label>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder={formData.discountType === 'percentage' ? '20' : '50'}
                                        min="0"
                                        step={formData.discountType === 'percentage' ? '0.01' : '0.01'}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                {formData.discountType === 'percentage' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Max Discount Amount ($)</label>
                                        <input
                                            type="number"
                                            name="maxDiscountAmount"
                                            value={formData.maxDiscountAmount}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="Maximum discount cap"
                                            min="0"
                                            step="0.01"
                                            disabled={loading}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Usage Limit</label>
                                    <input
                                        type="number"
                                        name="usageLimit"
                                        value={formData.usageLimit}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="Leave empty for unlimited"
                                        min="1"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Usage Limit Per User</label>
                                    <input
                                        type="number"
                                        name="userUsageLimit"
                                        value={formData.userUsageLimit}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="Leave empty for unlimited"
                                        min="1"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Minimum Order Amount ($)</label>
                                    <input
                                        type="number"
                                        name="minOrderAmount"
                                        value={formData.minOrderAmount}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="Minimum cart value"
                                        min="0"
                                        step="0.01"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Maximum Order Amount ($)</label>
                                    <input
                                        type="number"
                                        name="maxOrderAmount"
                                        value={formData.maxOrderAmount}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="Maximum cart value (optional)"
                                        min="0"
                                        step="0.01"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Categories</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                    {categories.map(category => (
                                        <label key={category._id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.applicableCategories.includes(category.name)}
                                                onChange={() => handleMultiSelectChange('applicableCategories', category.name)}
                                                className="rounded"
                                                disabled={loading}
                                            />
                                            <span className="text-sm">{category.name}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Leave empty to apply to all categories</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Products</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                    {products.map(product => (
                                        <label key={product._id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.applicableProducts.includes(product._id)}
                                                onChange={() => handleMultiSelectChange('applicableProducts', product._id)}
                                                className="rounded"
                                                disabled={loading}
                                            />
                                            <span className="text-sm">{product.name}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Leave empty to apply to all products</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Excluded Categories</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                    {categories.map(category => (
                                        <label key={category._id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.excludedCategories.includes(category.name)}
                                                onChange={() => handleMultiSelectChange('excludedCategories', category.name)}
                                                className="rounded"
                                                disabled={loading}
                                            />
                                            <span className="text-sm">{category.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Excluded Products</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                    {products.map(product => (
                                        <label key={product._id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.excludedProducts.includes(product._id)}
                                                onChange={() => handleMultiSelectChange('excludedProducts', product._id)}
                                                className="rounded"
                                                disabled={loading}
                                            />
                                            <span className="text-sm">{product.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="newUsersOnly"
                                        checked={formData.newUsersOnly}
                                        onChange={handleInputChange}
                                        className="rounded"
                                        disabled={loading}
                                    />
                                    <span className="text-sm">New Users Only</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="rounded"
                                        disabled={loading}
                                    />
                                    <span className="text-sm">Active</span>
                                </label>
                            </div>
                            <div className="flex gap-4 pt-4 border-t">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : (editingCoupon ? 'Update Coupon' : 'Create Coupon')}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {coupons.map((coupon) => (
                                <tr key={coupon._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{coupon.name}</div>
                                        <div className="text-sm text-gray-500">{coupon.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                        </div>
                                        {coupon.maxDiscountAmount && (
                                            <div className="text-sm text-gray-500">Max: ${coupon.maxDiscountAmount}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {coupon.usageCount || 0} / {coupon.usageLimit || '∞'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${coupon.isActive && new Date(coupon.expiryDate) > new Date()
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {coupon.isActive && new Date(coupon.expiryDate) > new Date() ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(coupon)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                            disabled={loading}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon._id)}
                                            className="text-red-600 hover:text-red-900"
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CouponManagement;
