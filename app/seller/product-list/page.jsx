'use client'
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { assets, productsDummyData } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import { Utility } from "@/lib";

const ProductList = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { router, getToken, user } = useAppContext();
  const { capitalizeFirstLetter } = Utility();
  const hasDiscounted = products.some(p => p.discountedPrice && p.discountedPrice < p.price);

  const fetchSellerProduct = async () => {
    try {

      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get('/api/product/seller-list', { headers: { Authorization: `Bearer ${token}` } })

      if (data.success) {
        setProducts(data.allProducts);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
      console.log(error, 'error in fetch seller-list products data')
    }
  }

  useEffect(() => {
    if (user) {
      fetchSellerProduct();
    }
  }, [user])

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? <Loading /> : <div className="w-full p-2 sm:p-4 md:p-6 lg:p-10">
        <h2 className="pb-4 text-lg font-medium">All Products</h2>

        {/* Desktop Table View */}
        <div className="hidden md:flex flex-col items-center max-w-full w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1200px] table-auto">
              <thead className="text-gray-900 text-sm text-left bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium" style={{ width: hasDiscounted ? '25%' : '30%' }}>Product</th>
                  <th className="px-4 py-3 font-medium" style={{ width: hasDiscounted ? '12%' : '15%' }}>Brand</th>
                  <th className="px-4 py-3 font-medium" style={{ width: hasDiscounted ? '12%' : '15%' }}>Category</th>
                  <th className="px-4 py-3 font-medium text-right" style={{ width: hasDiscounted ? '10%' : '12%' }}>Price</th>
                  {hasDiscounted && <th className="px-4 py-3 font-medium text-right" style={{ width: '12%' }}>Discounted Price</th>}
                  <th className="px-4 py-3 font-medium text-center" style={{ width: hasDiscounted ? '8%' : '10%' }}>Quantity</th>
                  <th className="px-4 py-3 font-medium text-center" style={{ width: hasDiscounted ? '10%' : '12%' }}>Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {!products?.length ? null
                  : products.map(product => (
                    <tr key={product._id} className="border-t border-gray-500/20 hover:bg-gray-50">
                      <td className="px-4 py-3" style={{ width: hasDiscounted ? '25%' : '30%' }}>
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-500/10 rounded p-2 flex-shrink-0">
                            <Image
                              src={product.images[0] || assets.upload_area}
                              alt={product.name}
                              className="w-16 h-12 object-cover"
                              width={64}
                              height={48}
                            />
                          </div>
                          <span className="truncate min-w-0 flex-1">
                            {capitalizeFirstLetter(product.name)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 truncate" style={{ width: hasDiscounted ? '12%' : '15%' }}>
                        {capitalizeFirstLetter(product.brand)}
                      </td>
                      <td className="px-4 py-3 truncate" style={{ width: hasDiscounted ? '12%' : '15%' }}>
                        {capitalizeFirstLetter(product.category)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium" style={{ width: hasDiscounted ? '10%' : '12%' }}>
                        ${product.price.toFixed(2)}
                      </td>
                      {hasDiscounted && (
                        <td className="px-4 py-3 text-right font-medium text-green-600" style={{ width: '12%' }}>
                          {product.discountedPrice
                            ? `${product.discountedPrice.toFixed(2)}`
                            : '-'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center" style={{ width: hasDiscounted ? '8%' : '10%' }}>
                        {product.quantity}
                      </td>
                      <td className="px-4 py-3 text-center" style={{ width: hasDiscounted ? '10%' : '12%' }}>
                        <button onClick={() => router.push(`/product/${product._id}`)} className="inline-flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm">
                          <span className="whitespace-nowrap">Visit</span>
                          <Image
                            className="h-3.5 w-3.5 flex-shrink-0"
                            src={assets.redirect_icon}
                            alt="redirect_icon"
                            width={14}
                            height={14}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {!products?.length ? (
            <div className="text-center py-8 text-gray-500">No products found</div>
          ) : (
            products.map(product => (
              <div key={product._id} className="bg-white border border-gray-500/20 rounded-lg p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="bg-gray-500/10 rounded p-2 flex-shrink-0">
                    <Image
                      src={product.images[0] || assets.upload_area}
                      alt={product.name}
                      className="w-16 h-12 object-cover"
                      width={64}
                      height={48}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate mb-1">
                      {capitalizeFirstLetter(product.name)}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-500">
                      <div className="flex justify-between">
                        <span>Brand:</span>
                        <span className="truncate ml-2">{capitalizeFirstLetter(product.brand)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="truncate ml-2">{capitalizeFirstLetter(product.category)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-medium text-gray-900">${product.price.toFixed(2)}</span>
                      </div>
                      {product.discountedPrice && product.discountedPrice < product.price && (
                        <div className="flex justify-between">
                          <span>Discounted:</span>
                          <span className="font-medium text-green-600">${product.discountedPrice.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span>{product.quantity}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={() => router.push(`/product/${product._id}`)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700 transition-colors"
                      >
                        <span>Visit Product</span>
                        <Image
                          className="h-3.5 w-3.5"
                          src={assets.redirect_icon}
                          alt="redirect_icon"
                          width={14}
                          height={14}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tablet Table View */}
        <div className="hidden sm:block md:hidden">
          <div className="flex flex-col items-center max-w-full w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <div className="w-full overflow-x-auto">
              <table className="table-auto w-full min-w-[600px]">
                <thead className="text-gray-900 text-sm text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-500">
                  {!products?.length ? null
                    : products.map(product => (
                      <tr key={product._id} className="border-t border-gray-500/20">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-500/10 rounded p-2 flex-shrink-0">
                              <Image
                                src={product.images[0] || assets.upload_area}
                                alt={product.name}
                                className="w-12 h-9 object-cover"
                                width={48}
                                height={36}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {capitalizeFirstLetter(product.name)}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {capitalizeFirstLetter(product.brand)} • {capitalizeFirstLetter(product.category)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">${product.price.toFixed(2)}</div>
                            {product.discountedPrice && product.discountedPrice < product.price && (
                              <div className="text-xs text-green-600">${product.discountedPrice.toFixed(2)}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{product.quantity}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => router.push(`/product/${product._id}`)} className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-md text-sm hover:bg-orange-700 transition-colors">
                            <span>Visit</span>
                            <Image
                              className="h-3 w-3"
                              src={assets.redirect_icon}
                              alt="redirect_icon"
                              width={12}
                              height={12}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>}
      <Footer />
    </div>
  );
};

export default ProductList;