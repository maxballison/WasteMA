// src/components/WasteManagementInfo.js

import React from 'react';

function WasteManagementInfo({ data }) {
  return (
    <div>
      <h2>Waste Management Information for {data.Municipality}</h2>
      <p>
        <strong>Total Number of Households:</strong>{' '}
        {data['Total Number of Households'] || 'N/A'}
      </p>
      <p>
        <strong>Households Served by Municipal Trash Program:</strong>{' '}
        {data['Households Served by Municipal Trash Program'] || 'N/A'}
      </p>
      <p>
        <strong>Households Served by Municipal Recycling Program:</strong>{' '}
        {data['Households Served by Municipal Recycling Program'] || 'N/A'}
      </p>
      <p>
        <strong>Trash Service Type:</strong>{' '}
        {data['Trash Service Type'] || 'N/A'}
      </p>
      <p>
        <strong>Recycling Service Type:</strong>{' '}
        {data['Recycling Service Type'] || 'N/A'}
      </p>
      {/* Add more details as needed */}
    </div>
  );
}

export default WasteManagementInfo;