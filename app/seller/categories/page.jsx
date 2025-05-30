'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Utility } from '@/lib';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [selectedParent, setSelectedParent] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter();
    const { capitalizeFirstLetter } = Utility();

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('/api/category');
                if (!data.success) {
                    if (data.message === 'Not Authorized') {
                        router.push('/login');
                    }
                    setError(data.message);
                    return;
                }
                setCategories(data.categories);
            } catch (err) {
                setError('Failed to fetch categories');
            }
        };
        fetchCategories();
    }, [router]);

    // Handle creating a new category
    const handleCreateCategory = async () => {
        if (!newCategory) {
            setError('Category name is required');
            return;
        }

        try {
            const { data } = await axios.post('/api/category', {
                name: newCategory,
                parent: selectedParent || null,
            });

            if (!data.success) {
                setError(data.message);
                if (data.message === 'Not Authorized') {
                    router.push('/login');
                }
                return;
            }

            setCategories([...categories, data.category]);
            setNewCategory('');
            setSelectedParent('');
            setError(null);
        } catch (err) {
            setError('Failed to create category');
        }
    };

    // Reset form
    const resetForm = () => {
        setNewCategory('');
        setSelectedParent('');
        setError(null);
    };

    const hasChanges = () => {
        return newCategory.trim() || selectedParent;
    };

    const isFormValid = () => {
        return newCategory.trim();
    };

    // Placeholder for Edit and Delete
    const handleEdit = (id) => {
        alert(`Edit category with ID: ${id}`);
    };

    const handleDelete = (id) => {
        alert(`Delete category with ID: ${id}`);
    };

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between">
            <div className="md:p-10 p-4 space-y-5 max-w-lg">
                <h1 className="text-2xl font-medium mb-4">Categories</h1>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                {/* Create New Category Form */}
                <div className="space-y-5">
                    <div className="flex flex-col gap-1 max-w-md">
                        <label className="text-base font-medium" htmlFor="category-name">
                            Category Name
                        </label>
                        <input
                            id="category-name"
                            type="text"
                            placeholder="Category name"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1 max-w-md">
                        <label className="text-base font-medium" htmlFor="parent-category">
                            Parent Category
                        </label>
                        <select
                            id="parent-category"
                            value={selectedParent}
                            onChange={(e) => setSelectedParent(e.target.value)}
                            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                        >
                            <option value="" hidden>No parent category</option>
                            {categories
                                .filter((cat) => !cat.parent)
                                .map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleCreateCategory}
                            disabled={!isFormValid()}
                            className={`px-8 py-2.5 font-medium rounded ${isFormValid()
                                ? 'bg-orange-600 text-white cursor-pointer'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                                }`}
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={!hasChanges()}
                            className={`px-8 py-2.5 font-medium rounded ${hasChanges()
                                ? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                                }`}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Categories Table */}
                <div className="mt-8">
                    <div className="grid grid-cols-3 p-2 bg-gray-200 font-semibold rounded-t">
                        <div>Category Name</div>
                        <div>Parent Category</div>
                        <div></div>
                    </div>
                    {categories.map((category) => (
                        <div
                            key={category._id}
                            className="grid grid-cols-3 p-2 border-b last:border-b-0"
                        >
                            <div>{capitalizeFirstLetter(category.name)}</div>
                            <div>{category.parent ? category.parent.name : ''}</div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(category._id)}
                                    className="text-blue-500 border border-blue-500 px-2 py-1 rounded hover:bg-blue-50"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(category._id)}
                                    className="text-red-500 border border-red-500 px-2 py-1 rounded hover:bg-red-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}