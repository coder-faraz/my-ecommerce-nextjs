'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';

import { useAppContext } from '@/context/AppContext';
import Footer from '@/components/seller/Footer';
import Loading from '@/components/Loading';
import { Utility } from '@/lib';

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminUsername, setNewAdminUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [addingAdmin, setAddingAdmin] = useState(false);
    const { router, getToken, user } = useAppContext();
    const { capitalizeFirstLetter } = Utility();

    // Fetch admins on mount
    useEffect(() => {
        if (user) {
            fetchAdmins();
        }
    }, [user]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get('/api/user/seller-data', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!data.success) {
                if (data.message === 'Not Authorized') {
                    router.push('/login');
                }
                toast.error(data.message);
                return;
            }
            setAdmins(data.sellers);
        } catch (error) {
            toast.error('Failed to fetch sellers');
            console.log(error, 'error in fetch sellers data');
        } finally {
            setLoading(false);
        }
    };

    // Handle adding a new seller
    const handleAddAdmin = async () => {
        if (!newAdminEmail.trim() || !newAdminUsername.trim()) {
            toast.error('Both username and email are required');
            return;
        }

        // Basic email validation
        if (!newAdminEmail.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            setAddingAdmin(true);
            const token = await getToken();
            const { data } = await axios.post('/api/user/seller-data',
                { email: newAdminEmail, username: newAdminUsername },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!data.success) {
                if (data.message === 'Not Authorized') {
                    router.push('/login');
                }
                toast.error(data.message);
                return;
            }

            // Refresh the seller list
            await fetchAdmins();
            setNewAdminEmail('');
            setNewAdminUsername('');
            toast.success(data.message || 'Seller added successfully');
        } catch (error) {
            toast.error('Failed to add seller');
            console.log(error, 'error in add seller');
        } finally {
            setAddingAdmin(false);
        }
    };

    // Handle deleting an admin
    const handleDeleteAdmin = async (email) => {
        if (!confirm(`Are you sure you want to delete seller: ${email}?`)) {
            return;
        }

        try {
            const token = await getToken();
            const { data } = await axios.delete('/api/user/seller-data', {
                data: { email },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!data.success) {
                if (data.message === 'Not Authorized') {
                    router.push('/login');
                }
                toast.error(data.message);
                return;
            }

            setAdmins(admins.filter((seller) => seller.email !== email));
            toast.success(data.message || 'seller deleted successfully');
        } catch (error) {
            toast.error('Failed to delete seller');
            console.log(error, 'error in delete seller');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddAdmin();
        }
    };

    return (
        <div className="flex-1 min-h-screen flex flex-col justify-between">
            {loading ? (
                <Loading />
            ) : (
                <div className="w-full md:p-10 p-4">
                    <h2 className="pb-4 text-lg font-medium">Seller Management</h2>

                    {/* Add New Seller Form */}
                    <div className="mb-6 p-4 bg-white border border-gray-500/20 rounded-md max-w-4xl w-full">
                        <h3 className="text-base font-medium mb-3">Add New Seller</h3>
                        <div className="flex flex-col md:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="Enter Username"
                                value={newAdminUsername}
                                onChange={(e) => setNewAdminUsername(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="outline-none py-2.5 px-3 rounded border border-gray-500/40 flex-1"
                                disabled={addingAdmin}
                            />
                            <input
                                type="email"
                                placeholder="Enter Seller email address"
                                value={newAdminEmail}
                                onChange={(e) => setNewAdminEmail(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="outline-none py-2.5 px-3 rounded border border-gray-500/40 flex-1"
                                disabled={addingAdmin}
                            />
                            <button
                                onClick={handleAddAdmin}
                                disabled={addingAdmin || !newAdminEmail.trim() || !newAdminUsername.trim()}
                                className="bg-blue-600 text-white px-6 py-2.5 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                {addingAdmin ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Adding...
                                    </>
                                ) : (
                                    'Add Seller'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Sellers Table */}
                    <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                        <table className="table-fixed w-full overflow-hidden">
                            <thead className="text-gray-900 text-sm text-left">
                                <tr>
                                    <th className="w-1/3 px-4 py-3 font-medium">Email</th>
                                    <th className="w-1/3 px-4 py-3 font-medium">Username</th>
                                    <th className="px-4 py-3 font-medium max-sm:hidden">Created At</th>
                                    <th className="px-4 py-3 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-500">
                                {!admins?.length ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                            No Sellers Found
                                        </td>
                                    </tr>
                                ) : (
                                    admins.map((seller, index) => (
                                        <tr key={seller.email || index} className="border-t border-gray-500/20">
                                            <td className="px-4 py-3">
                                                <span className="truncate block">
                                                    {seller.email}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="truncate block">
                                                    {capitalizeFirstLetter(seller.username) || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 max-sm:hidden">
                                                {seller.createdAt
                                                    ? new Date(seller.createdAt).toLocaleDateString()
                                                    : 'N/A'
                                                }
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDeleteAdmin(seller.email)}
                                                    className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs"
                                                >
                                                    <span>Delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    {admins?.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600">
                            Total Sellers: {admins.length}
                        </div>
                    )}
                </div>
            )}
            <Footer />
        </div>
    );
}