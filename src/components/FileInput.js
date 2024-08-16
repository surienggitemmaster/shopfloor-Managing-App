import React, { useState } from 'react';

const FileInput = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Handle file input change
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
        }
    };

    // // Handle file input reset
    // const handleReset = () => {
    //     setSelectedFile(null);
    //     setPreviewUrl(null);
    // };

    return (
        <div className="h-full flex items-center justify-center">
            <div className="flex flex-col justify-center p-10 border-2 border-gray-300 border-dashed rounded-md cursor-pointer" >

                <label className="block text-sm font-medium text-gray-700">Upload File</label>
                <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                {/* {previewUrl && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700">Preview:</h4>
                        <img
                            src={previewUrl}
                            alt="File preview"
                            className="mt-2 w-32 h-32 object-cover rounded-md"
                        />
                        <button
                            onClick={handleReset}
                            className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md"
                        >
                            Reset
                        </button>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default FileInput;