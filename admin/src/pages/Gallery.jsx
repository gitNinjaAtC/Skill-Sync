import React from "react";
import "./gallery.scss";

const Gallery = () => {
  const startYear = 2007;
  const batchSpan = 4; // e.g., 2007–2011
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed: Sept = 8

  const batches = [];

  // Determine the last start year allowed
  const lastStartYear = currentMonth >= 8 ? currentYear : currentYear - 1;

  for (let year = startYear; year <= lastStartYear; year++) {
    batches.push({ start: year, end: year + batchSpan });
  }

  return (
    <div className="gallery-page">
      <h1>Alumni Gallery</h1>
      <div className="batch-container">
        {batches.map((batch, index) => (
          <div className="batch-card" key={index}>
            <h3>Batch {batch.start} - {batch.end}</h3>
            <p>Photos and memories of batch {batch.start} to {batch.end}</p>
            <div className="button-group">
              <button>View</button>
              <button className="upload-btn">Upload</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
