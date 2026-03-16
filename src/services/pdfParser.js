const PDFParser = require("pdf2json");
const fs = require("fs");

function extractText(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));

    pdfParser.on("pdfParser_dataReady", pdfData => {
      let text = "";

      pdfData.Pages.forEach(page => {
        page.Texts.forEach(textItem => {
          text += decodeURIComponent(textItem.R[0].T) + " ";
        });
      });

      resolve(text);
    });

    pdfParser.loadPDF(filePath);
  });
}

module.exports = { extractText };