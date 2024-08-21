import { Inter } from "next/font/google";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
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

  return (
    <main className={`flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-gray-200 to-gray-400 ${inter.className}`}>
      <Header />
      <div className='py-5'>
        <div className='max-w-4xl mx-auto bg-white md:rounded-md shadow-md'>
          <div className='p-3 flex gap-5'>
            <form onSubmit={handleSearch} className='flex flex-auto items-center space-x-2 rounded-md border border-gray-200 bg-gray-100'>
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value.toLowerCase())} className='w-full block p-2 bg-gray-100 outline-none text-sm' type='text' placeholder='Search by Product ID or Product Name...' />
              <button type='submit'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </form>
            {session.user?.name == 'Admin User' &&
              <button onClick={() => router.push(`/product/add`)} className="bg-blue-500 rounded-md border-blue-400 py-1.5 px-2 text-sm text-white">Add Product</button>}
          </div>
          <div className="overflow-x-auto">
            {!isLoading && records ? (
              <>
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                    <tr>
                      <th scope="col" className="px-4 py-3 whitespace-nowrap">Product Id</th>
                      <th scope="col" className="px-4 py-3 whitespace-nowrap">Product name</th>
                      <th scope="col" className="px-4 py-3 whitespace-nowrap">Selling Price</th>
                      <th scope="col" className="px-4 py-3 whitespace-nowrap">Present Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records?.map((row) => {
                      return (
                        <tr onClick={() => handleClick(row)} key={row.PRODUCT_ID} className="border-b hover:bg-gray-100 cursor-pointer transition-colors duration-200">

                          <th scope='row' className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                            {row.PRODUCT_ID}
                          </th>
                          <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{row.PRODUCT_NAME} </td>
                          <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{row.SELLING_PRICE} </td>
                          <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{row.PRESENT_STOCK} </td>

                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="flex justify-between items-center p-2 space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <div className="flex flex-wrap w-3/4 items-center justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`size-8 rounded-md ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'} hover:bg-gray-300`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </>
            ) : <Loader />}
          </div>
        </div>
      </div>
    </main >
  );
}
