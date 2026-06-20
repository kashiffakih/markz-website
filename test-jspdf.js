import jsPDF from 'jspdf';
console.log("typeof jsPDF:", typeof jsPDF);
if (typeof jsPDF === 'object') {
  console.log("keys:", Object.keys(jsPDF));
  console.log("typeof jsPDF.jsPDF:", typeof jsPDF.jsPDF);
  console.log("typeof jsPDF.default:", typeof jsPDF.default);
}
