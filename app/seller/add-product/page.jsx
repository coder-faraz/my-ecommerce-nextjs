'use client'

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";

import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import { calculateDiscountedPrice } from "@/lib/calcDiscountPrice";
import Loading from "@/components/Loading";
import Footer from "@/components/seller/Footer";

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const { getToken } = useAppContext();

  useEffect(() => {
    const newPrice = calculateDiscountedPrice(price, discountPercent);
    setDiscountedPrice(newPrice);
  }, [price, discountPercent]);

  const isFormValid = () => {
    return name.trim() && brand.trim() && category && price;
  };

  const resetForm = () => {
    setFiles([]);
    setName('');
    setDescription('');
    setBrand('');
    setColor('');
    setQuantity('');
    setCategory('');
    setPrice('');
    setDiscountPercent('');
    setDiscountedPrice('');
  };

  const hasChanges = () => {
    return (
      files.length > 0 ||
      name.trim() ||
      description.trim() ||
      brand.trim() ||
      color.trim() ||
      quantity.trim() ||
      category ||
      price ||
      discountPercent
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (discountedPrice && Number(discountedPrice) > Number(price)) {
      setLoading(false);
      return toast.error("Offer price cannot exceed the regular price.");
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('brand', brand);
    formData.append('color', color);
    formData.append('quantity', quantity);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('discountPercent', discountPercent);
    formData.append('discountedPrice', discountedPrice);

    files.forEach(file => file && formData.append('images', file));

    try {
      const token = await getToken();
      const { data } = await axios.post('/api/product/add', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (data.success) {
        resetForm();
        setLoading(false);
        toast.success(data.message);
      } else {
        setLoading(false);
        toast.error(data.message);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
      console.log(error, 'error adding seller product');
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? <Loading /> :
        <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
          <div>
            <p className="text-base font-medium">Image</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">

              {[...Array(4)].map((_, index) => (
                <label key={index} htmlFor={`image${index}`}>
                  <input onChange={(e) => {
                    const updatedFiles = [...files];
                    updatedFiles[index] = e.target.files[0];
                    setFiles(updatedFiles);
                  }} type="file" id={`image${index}`} hidden />
                  <Image
                    key={index}
                    className="max-w-24 cursor-pointer"
                    src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area}
                    alt=""
                    width={100}
                    height={100}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Basic Fields */}
          <div className="flex flex-col gap-1 max-w-md">
            <label className="text-base font-medium" htmlFor="product-name">
              Name
            </label>
            <input
              id="product-name"
              type="text"
              placeholder="Enter Product Name"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <label className="text-base font-medium" htmlFor="brand">
              Brand
            </label>
            <input
              id="brand"
              type="text"
              placeholder="Type here"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              onChange={(e) => setBrand(e.target.value)}
              value={brand}
              required
            />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <label
              className="text-base font-medium"
              htmlFor="product-description"
            >
              Description
            </label>
            <textarea
              id="product-description"
              rows={4}
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
              placeholder="Type here"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            ></textarea>
          </div>

          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex flex-col gap-1 w-32">
              <label className="text-base font-medium" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="man">Man</option>
                <option value="woman">Woman</option>
                <option value="accessories">Accessories</option>
                <option value="headphone">Headphone</option>
                <option value="earphone">Earphone</option>
                <option value="laptop">Laptop</option>
                <option value="smartphone">Smartphone</option>
                <option value="watch">Watch</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 w-32">
              <label className="text-base font-medium" htmlFor="color">
                Color
              </label>
              <input
                id="color"
                type="text"
                placeholder="e.g. Red"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                onChange={(e) => setColor(e.target.value)}
                value={color}
              />
            </div>
            <div className="flex flex-col gap-1 w-32">
              <label className="text-base font-medium" htmlFor="quantity">
                Quantity
              </label>
              <input
                id="quantity"
                type="text"
                placeholder="Enter Quantity"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                onChange={(e) => setQuantity(e.target.value)}
                value={quantity}
              />
            </div>
          </div>

          {/* Discount and Prices */}
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex flex-col gap-1 w-32">
              <label className="text-base font-medium" htmlFor="product-price">
                Price
              </label>
              <input
                id="product-price"
                type="number"
                placeholder="0"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                onChange={(e) => setPrice(e.target.value)}
                value={price}
                required
              />
            </div>
            <div className="flex flex-col gap-1 w-32">
              <label className="text-base font-medium" htmlFor="discount-percent">
                Discount %
              </label>
              <input
                id="discount-percent"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                onChange={(e) => setDiscountPercent(e.target.value)}
                value={discountPercent}
              />
            </div>
            <div className="flex flex-col gap-1 w-32">
              <label className="text-base font-medium" htmlFor="offer-price">
                Discounted Price
              </label>
              <input
                id="offer-price"
                type="text"
                placeholder="0"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 bg-gray-100 cursor-not-allowed"
                value={discountedPrice}
                readOnly
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`px-8 py-2.5 font-medium rounded ${isFormValid()
                ? 'bg-orange-600 text-white cursor-pointer'
                : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
            >
              ADD
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
              RESET
            </button>
          </div>

        </form>}
      <Footer />
    </div>
  );
};

export default AddProduct;