
import React from "react";

const CropperHeader = () => {
  return (
    <div className="text-center space-y-3">
      <h3 className="text-xl font-bold text-gray-900">Choose Canvas Orientation</h3>
      <p className="text-sm text-gray-600 max-w-2xl mx-auto">
        Select your preferred canvas orientation and adjust the crop to highlight the best part of your photo. 
        Your choice here will be used throughout the process.
      </p>
    </div>
  );
};

export default CropperHeader;
