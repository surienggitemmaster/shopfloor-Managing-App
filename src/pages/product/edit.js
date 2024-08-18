import AddEdit from '@/components/AddEdit';
import { useProductContext } from '@/contexts/ProductContext';
import React, { useEffect } from 'react'

function editProduct() {
    const { productData, productFiles, setProductData, setProductFiles } = useProductContext();
    useEffect(() => {
        const savedData = localStorage.getItem('productData');
        if (productData === null) {
            setProductData(JSON.parse(savedData));
        }
        const savedFiles = localStorage.getItem('productFiles');
        if (productFiles === null) {
            setProductFiles(JSON.parse(savedFiles));
        }
    }, []);
    return (
        <AddEdit edit productData={productData} productFiles={productFiles} />
    )
}

export default editProduct