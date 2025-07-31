import React, { createContext, useState, useContext } from 'react';

const PdfTextContext = createContext();

export function PdfTextProvider({ children }) {
  const [pdfText, setPdfText] = useState('');
  return (
    <PdfTextContext.Provider value={{ pdfText, setPdfText }}>
      {children}
    </PdfTextContext.Provider>
  );
}

export function usePdfText() {
  return useContext(PdfTextContext);
}
