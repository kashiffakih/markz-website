import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateInvoice } from './app/utils/invoiceService.ts';
const mockOrder = {
  id: 1,
  created_at: new Date(),
  user: { first_name: "Test" },
  order_details: []
};
try {
  generateInvoice(mockOrder);
  console.log("Success");
} catch (e) {
  console.error("Error:", e);
}
