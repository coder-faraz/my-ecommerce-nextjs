import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { useAppContext } from "@/context/AppContext";
import { addressDummyData } from "@/assets/assets";

const OrderSummary = () => {

  const { currency, router, getCartCount, getCartTotals, getToken, cartItems, setCartItems, user } = useAppContext()
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const { originalTotal, discountedTotal, discountAmount } = getCartTotals();

  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user/get-address', { headers: { Authorization: `Bearer ${token}` } })

      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error, 'error in fetch user address data')
    }
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  // This code is commented to check payment-screen page & will be implemented after payment is successful
  const createOrder = async () => {
    try {
      // if (!selectedAddress) {
      //   return toast.error("Select An Address To Continue");
      // }

      // let cartItemsArr = Object
      //   .keys(cartItems)
      //   .map(key => ({ productId: key, quantity: cartItems[key] }))
      //   .filter(item => item.quantity > 0);

      // if (cartItemsArr.length === 0) {
      //   return toast.error("Select Items To Continue");
      // }

      // const token = await getToken();
      // const { data } = await axios.post('/api/order/create', {
      //   addressId: selectedAddress._id,
      //   items: cartItemsArr
      // }, {
      //   headers: {
      //     Authorization: `Bearer ${token}`
      //   }
      // })

      // if (data.success) {
      //   setCartItems({});
      //   router.push('/payment-screen');
      // } else {
      //   toast.error(data.message);
      // }
      router.push('/payment-screen')
    } catch (error) {
      toast.error(error.message);
      console.log('error in create order fe', error);
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Delivery Address
          </label>
          <div className="relative inline-block w-full text-sm border">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullname}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Select Delivery Address"}
              </span>
              <svg className={`w-5 h-5 inline float-right transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5">
                {userAddresses.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                    onClick={() => handleAddressSelect(address)}
                  >
                    {address.fullname}, {address.area}, {address.city}, {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
          <div className="text-xs text-orange-600 mt-1 ml-1">
            Deliver Here
          </div>
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Promo Code
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
            />
            <button className="bg-orange-600 text-white px-9 py-2 hover:bg-orange-700">
              Apply
            </button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <label className="text-base font-medium uppercase text-gray-600 block mb-2">
          Price Details
        </label>
        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="text-gray-800">Price ({getCartCount()} Items)</p>
            <p className="text-gray-800">{currency}{originalTotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-base font-medium">
            <p className="text-gray-800">Discount</p>
            <p className="text-gray-800">-{currency}{discountAmount.toFixed(2)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-800">Shipping Fee</p>
            <p className="font-medium text-gray-800">
              <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                $2
              </span> Free</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-800">Tax (2%)</p>
            <p className="font-medium text-gray-800">{currency}{Math.floor(discountedTotal * 0.02)}</p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total Amount</p>
            <p>{currency}{discountedTotal + Math.floor(discountedTotal * 0.02)}</p>
          </div>
        </div>
      </div>

      <button onClick={createOrder} className="w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700">
        Place Order
      </button>
    </div>
  );
};

export default OrderSummary;