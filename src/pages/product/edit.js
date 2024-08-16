import AddEdit from '@/components/AddEdit';
import { useProductContext } from '@/contexts/ProductContext';
import React from 'react'

function editProduct() {
    const { productData, productFiles } = useProductContext();
    console.log(productData);
    return (
        <AddEdit edit productData={productData} productFiles={productFiles} />
    )
}

export default editProduct