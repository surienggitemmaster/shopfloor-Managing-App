import { useRouter } from 'next/router'
import React, { useState, useRef, useEffect } from 'react'
import { useSession } from "next-auth/react";
import axios from 'axios';
import PDFViewer from '@/components/Pdfviewer';
import Loader from '@/components/Loader';
import AddEdit from '@/components/AddEdit';
import toast from 'react-hot-toast';
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const ProductPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpenForMobile, setSidebarOpenForMobile] = useState(false);
  const refForSidebar = useRef(null);
  const [folderId, setFolderId] = useState(null);
  const [expandOtherFiles, setExpandOtherFiles] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectfileId, setSelectfileId] = useState(null);
  const { id, name, price, stock } = router.query;
  const [activeTab, setActiveTab] = useState('photo'); // Set photo as default
  //const { productData } = useProductContext();
  const viewOnly = true;
  const [isLoading, setIsLoading] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editProductData, setEditProductData] = useState(null);

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
        const response = await axios.get(`/api/drive?&folderId=1QRte-54NhRbh_SCtofIor6ccBA_8aVYT`);
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
      localStorage.setItem('productFiles', JSON.stringify(tempObj));
      setSelectfileId(tempObj?.PHOTO);
      setActiveTab('photo'); // Ensure photo is set as default
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


  const handleDownload = () => {
    const downloadUrl = `https://drive.usercontent.google.com/uc?id=${selectfileId}&authuser=0&export=download`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    // Trigger the download
    link.click();
  };

  const onDeleteProduct = (folderName) => {
    const toastId = toast.loading('Deleting item...')
    fetch(`/api/item/edit?folderName=${folderName}`, {
      method: 'DELETE',
    }).then((res) => {
      if (res.status === 200) {
        toast.success('Deleted successfully!');
        router.push('/');
      }
    }).catch((err) => {
      toast.error('Something went wrong.');
    }).finally(() => toast.dismiss(toastId));
  }

  const handleFileId = (e) => {
    setSelectfileId(e.value)
    setActiveTab(e.key)
  }

  const openAddModal = () => {
    setModalMode('add');
    setEditProductData(null);
    setIsModalOpen(true);
  };

  const openEditModal = () => {
    setModalMode('edit');
    setEditProductData({
      productId: id,
      productName: name,
      sellingPrice: price,
      presentStock: stock
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProductData(null);
  };

  // to filter other files in the files state
  const fieldsToExclude = [
    "drawing",
    "customerComplaint",
    "photo",
    "billOfMaterial",
    "rateDetails",
    "inspectionDetails",
    "process"
  ];

  const otherFiles = Object.keys(files).filter(fileName => !fieldsToExclude.includes(fileName));

  const sidebarItems = [
    { key: 'photo', value: files?.PHOTO, label: 'Photo', icon: 'photo' },
    { key: 'drawing', value: files?.DRAWING, label: 'Drawing', icon: 'drawing' },
    { key: 'process', value: files?.PROCESS, label: 'Process', icon: 'process' },
    { key: 'sellerDetails', value: files?.SELLER_DETAILS, label: 'Seller Details', icon: 'seller' },
    { key: 'purchaseDetails', value: files?.PURCHASE_DETAILS, label: 'Purchase Details', icon: 'purchase' },
    { key: 'inspectionDetails', value: files?.INSPECTION_DETAILS, label: 'Inspection Details', icon: 'inspection' },
    { key: 'customerComplaint', value: files?.CUSTOMER_COMPLAINT, label: 'Customer Complaint', icon: 'complaint' }
  ];

  const getIcon = (iconType) => {
    const icons = {
      photo: <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />,
      drawing: <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />,
      process: <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />,
      seller: <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />,
      purchase: <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />,
      inspection: <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />,
      complaint: <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z" />
    };
    return icons[iconType] || icons.photo;
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      {/* Sidebar */}
      <aside 
        ref={refForSidebar} 
        className={`fixed top-0 left-0 z-40 w-80 h-screen transition-transform duration-300 ease-in-out ${
          sidebarOpenForMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full sidebar-container shadow-xl">
          {/* Mobile close button */}
          <div className="lg:hidden sidebar-header flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold">Product Details</h2>
            <button 
              onClick={() => setSidebarOpenForMobile(false)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Product Info Card */}
          <div className="p-6 border-b border-blue-200 bg-white/50 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Product ID</span>
                <span className="text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded">{id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Product Name</span>
                <span className="text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded">{name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Selling Price</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ${price}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Stock Level</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {stock} units
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4">
            <h3 className="sidebar-section-title">Documents</h3>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleFileId({ key: item.key, value: item.value })}
                  className={`sidebar-item w-full ${activeTab === item.key ? 'active' : ''}`}
                >
                  <svg className="sidebar-icon" fill="currentColor" viewBox="0 0 24 24">
                    {getIcon(item.icon)}
                  </svg>
                  <span>{item.label}</span>
                </button>
              ))}
              
              {otherFiles.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setExpandOtherFiles(!expandOtherFiles)}
                    className="sidebar-item w-full"
                  >
                    <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span>Other Files</span>
                  </button>
                  
                  {expandOtherFiles && (
                    <div className="ml-8 mt-2 space-y-1">
                      {otherFiles.map((fileName) => (
                        <button
                          key={fileName}
                          onClick={() => handleFileId({ key: fileName, value: files[fileName] })}
                          className="sidebar-item w-full text-sm"
                        >
                          <span>{fileName}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpenForMobile(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">{name}</h1>
              <p className="text-sm text-gray-500">ID: {id}</p>
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="h-screen lg:h-screen">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          ) : (
            <PDFViewer fileID={selectfileId} />
          )}
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-80 bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-center space-x-3">
            {session?.user?.name == 'Admin User' && (
              <>
                <button 
                  onClick={openAddModal} 
                  className="btn-secondary text-sm"
                >
                  Add
                </button>
                <button 
                  onClick={openEditModal} 
                  className="btn-secondary text-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDeleteProduct(id)} 
                  className="btn-danger text-sm"
                >
                  Delete
                </button>
              </>
            )}
            <button className="btn-primary text-sm">
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AddEdit
        isOpen={isModalOpen}
        onClose={closeModal}
        edit={modalMode === 'edit'}
        productData={editProductData}
      />
    </div>
  )
}

export default ProductPage