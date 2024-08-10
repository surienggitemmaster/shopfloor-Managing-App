import { Inter } from "next/font/google";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchInput, setSearchInput] = useState();

  useEffect(() => {
    if ((status != "loading") && (!session)) {
      router.push('/login'); // Redirect if not admin
    }
  }, [session, status]);

  const handleSearch = () => {
    console.log("search triggered")
  }


  const data = [{
    productId: '1235CD',
    itemName: 'manifold',
    sellingRate: 25,
    presentStock: 250
  }, {
    productId: '573CD',
    itemName: 'screw',
    sellingRate: 67,
    presentStock: 10
  }, {
    productId: '35KA',
    itemName: 'hammer',
    sellingRate: 560,
    presentStock: 200

  }, {
    productId: '439234A',
    itemName: 'driver plate',
    sellingRate: 90,
    presentStock: 50
  }
  ]

  return (
    <main className={`flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-gray-200 to-gray-400 ${inter.className}`}>
      <Header />
      <div className='py-10'>
        <div className='max-w-4xl mx-auto bg-white md:rounded-md shadow-md'>
          <div className='p-5 flex gap-5'>
            <form onSubmit={handleSearch} className='flex flex-auto items-center space-x-2 rounded-md border border-gray-200 bg-gray-100'>
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className='w-full block p-2 bg-gray-100 outline-none text-sm' type='text' placeholder='Search by Product ID or Product Name...' />
              <button type='submit'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </form>
            <button onClick={() => router.push(`/product/add`)} className="bg-blue-300 rounded-md border-blue-400 py-1.5 px-2">Add Product</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap">Product Id</th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap">Product name</th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap">Selling Price</th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap">Present Stock</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((row) => {
                  return (
                    <tr onClick={() => router.push(`/product/${row.productId}`)} key={row.productId} className="border-b hover:bg-gray-100 cursor-pointer">

                      <th scope='row' className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                        {row.productId}
                      </th>
                      <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{row.itemName} </td>
                      <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{row.sellingRate} </td>
                      <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{row.presentStock} </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main >
  );
}
