import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';

const PDFPreviewOverlay = ({ show, handleClose, pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);

  const onLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (!show) return null; // Return null if the modal is not shown

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '80%',
          width: 'auto',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Drop Application PDF</h3>
          <button
            onClick={handleClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'red',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
        <div style={{ overflowY: 'auto' }}>
          {pdfUrl ? (
            <Document file={pdfUrl} onLoadSuccess={onLoadSuccess}>
              {[...Array(numPages)].map((_, index) => (
                <Page key={index} pageNumber={index + 1} />
              ))}
            </Document>
          ) : (
            <p>No PDF available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewOverlay;
