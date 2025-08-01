import React, { createContext, useState, useContext } from 'react';

const PdfTextContext = createContext();

export function PdfTextProvider({ children }) {
  const [pdfText, setPdfText] = useState('');
  const [jobRole, setJobRole] = useState('');
  return (
    <PdfTextContext.Provider value={{ pdfText, setPdfText, jobRole, setJobRole }}>
      {children}
    </PdfTextContext.Provider>
  );
}

export function usePdfText() {
  return useContext(PdfTextContext);
}
