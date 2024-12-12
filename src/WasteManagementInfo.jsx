import React from 'react';
import { Typography, Box } from '@mui/material';

function WasteManagementInfo({ data }) {
  const totalHouseholds = parseInt(data['Total Number of Households'] || 0, 10);
  const trashServed = parseInt(data['Households Served by Municipal Trash Program'] || 0, 10);
  const recyclingServed = parseInt(data['Households Served by Municipal Recycling Program'] || 0, 10);
  const trashPercentage = totalHouseholds > 0 ? ((trashServed / totalHouseholds) * 100).toFixed(0) : 0;
  const recyclingPercentage = totalHouseholds > 0 ? ((recyclingServed / totalHouseholds) * 100).toFixed(0) : 0;
  const municipalContact = data['Municipal Contact Name'];

  const annualFee = data['What is the Annual Fee?'] === '- - DID NOT REPORT - -' ? 'No data available' : `$${parseInt(data['What is the Annual Fee?'] || 0, 10)}`;
  const compostBins = data['Compost Bin Distribution Program'] === 'Yes' ? 'do' : 'do not';
  const serviceType = data['Trash Service Type'];
  const recyclingType = data['Recycling Service Type'];
  const yardWasteCurbsideWeeks = data['Yard Waste # of Weeks Collected Curbside'];
  const yardWasteDropoffWeeks = data['Yard Waste # of Weeks¬† Drop-off Center is Open to Residents'];
  const enforcedTrashLimits = data['Enforced Trash Limits at Curb'] === 'Yes' ? 'are' : 'are not';
  const mandatoryRecycling = data['Enforced Mandatory Recycling'] === 'Yes' ? 'is' : 'is not';
  const bulkyWasteFee = data['Fee for Bulky Waste?'] === 'Yes' ? 'is a fee for bulky waste collection.' : 'is no fee for bulky waste collection.';

  let contactInfo = "";
  if (municipalContact === '- - DID NOT REPORT - -') {
    contactInfo = "No data available for municipal contact information.";
  } else {
    contactInfo = `The municipal contact is ${municipalContact}.`;
  }

  return (
    <Box>
      {municipalContact === '- - DID NOT REPORT - -' ? (
        <Typography>{contactInfo}</Typography>
      ) : (
        <>
          <Typography>
            In <strong>{data.Municipality}</strong>, <strong>{trashPercentage}%</strong> of households (<strong>{trashServed}</strong> out of <strong>{totalHouseholds}</strong>) are served by the municipal trash program, and <strong>{recyclingPercentage}%</strong> of households (<strong>{recyclingServed}</strong> out of <strong>{totalHouseholds}</strong>) are served by the municipal recycling program.
          </Typography>
          <Typography>
            Trash service is <strong>{serviceType}</strong>, and recycling service is <strong>{recyclingType}</strong>. They <strong>{compostBins}</strong> provide compost bins.
          </Typography>
          <Typography>
            There <strong>{enforcedTrashLimits}</strong> enforced trash limits at the curb, and mandatory recycling <strong>{mandatoryRecycling}</strong> enforced. There <strong>{bulkyWasteFee}</strong>
          </Typography>
          <Typography>
            There are <strong>{yardWasteCurbsideWeeks}</strong> weeks of curbside yard waste collection and the drop-off center is open for <strong>{yardWasteDropoffWeeks}</strong> weeks.
          </Typography>
          <Typography>
            The annual fee is <strong>{annualFee}</strong>.
          </Typography>
        </>
      )}
    </Box>
  );
}

export default WasteManagementInfo;