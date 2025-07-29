// components/Loader.js
import React from 'react';

const Loader = () => {
    return (
        <div className="flex items-center justify-center min-h-[200px]">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
            </div>
            <div className="ml-4">
                <div className="text-sm text-gray-600 font-medium">Loading...</div>
                <div className="text-xs text-gray-400">Please wait</div>
            </div>
        </div>
    );
};

export default Loader;
