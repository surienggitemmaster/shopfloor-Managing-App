import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react"
import { Toaster } from "react-hot-toast";
import { ProductProvider } from "@/contexts/ProductContext";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Toaster />
      <ProductProvider>
        <Component {...pageProps} />
      </ProductProvider>
    </SessionProvider>
  )
}
