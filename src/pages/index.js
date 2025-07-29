import { Inter } from "next/font/google";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import AddEdit from "@/components/AddEdit";
import axios from 'axios';
import Loader from "@/components/Loader";
import { useProductContext } from "@/contexts/ProductContext";


const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState(null);
  //keeping track of all excel data
  const [excelData, setExcelData] = useState([]);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const { setProductData } = useProductContext();

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
    const fetchExcelData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/xlsrecord?&fileId=1aPun_wNfE1s8E3BHzwq9WImBVvKdxHgcdxYiO-0-sNk&mimeType=application/vnd.google-apps.spreadsheet`);
        setData(response.data);
        setExcelData(response.data);
      } catch (error) {
        console.error('Error fetching Excel data:', error);
      }
      setIsLoading(false);
    }
    fetchExcelData();
  }, [])


  useEffect(() => {
    // Update records based on current page when data or currentPage changes
    setTotalPages(Math.ceil(data?.length / itemsPerPage));
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    setRecords(data?.slice(indexOfFirstItem, indexOfLastItem));
  }, [data, currentPage, itemsPerPage]);

  const handleClick = (row) => {
    setProductData({
      productId: row.PRODUCT_ID,
      productName: row.PRODUCT_NAME,
      sellingPrice: row.SELLING_PRICE,
      presentStock: row.PRESENT_STOCK
    })
    localStorage.setItem('productData', JSON.stringify({
      productId: row.PRODUCT_ID,
      productName: row.PRODUCT_NAME,
      sellingPrice: row.SELLING_PRICE,
      presentStock: row.PRESENT_STOCK
    }));
    router.push({
      pathname: `/product/${row.PRODUCT_ID}`,
      query: {
        name: row.PRODUCT_NAME,
        price: row.SELLING_PRICE,
        stock: row.PRESENT_STOCK
      }
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const filteredData = excelData.filter((row) => {
      return (
        row.PRODUCT_ID.toString().toLowerCase().includes(searchInput) ||
        row.PRODUCT_NAME.toLowerCase().includes(searchInput)
      )
    })
    setData(filteredData);
    //setTotalPages(Math.ceil(filter?.length / itemsPerPage));
    setCurrentPage(1);
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditProductData(null);
    setIsModalOpen(true);
  };

  const openEditModal = (productData) => {
    setModalMode('edit');
    setEditProductData(productData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProductData(null);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Inventory</h1>
          <p className="text-gray-600">Manage and view your product catalog</p>
        </div>
        
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <input 
                    value={searchInput} 
                    onChange={(e) => setSearchInput(e.target.value.toLowerCase())} 
                    className="input-field pl-10" 
                    type="text" 
                    placeholder="Search by Product ID or Name..." 
                  />
                </div>
              </form>
              
              {session?.user?.name == 'Admin User' && (
                <button 
                  onClick={openAddModal} 
                  className="btn-primary flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Product</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-hidden">
            {!isLoading && records ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="table-header">Product ID</th>
                        <th className="table-header">Product Name</th>
                        <th className="table-header">Selling Price</th>
                        <th className="table-header">Present Stock</th>
                        {session?.user?.name == 'Admin User' && (
                          <th className="table-header">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {records?.map((row) => (
                        <tr 
                          key={row.PRODUCT_ID} 
                          className="table-row-hover"
                        >
                          <td 
                            className="table-cell font-medium text-gray-900 cursor-pointer"
                            onClick={() => handleClick(row)}
                          >
                            {row.PRODUCT_ID}
                          </td>
                          <td 
                            className="table-cell text-gray-900 cursor-pointer"
                            onClick={() => handleClick(row)}
                          >
                            {row.PRODUCT_NAME}
                          </td>
                          <td 
                            className="table-cell cursor-pointer"
                            onClick={() => handleClick(row)}
                          >
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ${row.SELLING_PRICE}
                            </span>
                          </td>
                          <td 
                            className="table-cell cursor-pointer"
                            onClick={() => handleClick(row)}
                          >
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {row.PRESENT_STOCK} units
                            </span>
                          </td>
                          {session?.user?.name == 'Admin User' && (
                            <td className="table-cell">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => openEditModal({
                                    productId: row.PRODUCT_ID,
                                    productName: row.PRODUCT_NAME,
                                    sellingPrice: row.SELLING_PRICE,
                                    presentStock: row.PRESENT_STOCK
                                  })}
                                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleClick(row)}
                                  className="p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                                  title="View Details"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-white px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors duration-200 ${
                              currentPage === index + 1 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} results
                    </div>
                  </div>
                </div>
              </>
            ) : <Loader />}
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
  );
}
