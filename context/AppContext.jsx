'use client'
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from '@clerk/nextjs'

import { productsDummyData, userDummyData } from "@/assets/assets";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

// Create a React context to manage global app state
export const AppContext = createContext();

// Custom hook to access context easily
export const useAppContext = () => {
    return useContext(AppContext)
}

// Context Provider component to wrap the app
export const AppContextProvider = (props) => {

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [wishlistItems, setWishlistItems] = useState([])
    const router = useRouter()

    const { user } = useUser();     // Clerk user object
    const { getToken } = useAuth();  // Auth token function from Clerk
    const currency = process.env.NEXT_PUBLIC_CURRENCY;

    /**
    * Fetch all available products from backend API
    */
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

    /**
  * Fetch logged-in user's data from backend and initialize cart and wishlist
  */
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
                setWishlistItems(data.user.wishlistItems || []);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.log(error, 'error in fetch user data')
        }
    }

    /**
   * Add an item to the cart. If already present, increment quantity.
   * Also sync with backend if user is logged in.
   */
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

    /**
    * Update quantity of a cart item or remove if quantity = 0
    */
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

    /**
 * Add item to wishlist and sync with backend
 */
    const addToWishlist = async (itemId) => {
        if (!user) {
            toast.error('Please login to add items to wishlist');
            return;
        }

        if (wishlistItems.includes(itemId)) {
            toast.info('Item already in wishlist');
            return;
        }

        try {
            const token = await getToken();
            const { data } = await axios.post('/api/wishlist',
                { productId: itemId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                setWishlistItems(data.wishlistItems);
                toast.success('Added To Wishlist Successfully');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            console.log(error, 'error in fe addToWishlist()');
        }
    }

    /**
    * Remove item from wishlist and sync with backend
    */
    const removeFromWishlist = async (itemId) => {
        if (!user) {
            toast.error('Please login to Remove items from wishlist');
            return;
        }

        try {
            const token = await getToken();
            const { data } = await axios.delete('/api/wishlist', {
                headers: { Authorization: `Bearer ${token}` },
                data: { productId: itemId }
            });

            if (data.success) {
                setWishlistItems(data.wishlistItems);
                toast.success('Removed From Wishlist');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            console.log(error, 'error in fe removeFromWishlist()');
        }
    }

    /**
   * Toggle wishlist status for a product
   */
    const toggleWishlist = async (itemId) => {
        if (wishlistItems.includes(itemId)) {
            await removeFromWishlist(itemId);
        } else {
            await addToWishlist(itemId);
        }
    }

    /**
 * Get total number of items in the cart
 */
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
   * Get total number of wishlist items
   */
    const getWishlistCount = () => {
        return wishlistItems.length;
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
        wishlistItems, setWishlistItems,
        addToCart, updateCartQuantity,
        addToWishlist, removeFromWishlist, toggleWishlist,
        getCartCount, getWishlistCount, getCartTotals
    }

    // Provide the context to all children
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}