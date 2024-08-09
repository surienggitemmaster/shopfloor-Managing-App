import { Inter } from "next/font/google";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import axios from 'axios';
import Loader from "@/components/Loader";


const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchInput, setSearchInput] = useState();
  const [records, setRecords] = useState(null);

  useEffect(() => {
    if ((status != "loading") && (!session)) {
      router.push('/login'); // Redirect if not admin
    }
  }, [session, status]);

  useEffect(() => {
    const fetchExcelData = async () => {
      try {
        const response = await axios.get(`/api/xlsrecord?&fileId=12q5sIXMZbnYivXmMLfIspb73_i0MuDFsY_gMRty4QRI&mimeType=application/vnd.google-apps.spreadsheet`);
        setRecords(response.data);
      } catch (error) {
        console.error('Error fetching Excel data:', error);
      }
    }
    if (records === null || records === undefined) {
      fetchExcelData();
    }
  }, [])

  const handleClick = (id) => {
    const propsToPass = { id: id };
    router.push({
      pathname: `/product`,
      query: propsToPass,
    });
  };

  const handleSearch = () => {
    console.log("search triggered")
  }

  return (
    <main className={`flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-gray-200 to-gray-400 ${inter.className}`}>
      <Header />
      <div className='py-10'>
        <div className='max-w-4xl mx-auto bg-white md:rounded-md shadow-md'>
          <div className='p-5'>
            <form onSubmit={handleSearch} className='flex items-center space-x-2 rounded-md border border-gray-200 bg-gray-100'>
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className='w-full block p-2 bg-gray-100 outline-none text-sm' type='text' placeholder='Search by Product ID or Product Name...' />
              <button type='submit'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </form>
          </div>
          <div className="overflow-x-auto">
            {records ? (<table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
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
                    <tr onClick={() => handleClick(row.PRODUCT_ID)} key={row.PRODUCT_ID} className="border-b hover:bg-gray-100 cursor-pointer">

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
            </table>) : <Loader />}
          </div>
        </div>
      </div>
    </main >
  );
}
