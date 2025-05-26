'use client'
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from '@clerk/nextjs'

import { productsDummyData, userDummyData } from "@/assets/assets";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const router = useRouter()

    const { user } = useUser();
    const { getToken } = useAuth();
    const currency = process.env.NEXT_PUBLIC_CURRENCY;

    const fetchProductData = async () => {
        try {
            const { data } = await axios.get('/api/product/list')
            if (data.success) {
                setProducts(data.allProducts);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.log(error, 'error in fetch user data')
        }
    }

    const fetchUserData = async () => {
        try {
            if (user.publicMetadata.role === 'seller') {
                setIsSeller(true);
            }

            const token = await getToken();
            const { data } = await axios.get('/api/user/data', { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setUserData(data.user);
                setCartItems(data.user.cartItems);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.log(error, 'error in fetch user data')
        }
    }

    const addToCart = async (itemId) => {
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        if (user) {
            try {
                const token = await getToken();
                await axios.post('/api/cart/update', { cartData }, { headers: { Authorization: `Bearer ${token}` } })
                toast.success('Added To Cart Successfully');
            } catch (error) {
                toast.error(error.message);
                console.log(error, 'error in fe addToCart()')
            }
        }
    }

    const updateCartQuantity = async (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData);
        if (user) {
            try {
                const token = await getToken();
                await axios.post('/api/cart/update', { cartData }, { headers: { Authorization: `Bearer ${token}` } })
                toast.success('Cart Updated Successfully');
            } catch (error) {
                toast.error(error.message);
                console.log(error, 'error in fe updateCart()')
            }
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    /**
     * Compute both original and discounted totals for the current cart.
     * @returns {{ originalTotal: number, discountedTotal: number, discountAmount: number }}
     */
    const getCartTotals = () => {
        let originalTotal = 0;
        let discountedTotal = 0;

        for (const productId in cartItems) {
            const qty = cartItems[productId];
            if (qty <= 0) continue;

            const prod = products.find(p => p._id === productId);
            if (!prod) continue;

            // accumulate original and discounted
            originalTotal += prod.price * qty;
            discountedTotal += (prod.discountedPrice ?? prod.price) * qty;
        }

        // round to 2 decimal places
        originalTotal = Math.round(originalTotal * 100) / 100;
        discountedTotal = Math.round(discountedTotal * 100) / 100;

        return {
            originalTotal,
            discountedTotal,
            discountAmount: originalTotal - discountedTotal
        };
    };

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user])

    const value = {
        user, getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartTotals
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}