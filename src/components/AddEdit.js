
import { Inter } from 'next/font/google';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

function AddEdit({ productData, edit, isOpen, onClose }) {
  const { register, reset, formState: { errors }, handleSubmit } = useForm({
    defaultValues: edit && { ...productData }
  });
  const { data: session, status } = useSession();

  useEffect(() => {
    if ((session?.user?.name != 'Admin User')) {
      router.push('/'); // Redirect if not admin
    }
  }, [session, status]);

  useEffect(() => {
    if (edit && productData) {
      let temp = { ...productData }
      reset(temp);
    }
  }, [productData, edit, reset]);

  const router = useRouter();

  const onSubmit = async (data) => {
    if (edit) {
      const formData = new FormData();
      const obj = ['photo', 'drawing', 'process', 'billOfMaterial', 'rateDetails', 'inspectionDetails', 'customerComplaint']
      obj.map((item) => {
        if (data?.[item]?.[0]) {
          formData.append(item, data?.[item]?.[0])
        }
      })
      for (let i = 0; i < data?.["Other"].length; i++) {
        formData.append("Other", data?.["Other"][i]);
      }
      const toastId = toast.loading("Updating item...");
      try {
        const response = await fetch(`/api/item/edit?folderName=${data.productId}&productName=${data.productName}&sellingPrice=${data.sellingPrice}&presentStock=${data.presentStock}`, {
          method: 'PUT',
          body: formData,
        })
        if (response.status === 200) {
          toast.success('Item modified successfully!');
          onClose();
          // Refresh the page to show updated data
          window.location.reload();
        }
        if (response.status === 500) {
          toast.error('Something went wrong.!');
        }
      } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        toast.error('Something went wrong.')
      } finally {
        toast.dismiss(toastId);
      }
    } else {
      const formData = new FormData();
      const obj = ['photo', 'drawing', 'process', 'billOfMaterial', 'rateDetails', 'inspectionDetails', 'customerComplaint']
      obj.map((item) => {
        if (data?.[item]?.[0]) {
          formData.append(item, data?.[item]?.[0])
        }
      })

      for (let i = 0; i < data?.["Other"].length; i++) {
        formData.append("Other", data?.["Other"][i]);
      }
      const toastId = toast.loading("Adding new item...");
      try {
        const response = await fetch(`/api/item/add?folderName=${data.productId}&productName=${data.productName}&sellingPrice=${data.sellingPrice}&presentStock=${data.presentStock}`, {
          method: 'POST',
          body: formData,
        })
        if (response.status === 200) {
          toast.success('Item added successfully!');
          onClose();
          // Refresh the page to show updated data
          window.location.reload();
        }
        if (response.status === 500) {
          toast.error('Something went wrong.!');
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

  const handleClose = () => {
    reset();
    onClose();
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Modal */}
        <div 
          className={`bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${inter.className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {edit ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-gray-600 mt-1">
                {edit ? "Update product information and files" : "Create a new product entry with all required details"}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="product-id" className="block text-sm font-medium text-gray-700 mb-2">
                      Product ID
                    </label>
                    <input
                      {...register("productId", { required: "Product ID is required." })}
                      type="text"
                      id="product-id"
                      className={`input-field ${edit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={edit}
                      placeholder="Enter product ID"
                    />
                    {errors.productId && (
                      <p className="text-red-600 text-sm mt-1">{errors.productId.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      {...register("productName", { required: "Product name is required." })}
                      type="text"
                      id="product-name"
                      className="input-field"
                      placeholder="Enter product name"
                    />
                    {errors.productName && (
                      <p className="text-red-600 text-sm mt-1">{errors.productName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="selling-price" className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        {...register("sellingPrice", {
                          pattern: {
                            value: /^\d+(\.\d{1,2})?$/,
                            message: "Only numbers allowed up to 2 decimal places."
                          }
                        })}
                        type="text"
                        id="selling-price"
                        className="input-field pl-7"
                        placeholder="0.00"
                      />
                    </div>
                    {errors.sellingPrice && (
                      <p className="text-red-600 text-sm mt-1">{errors.sellingPrice.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                      Present Stock
                    </label>
                    <input
                      {...register("presentStock", {
                        pattern: {
                          value: /^\d+$/,
                          message: "Only numbers are allowed."
                        }
                      })}
                      type="text"
                      id="stock"
                      className="input-field"
                      placeholder="Enter stock quantity"
                    />
                    {errors.presentStock && (
                      <p className="text-red-600 text-sm mt-1">{errors.presentStock.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents & Files</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['photo', 'drawing', 'process', 'seller_Details', 'purchase_Details', 'inspection_Details', 'customer_Complaint'].map((field, index) => (
                    <div key={index} className="space-y-2">
                      <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                        {camelToTitleCase(field)}
                      </label>
                      <div className="relative">
                        <input
                          {...register(field)}
                          type="file"
                          id={field}
                          className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="reset"
                  className="btn-secondary flex-1"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {edit ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddEdit