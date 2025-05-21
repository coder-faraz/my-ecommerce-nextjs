'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";

import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";

const AddAddress = () => {
    const [address, setAddress] = useState({
        fullname: '',
        contact: '',
        alternativeContact: '',
        pincode: '',
        area: '',
        city: '',
        state: '',
        landmark: '',
    });
    const [loading, setLoading] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const { getToken, router } = useAppContext();

    useEffect(() => {
        const { fullname, contact, pincode, area, city, state } = address;
        const isValid =
            fullname.trim() &&
            contact.trim() &&
            pincode.trim() &&
            area.trim() &&
            city.trim() &&
            state.trim();
        setIsFormValid(Boolean(isValid));
    }, [address]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = await getToken();
            const { data } = await axios.post('/api/user/add-address', { address }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (data.success) {
                setLoading(false);
                toast.success(data.message);
                router.push('/cart');
            } else {
                setLoading(false);
                toast.error(data.message);
            }
        } catch (error) {
            setLoading(false);
            toast.error(error.message || "Something Went Wrong");
            console.log(error, 'error adding user address');
        }
    };

    return (
        <>
            <Navbar />
            {loading ? <Loading /> :
                <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
                    <form onSubmit={onSubmitHandler} className="w-full">
                        <p className="text-2xl md:text-3xl text-gray-500">
                            Add Shipping <span className="font-semibold text-orange-600">Address</span>
                        </p>
                        <div className="space-y-3 max-w-sm mt-10">
                            <input
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                type="text"
                                placeholder="Full Name (Required)*"
                                onChange={(e) => setAddress({ ...address, fullname: e.target.value })}
                                value={address.fullname}
                            />
                            <input
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                type="text"
                                placeholder="Phone Number (Required)*"
                                onChange={(e) => setAddress({ ...address, contact: e.target.value })}
                                value={address.contact}
                            />
                            <input
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                type="text"
                                placeholder="Add Alternative Phone (Optional)"
                                onChange={(e) => setAddress({ ...address, alternativeContact: e.target.value })}
                                value={address.alternativeContact}
                            />
                            <input
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                type="text"
                                placeholder="Pincode (Required)*"
                                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                                value={address.pincode}
                            />
                            <div className="flex space-x-3">
                                <input
                                    className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                    type="text"
                                    placeholder="State (Required)*"
                                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                    value={address.state}
                                />
                                <input
                                    className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                    type="text"
                                    placeholder="City (Required)*"
                                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                    value={address.city}
                                />
                            </div>
                            <textarea
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500 resize-none"
                                type="text"
                                rows={3}
                                placeholder="House No., Street, Area (Required)*"
                                onChange={(e) => setAddress({ ...address, area: e.target.value })}
                                value={address.area}
                            ></textarea>
                            <input
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                type="text"
                                placeholder="Add Nearby Shop/Landmark (Optional)"
                                onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                                value={address.landmark}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className={`max-w-sm w-full mt-6 py-3 uppercase text-white transition ${isFormValid
                                ? 'bg-orange-600 hover:bg-orange-700'
                                : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Save address
                        </button>
                    </form>
                    <Image
                        className="md:mr-16 mt-16 md:mt-0"
                        src={assets.my_location_image}
                        alt="my_location_image"
                    />
                </div>}
            <Footer />
        </>
    );
};

export default AddAddress;