import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFPreviewOverlay = ({ show, handleClose, pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (!show) return null;

  return (
    <div className="overlay">
      <div className="overlay-content">
        <button className="close-button" onClick={handleClose}>
          Close
        </button>
        {pdfUrl ? (
          <Document file={pdfUrl} onLoadSuccess={onLoadSuccess}>
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
          </Document>
        ) : (
          <p>No PDF available</p>
        )}
      </div>
    </div>
  );
};

export default PDFPreviewOverlay;
