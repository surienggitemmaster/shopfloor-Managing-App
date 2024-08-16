
import { Inter } from 'next/font/google';
import React from 'react'
import { useForm } from 'react-hook-form';

const inter = Inter({ subsets: ["latin"] });

function AddEdit({ productData, productFiles, edit }) {
    const { register, reset, formState: { errors }, handleSubmit } = useForm({
        defaultValues: { ...productData, ...productFiles }
    });

    const onSubmit = (data) => {
        console.log(data);
    }

    const camelToTitleCase = (str) => {
        return str
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    };
    return (
        <div className={`min-h-screen bg-gray-100 p-4 ${inter.className}`}>
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow-inner border border-gray-300">
                <h2 className="text-2xl font-bold mb-6">{edit ? "Edit Product" : "Add Product"}</h2>
                <form onReset={reset} onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div>
                        <label htmlFor="product-id" className="block text-sm font-medium text-gray-700">
                            Product ID
                        </label>
                        <input
                            {...register("productId", { required: "product id is required." })}
                            type="text"
                            id="product-id"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        />
                        {errors.productId && <span className="text-red-500 text-sm mt-1">{errors.productId.message}</span>}
                    </div>
                    <div>
                        <label htmlFor="product-name" className="block text-sm font-medium text-gray-700">
                            Product Name
                        </label>
                        <input
                            {...register("productName", { required: "product name is required." })}
                            type="text"
                            id="product-name"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        />
                        {errors.productName && <span className="text-red-500 text-sm mt-1">{errors.productName.message}</span>}
                    </div>
                    <div>
                        <label htmlFor="selling-price" className="block text-sm font-medium text-gray-700">
                            Selling Price
                        </label>
                        <input
                            {...register("sellingPrice", {
                                required: "please enter a valid price.",
                                pattern: {
                                    value: /^\d+(\.\d{1,2})?$/,
                                    message: "only numbers allowed upto 2 decimal places."
                                }
                            })}
                            type="text"
                            id="selling-price"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        />
                        {errors.sellingPrice && <span className="text-red-500 text-sm mt-1">{errors.sellingPrice.message}</span>}
                    </div>
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                            Present Stock
                        </label>
                        <input
                            {...register("presentStock", {
                                required: "please enter stock.",
                                pattern: {
                                    value: /^\d+$/,
                                    message: "only numbers are allowed."
                                }
                            })}
                            type="text"
                            id="stock"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        />
                        {errors.presentStock && <span className="text-red-500 text-sm mt-1">{errors.presentStock.message}</span>}
                    </div>

                    {/* File Upload Fields */}
                    {['photos', 'drawing', 'process', 'sellerDetails', 'purchaseDetails', 'inspectionDetails', 'customerComplaint'].map((field, index) => (
                        <div key={index}>
                            <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                                {camelToTitleCase(field)}
                            </label>
                            <input
                                {...register(field)}
                                type="file"
                                id={field}
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
    )
}

export default AddEdit