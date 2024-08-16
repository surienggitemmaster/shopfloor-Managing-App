import { useState, createContext, useContext, useEffect } from "react";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [productData, setProductData] = useState(null);
    const [productFiles, setProductFiles] = useState(null);

    return (
        <ProductContext.Provider value={{ productData, productFiles, setProductData, setProductFiles }}>
            {children}
        </ProductContext.Provider>
    )
}

export const useProductContext = () => {
    return useContext(ProductContext);
};
