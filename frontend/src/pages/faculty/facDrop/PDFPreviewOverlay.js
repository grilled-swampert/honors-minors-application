import React, { useState, useCallback } from "react";
import { pdfjs, Document, Page } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.worker.min.js';

const PDFPreviewOverlay = ({ show, handleClose, pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [error, setError] = useState(null);

  const onLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setError(null); // Reset any previous errors
  }, []);

  const onLoadError = useCallback((error) => {
    console.error("Error loading PDF:", error);
    setError("Failed to load PDF. Please try again later.");
  }, []);

  if (!show) return null;

  return (
    <div
      className="overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="overlay-content"
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "80%",
          maxHeight: "80%",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          className="close-button"
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            color: "#000000",
            width: "30px",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            zIndex: "10",
          }}
          aria-label="Close"
        >
          &times;
        </button>
        {error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : pdfUrl ? (
          <Document
            file={pdfUrl}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
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
