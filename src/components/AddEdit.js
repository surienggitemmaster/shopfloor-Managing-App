
import { Inter } from 'next/font/google';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import toast from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

function AddEdit({ productData, edit }) {
  const { register, reset, formState: { errors }, handleSubmit } = useForm({
    defaultValues: edit && { ...productData }
  });

  useEffect(() => {
    if (edit) {
      let temp = { ...productData }
      reset(temp);
    }
  }, [productData]);

  const router = useRouter();

  const onSubmit = async (data) => {
    if (edit) {
      const formData = new FormData();
      const obj = ['photo', 'drawing', 'process', 'seller_Details', 'purchase_Details', 'inspection_Details', 'customer_Complaint']
      obj.map((item) => {
        if (data?.[item]?.[0]) {
          formData.append(item, data?.[item]?.[0])
        }
      })
      const toastId = toast.loading("Updating item...");
      try {
        const response = await fetch(`/api/item/edit?folderName=${data.productId}&productName=${data.productName}&sellingPrice=${data.sellingPrice}&presentStock=${data.presentStock}`, {
          method: 'PUT',
          body: formData,
        })
        if (response.status === 200) {
          toast.success('Item modified successfully!');
          router.push('/');
        }
      } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        toast.error('Something went wrong.')
      } finally {
        toast.dismiss(toastId);
      }
    } else {
      const formData = new FormData();
      const obj = ['photo', 'drawing', 'process', 'seller_Details', 'purchase_Details', 'inspection_Details', 'customer_Complaint']
      obj.map((item) => {
        if (data?.[item]?.[0]) {
          formData.append(item, data?.[item]?.[0])
        }
      })
      const toastId = toast.loading("Adding new item...");
      try {
        const response = await fetch(`/api/item/add?folderName=${data.productId}&productName=${data.productName}&sellingPrice=${data.sellingPrice}&presentStock=${data.presentStock}`, {
          method: 'POST',
          body: formData,
        })
        if (response.status === 200) {
          toast.success('Item added successfully!');
          router.push('/');
        }
      } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        toast.error('Something went wrong.')
      } finally {
        toast.dismiss(toastId);
      }
    }
  };

  const camelToTitleCase = (str) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className={`min-h-screen bg-gradient-to-tr from-gray-200 to-gray-400 p-4 ${inter.className}`}>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-md shadow-md border border-gray-300">
        <h2 className="text-2xl font-bold mb-6">{edit ? "Edit Product" : "Add Product"}</h2>
        <form onReset={reset} onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <div>
            <label htmlFor="product-id" className="block text-sm font-medium text-gray-700">
              Product Id
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
          {['photo', 'drawing', 'process', 'sellerDetails', 'purchaseDetails', 'inspectionDetails', 'customerComplaint'].map((field, index) => (
            <div key={index}>
              <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                {camelToTitleCase(field)}
              </label>
              {/* <div className="mt-1 relative"> */}
              <input
                {...register(field)}
                type="file"
                id={field}
                // ${edit && 'sr-only'}
                className={` mt-1 block w-full p-2 border text-sm border-gray-300 rounded-md`}
              //onChange={(e) => handleFileChange(e, field)}
              />
              {/* <div className="flex items-center">
                                    <span className="flex-grow px-2 py-2 text-sm text-gray-500 border border-gray-300 rounded-md">
                                        {fileNames?.field || 'No file chosen'}
                                    </span>
                                    <label
                                        htmlFor={field}
                                        className="ml-2 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-blue-600"
                                    >
                                        Choose File
                                    </label>
                                </div> */}
              {/* </div> */}
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