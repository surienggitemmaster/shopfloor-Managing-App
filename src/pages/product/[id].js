
import { useRouter } from 'next/router'
import React, { useState, useRef, useEffect } from 'react'
import { useSession } from "next-auth/react";
import axios from 'axios';
import PDFViewer from '@/components/Pdfviewer';
import Loader from '@/components/Loader';
import FileInput from '@/components/FileInput';
import { Inter } from "next/font/google";
import { useForm } from 'react-hook-form';
import { useProductContext } from '@/contexts/ProductContext';

const inter = Inter({ subsets: ["latin"] });

const ProductPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpenForMobile, setSidebarOpenForMobile] = useState(false);
  const refForSidebar = useRef(null);
  const [folderId, setFolderId] = useState(null);
  const [files, setFiles] = useState(null);
  const [selectfileId, setSelectfileId] = useState(null);
  const { id, name, price, stock } = router.query;
  //const { productData } = useProductContext();
  const viewOnly = true;
  const [isLoading, setIsLoading] = useState(false);

  // const [productData, setProductData] = useState({
  //   id: id,
  //   name: name,
  //   sellingPrice: price,
  //   presentStock: stock,
  //   files: {}
  // });

  // const { register, handleSubmit, reset, setValue } = useForm({
  //   defaultValues: productData || {
  //     productId: '',
  //     productName: '',
  //     sellingRate: '',
  //     presentStock: '',
  //     files: {}
  //   },
  // });

  useEffect(() => {
    if ((status != "loading") && (!session)) {
      router.push('/login'); // Redirect if not admin
    }
  }, [session, status]);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  });

  useEffect(() => {
    const fetchItemFolderId = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/drive?&folderId=1_R8sr35A2NHxLo-x9saCnMZqPS3iDVQn`);
        response?.data.map((file) => {
          if (file?.name === id) {
            setFolderId(file.id);
          }
        })
      } catch (error) {
        console.error('Error fetching Excel data:', error);
      }
      setIsLoading(false);
    }

    if (router.isReady) {
      fetchItemFolderId();
      fetchItemFiles();
    }
  }, [id, folderId, router.isReady]);

  const fetchItemFiles = async () => {
    if (!folderId) return;
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/drive?&folderId=${folderId}`);
      let tempObj = {}
      response?.data.map((item) => {
        tempObj[(item.name.split(".")[0])] = item.id
      })
      setFiles(tempObj)
      setSelectfileId(tempObj?.PHOTO)
    } catch (error) {
      console.error('Error fetching Excel data:', error);
    }
    setIsLoading(false);
  }

  const handleOutsideClick = (e) => {
    if (refForSidebar.current && !refForSidebar.current.contains(e.target)) {
      setSidebarOpenForMobile(false);
    }
  };

  const handleFileId = (e) => {
    setSelectfileId(e)
  }

  return (
    <>
      <aside ref={refForSidebar} id="default-sidebar" className={`${inter.className} fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${sidebarOpenForMobile ? "translate-x-0" : "-translate-x-full sm:translate-x-0"} `} aria-label="Sidebar">
        <div className="h-full px-3 py-4 text-xs sm:text-base overflow-y-auto bg-gray-200 dark:bg-gray-800 border-r border-gray-300">

          {viewOnly ? (
            <div className='border bg-white border-gray-300 rounded-md p-2'>
              <div className='p-1 flex items-center justify-between'>
                <span>Product Id</span>
                <span>{id}</span>
              </div>
              <div className='p-1 flex items-center justify-between'>
                <span>Item Name</span>
                <span>{name}</span>
              </div>
              <div className='p-1 flex items-center justify-between'>
                <span>Selling Rate</span>
                <span className='inline-flex items-center justify-center px-2 rounded-md bg-yellow-400'>{price}</span>
              </div>
              <div className='p-1 flex items-center justify-between'>
                <span>Present Stock</span>
                <span className='inline-flex items-center justify-center px-2 rounded-md bg-yellow-400'>{stock}</span>
              </div>
            </div>
          ) : (
            <></>
            // <div className='border text-sm bg-white border-gray-300 rounded-md px-1 py-2 shadow-md'>
            //   <div className='p-1 space-x-2 flex items-center justify-between overflow-hidden'>
            //     <span className='flex-none w-24 font-semibold text-gray-800'>Product Id</span>
            //     <input
            //       {...register('productId', { required: true })}
            //       className='w-full block border border-gray-300 rounded-md p-1'
            //     />
            //   </div>
            //   <div className='p-1 space-x-2 flex items-center justify-between'>
            //     <span className='flex-none w-24 font-semibold text-gray-800'>Item Name</span>
            //     <input {...register('productName')} className='w-full block border border-gray-300 rounded-md p-1' />
            //   </div>
            //   <div className='p-1 space-x-2 flex items-center justify-between'>
            //     <span className='flex-none w-24 font-semibold text-gray-800'>Selling Rate</span>
            //     <input {...register('sellingRate')} className='w-full block border border-gray-300 rounded-md p-1' />
            //   </div>
            //   <div className='p-1 space-x-2 flex items-center justify-between'>
            //     <span className='flex-none w-24 font-semibold text-gray-800'>Present Stock</span>
            //     <input {...register('presentStock')} className='w-full block border border-gray-300 rounded-md p-1' />
            //   </div>
            // </div>
          )
          }

          <ul className="space-y-2 font-medium mt-5 text-sm">
            <li onClick={() => handleFileId(files?.PHOTO)}>
              <a className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                  <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                </svg>
                <span className="ms-3">Photo</span>
              </a>
            </li>
            <li onClick={() => handleFileId(files?.DRAWING)} >
              <a className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                  <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Drawing</span>
              </a>
            </li>
            <li onClick={() => handleFileId(files?.PROCESS)}>
              <a className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 flex-shrink-0 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                  <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Process</span>
              </a>
            </li>
            <li onClick={() => handleFileId(files?.SELLER_DETAILS)}>
              <a className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer">
                <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Seller Details</span>
              </a>
            </li>
            <li onClick={() => handleFileId(files?.PURCHASE_DETAILS)}>
              <a className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer">
                <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                  <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Purchase Details</span>
              </a>
            </li>
            <li onClick={() => handleFileId(files?.INSPECTION_DETAILS)}>
              <a className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white">
                  <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Inspection Details</span>
              </a>
            </li>
            <li onClick={() => handleFileId(files?.CUSTOMER_COMPLAINT)}>
              <a className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer">
                <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z" />
                  <path d="M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397Z" />
                  <path d="M8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Customer Complaint</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>
      {/* main screen */}
      <div className='relative sm:ml-64 flex flex-col h-screen'>
        <div>
          <button onClick={() => setSidebarOpenForMobile(true)} aria-controls="default-sidebar" type="button" className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
            <span className="sr-only">Open sidebar</span>
            <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
            </svg>
          </button>
        </div>
        {viewOnly ? (
          <>
            {isLoading ? (
              <Loader />
            ) : (
              <PDFViewer fileID={selectfileId} />
            )}
          </>
        ) : (
          <FileInput />
        )}

        <div className='flex justify-evenly p-2 bg-gray-200'>
          <button className='px-2 py-1 rounded-md border border-gray-500'>Add</button>
          <button className='px-2 py-1 rounded-md border border-gray-500'>Search</button>
          <button onClick={() => router.push('/product/edit')} className='px-2 py-1 rounded-md border border-gray-500'>Edit</button>
          <button className='px-2 py-1 rounded-md border border-gray-500'>Clear</button>
          <button className='px-2 py-1 rounded-md border border-gray-500'>Upload</button>
          <button className='px-2 py-1 rounded-md border border-gray-500'>download</button>
        </div>
      </div>
    </>

  )
}

export default ProductPage