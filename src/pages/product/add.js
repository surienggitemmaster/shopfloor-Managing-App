// pages/add-product.js
import React from 'react';
import { Inter } from "next/font/google";
import { useForm } from 'react-hook-form';

const inter = Inter({ subsets: ["latin"] });

const AddProduct = () => {

    const {
        register,
        reset,
        formState: { errors },
        handleSubmit,
    } = useForm();

    const onSubmit = (data) => {
        console.log(data);
    }

    return (
        <div className={`min-h-screen bg-gray-100 p-4 ${inter.className}`}>
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow-md">
                <h2 className="text-2xl font-bold mb-6">Add Product</h2>
                <form onReset={reset} onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div>
                        <label htmlFor="product-id" className="block text-sm font-medium text-gray-700">
                            Product ID
                        </label>
                        <input
                            {...register("productId", { required: true })}
                            type="text"
                            id="product-id"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">
                            Product Name
                        </label>
                        <input
                            {...register("productName", { required: true })}
                            type="text"
                            id="product-name"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="selling-price" className="block text-sm font-medium text-gray-700">
                            Selling Price
                        </label>
                        <input
                            {...register("sellingPrice", { required: true })}
                            type="number"
                            id="selling-price"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                            Present Stock
                        </label>
                        <input
                            {...register("presentStock", { required: true })}
                            type="number"
                            id="stock"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* File Upload Fields */}
                    {['Photos', 'Drawing', 'Process', 'Seller Details', 'Purchase Details', 'Inspection Details', 'Customer Complaint'].map((field, index) => (
                        <div key={index}>
                            <label htmlFor={field.toLowerCase().replace(/ /g, '-')} className="block text-sm font-medium text-gray-700">
                                {field}
                            </label>
                            <input
                                {...register(field.toLowerCase().replace(/ /g, ''))}
                                type="file"
                                id={field.toLowerCase().replace(/ /g, '-')}
                                className="mt-1 block w-full p-2 border text-sm border-gray-300 rounded-md"
                            />
                        </div>
                    ))}
                    <div></div>

                    <button
                        type="reset"
                        className="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
