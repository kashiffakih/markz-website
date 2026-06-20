// Simple NumberToWords Implementation
export class NumberToWords {
  static units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  static tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  static convert(num: number): string {
    if (num === 0) return 'Zero';
    return this._convert(num);
  }

  static _convert(num: number): string {
    if (num < 20) return this.units[num];
    if (num < 100) {
      return this.tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + this.units[num % 10] : '');
    }
    if (num < 1000) {
      return this.units[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + this._convert(num % 100) : '');
    }
    if (num < 100000) {
      return this._convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + this._convert(num % 1000) : '');
    }
    if (num < 10000000) {
      return this._convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + this._convert(num % 100000) : '');
    }
    return this._convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + this._convert(num % 10000000) : '');
  }
}

export const generateInvoice = async (order: any, defaultAddress: any = null) => {
  const { jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = (typeof autoTableModule === 'function' ? autoTableModule : (autoTableModule as any).default || autoTableModule) as any;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const orderDetails = order.order_details || [];

  const safeParse = (value: any) => {
    if (!value) return 0.0;
    const num = parseFloat(value.toString());
    return isNaN(num) ? 0.0 : num;
  };

  const buyerAddress = defaultAddress || order.address || {};
  const consigneeAddress = order.address || {};

  const isMaharashtra = buyerAddress.state?.toString().toLowerCase() === 'maharashtra';
  const orderId = order.id?.toString() || '';
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).replace(/ /g, '-')
    : '';

  const formatAddr = (addr: any) => {
    return [
      addr.add_1,
      addr.add_2,
      addr.city,
      addr.state,
      addr.pincode,
      'INDIA'
    ].filter(e => e && e.toString().trim() !== '').join(', ');
  };

  const userName = order.user ? `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() : 'Valued Customer';
  const userPhone = order.user?.phone?.toString() || '';

  const buyerName = buyerAddress.full_name?.toString() || buyerAddress.name?.toString() || userName;
  const buyerAddressStr = formatAddr(buyerAddress);
  const buyerPhone = buyerAddress.phone?.toString() || userPhone;
  const buyerState = buyerAddress.state?.toString() || 'Maharashtra';

  const consigneeName = consigneeAddress.full_name?.toString() || consigneeAddress.name?.toString() || userName;
  const consigneeAddressStr = formatAddr(consigneeAddress);
  const consigneePhone = consigneeAddress.phone?.toString() || userPhone;
  const consigneeState = consigneeAddress.state?.toString() || buyerState;

  const totalAmount = safeParse(order.total_amount);
  const taxAmount = safeParse(order.tax_amount);
  const deliveryCharge = safeParse(order.delivery_amount);
  const packingCharge = safeParse(order.packaging_amount);
  const platformFee = safeParse(order.platform_fee);
  const couponDiscount = safeParse(order.coupon_amount);
  const walletUsed = safeParse(order.wallet_amount_used);

  let taxableValue = 0;
  orderDetails.forEach((item: any) => {
    const product = item.product || {};
    const quantity = safeParse(item.quantity);
    const prices = product.product_prices || [];
    const priceObj = prices.length > 0 ? prices[0] : {};
    const unitPrice = safeParse(priceObj.offer_price || priceObj.price);
    const taxableRate = unitPrice / 1.05;
    taxableValue += taxableRate * quantity;
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Set fonts
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  
  // Title
  doc.text("Tax Invoice", pageWidth / 2, 15, { align: "center" });
  doc.setLineWidth(0.5);
  doc.line((pageWidth / 2) - 15, 16, (pageWidth / 2) + 15, 16); // Underline

  // Outline Box
  const startX = 10;
  const startY = 20;
  const contentWidth = pageWidth - 20;
  doc.rect(startX, startY, contentWidth, 260); // Main boundary

  // Top Section: Company & Invoice Info
  const colHalf = startX + (contentWidth / 2);
  doc.line(colHalf, startY, colHalf, startY + 45); // Vertical split

  // Company Info
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Raza Trading Co.", startX + 2, startY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("607,Khadan Rd,Near Gupta Sizing", startX + 2, startY + 10);
  doc.text("Land Mark Prime Hospital,Kalyan Rd,&", startX + 2, startY + 14);
  doc.text("Aqs Bibi Masjid,Bhiwandi", startX + 2, startY + 18);
  doc.text("27AAKPF0827G1ZX", startX + 2, startY + 22);
  doc.text("GSTIN/UIN: 27AAKPF0827G1ZX", startX + 2, startY + 26);
  doc.text("State Name : Maharashtra, Code : 27", startX + 2, startY + 30);
  doc.text("Contact : 7066009926/8600175751", startX + 2, startY + 34);
  doc.text("E-Mail : razafc9226@gmail.com", startX + 2, startY + 38);

  // Invoice Details
  const drawDetailsRow = (y: number, l1: string, v1: string, l2: string, v2: string) => {
    doc.line(colHalf, y, startX + contentWidth, y);
    doc.line(colHalf + (contentWidth / 4), y, colHalf + (contentWidth / 4), y + 7.5);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(l1, colHalf + 2, y + 3);
    doc.setFont("helvetica", "bold");
    if(v1) doc.text(v1, colHalf + 2, y + 6);
    
    doc.setFont("helvetica", "normal");
    doc.text(l2, colHalf + (contentWidth / 4) + 2, y + 3);
    doc.setFont("helvetica", "bold");
    if(v2) doc.text(v2, colHalf + (contentWidth / 4) + 2, y + 6);
  };

  drawDetailsRow(startY, "Invoice No.", orderId, "Dated", orderDate);
  drawDetailsRow(startY + 7.5, "Delivery Note", "", "Mode/Terms of Payment", "");
  drawDetailsRow(startY + 15, "Reference No. & Date.", "", "Other References", "");
  drawDetailsRow(startY + 22.5, "Buyer's Order No.", "", "Dated", "");
  drawDetailsRow(startY + 30, "Dispatch Doc No.", "", "Delivery Note Date", "");
  drawDetailsRow(startY + 37.5, "Dispatched through", "", "Destination", "");
  doc.line(colHalf, startY + 45, startX + contentWidth, startY + 45); // close last row

  // Consignee Section
  doc.line(startX, startY + 45, startX + contentWidth, startY + 45); // Horizontal line
  doc.line(colHalf, startY + 45, colHalf, startY + 75); // Vertical split

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Consignee (Ship to)", startX + 2, startY + 49);
  doc.setFont("helvetica", "bold");
  doc.text(consigneeName, startX + 2, startY + 53);
  doc.setFont("helvetica", "normal");
  const consigneeAddressLines = doc.splitTextToSize(consigneeAddressStr, (contentWidth / 2) - 4);
  doc.text(consigneeAddressLines, startX + 2, startY + 57);
  doc.text(`GSTIN/UIN     :     27AAKPF0827G1ZX`, startX + 2, startY + 65);
  doc.text(`State Name     :     ${consigneeState}, Code : 27`, startX + 2, startY + 69);
  doc.text(`Contact           :     +91-${consigneePhone}`, startX + 2, startY + 73);

  // Buyer Section
  doc.line(startX, startY + 75, startX + contentWidth, startY + 75); // Horizontal line
  doc.line(colHalf, startY + 75, colHalf, startY + 110); // Vertical split

  doc.setFont("helvetica", "normal");
  doc.text("Buyer (Bill to)", startX + 2, startY + 79);
  doc.setFont("helvetica", "bold");
  doc.text(buyerName, startX + 2, startY + 83);
  doc.setFont("helvetica", "normal");
  const buyerAddressLines = doc.splitTextToSize(buyerAddressStr, (contentWidth / 2) - 4);
  doc.text(buyerAddressLines, startX + 2, startY + 87);
  doc.text(`GSTIN/UIN        :     27AAKPF0827G1ZX`, startX + 2, startY + 95);
  doc.text(`State Name      :     ${buyerState}`, startX + 2, startY + 99);
  doc.text(`Place of Supply :     ${buyerState}`, startX + 2, startY + 103);
  doc.text(`Contact             :     +91-${buyerPhone}`, startX + 2, startY + 107);

  // Items Table
  let currentY = startY + 110;
  doc.line(startX, currentY, startX + contentWidth, currentY); // Horizontal line before table
  
  const tableHead = [
    ["SI No.", "Description of Goods", "HSN/SAC", "Quantity", "Rate", "per", "Amount"]
  ];
  
  const tableBody = orderDetails.map((item: any, index: number) => {
    const product = item.product || {};
    const quantity = safeParse(item.quantity);
    const prices = product.product_prices || [];
    const priceObj = prices.length > 0 ? prices[0] : {};
    const unitPrice = safeParse(priceObj.offer_price || priceObj.price);
    const taxableRate = unitPrice / 1.05;
    const taxableAmount = taxableRate * quantity;

    return [
      (index + 1).toString(),
      product.name?.toString() || '',
      '',
      `${quantity} pcs`,
      taxableRate.toFixed(2),
      'pcs',
      taxableAmount.toFixed(2)
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineWidth: 0.2, lineColor: [0, 0, 0], textColor: [0, 0, 0] },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'normal', halign: 'center' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 70, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 20 },
      5: { halign: 'center', cellWidth: 15 },
      6: { halign: 'right', cellWidth: 30, fontStyle: 'bold' }
    },
    margin: { left: startX, right: 10 }
  });

  currentY = (doc as any).lastAutoTable.finalY;
  
  // Extra Charges
  doc.setFontSize(8);
  doc.setFont("helvetica", "bolditalic");
  const chargeXLabel = startX + 85;
  const chargeXVal = startX + contentWidth - 2;

  const printCharge = (label: string, val: number, prefix: string = '') => {
    if (val <= 0) return;
    currentY += 4;
    let valStr = val.toFixed(2);
    if (prefix === 'Less :') valStr = `(-)${valStr}`;
    doc.text(label, chargeXLabel, currentY, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(valStr, chargeXVal, currentY, { align: "right" });
    doc.setFont("helvetica", "bolditalic");
  };

  if (isMaharashtra) {
    printCharge("Cgst", taxAmount / 2);
    printCharge("Sgst", taxAmount / 2);
  } else {
    printCharge("IGST", taxAmount);
  }
  printCharge("PACKAGE CHARGES", packingCharge);
  printCharge("delivery_charges", deliveryCharge);
  printCharge("PLATFORM FEE", platformFee);
  printCharge("Coupon Exp", couponDiscount, "Less :");
  printCharge("Reward Used", walletUsed, "Less :");

  currentY += 5;
  doc.line(startX, currentY, startX + contentWidth, currentY); // Line before total

  // Total Row
  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Total", chargeXLabel, currentY, { align: "right" });
  
  let totalQty = 0;
  orderDetails.forEach((item: any) => totalQty += safeParse(item.quantity));
  doc.text(`${totalQty} pcs`, startX + 115, currentY, { align: "center" });

  doc.text(`Rs. ${totalAmount.toFixed(2)}`, chargeXVal, currentY, { align: "right" });

  currentY += 3;
  doc.line(startX, currentY, startX + contentWidth, currentY); // Line after total

  // Amount in words
  currentY += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Amount Chargeable (in words)", startX + 2, currentY);
  doc.text("E. & O.E", startX + contentWidth - 2, currentY, { align: "right" });
  currentY += 4;
  doc.setFont("helvetica", "bold");
  const paise = Math.round((totalAmount - Math.floor(totalAmount)) * 100).toString().padStart(2, '0');
  doc.text(`Indian Rupees ${NumberToWords.convert(Math.floor(totalAmount))} and ${paise} paise Only`, startX + 2, currentY);
  
  currentY += 4;
  doc.line(startX, currentY, startX + contentWidth, currentY); // Line before Tax Summary
  
  // Tax Summary
  const taxHead = [
    [
      { content: 'HSN/SAC', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'Taxable\nValue', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'CGST', colSpan: 2, styles: { halign: 'center' } },
      { content: 'SGST/UTGST', colSpan: 2, styles: { halign: 'center' } },
      { content: 'Total\nTax Amount', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
    ],
    ['Rate', 'Amount', 'Rate', 'Amount']
  ];

  const halfTaxStr = (taxAmount / 2).toFixed(2);
  const taxBody = [
    ['', taxableValue.toFixed(2), '2.50%', halfTaxStr, '2.50%', halfTaxStr, taxAmount.toFixed(2)],
    ['Total', taxableValue.toFixed(2), '', halfTaxStr, '', halfTaxStr, taxAmount.toFixed(2)]
  ];

  if (typeof autoTable === 'function') {
    autoTable(doc, {
      startY: currentY,
      head: taxHead,
      body: taxBody,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2, lineWidth: 0.2, lineColor: [0, 0, 0], textColor: [0, 0, 0] },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'normal' },
      margin: { left: startX, right: 10 },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold' },
        1: { halign: 'right', fontStyle: 'bold' },
        2: { halign: 'center' },
        3: { halign: 'right', fontStyle: 'bold' },
        4: { halign: 'center' },
        5: { halign: 'right', fontStyle: 'bold' },
        6: { halign: 'right', fontStyle: 'bold' }
      },
      didParseCell: function (data: any) {
        if (data.row.index === 1 && data.section === 'body') {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
  } else if (typeof (doc as any).autoTable === 'function') {
    (doc as any).autoTable({
      startY: currentY,
      head: taxHead,
      body: taxBody,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2, lineWidth: 0.2, lineColor: [0, 0, 0], textColor: [0, 0, 0] },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'normal' },
      margin: { left: startX, right: 10 },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold' },
        1: { halign: 'right', fontStyle: 'bold' },
        2: { halign: 'center' },
        3: { halign: 'right', fontStyle: 'bold' },
        4: { halign: 'center' },
        5: { halign: 'right', fontStyle: 'bold' },
        6: { halign: 'right', fontStyle: 'bold' }
      },
      didParseCell: function (data: any) {
        if (data.row.index === 1 && data.section === 'body') {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
  }

  currentY = (doc as any).lastAutoTable?.finalY || (currentY + 20);

  // Tax Amount in words
  currentY += 4;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const taxPaise = Math.round((taxAmount - Math.floor(taxAmount)) * 100).toString().padStart(2, '0');
  doc.text(`Tax Amount (in words)  :   Indian Rupees ${NumberToWords.convert(Math.floor(taxAmount))} and ${taxPaise} paise Only`, startX + 2, currentY);

  currentY += 4;
  doc.line(startX, currentY, startX + contentWidth, currentY); // Line before footer

  // Footer declaration & Signature
  doc.setFontSize(7);
  doc.text("Company's PAN     :  ", startX + 2, currentY + 4);
  doc.setFont("helvetica", "bold");
  doc.text("AAKPF0827G", startX + 25, currentY + 4);
  
  doc.setFont("helvetica", "normal");
  doc.text("Declaration", startX + 2, currentY + 12);
  doc.line(startX + 2, currentY + 13, startX + 15, currentY + 13); // underline declaration
  doc.text("We declare that this invoice shows the actual price of the", startX + 2, currentY + 17);
  doc.text("goods described and that all particulars are true and correct.", startX + 2, currentY + 20);

  doc.setFont("helvetica", "bold");
  doc.text("for Raza Trading Co.", startX + contentWidth - 2, currentY + 4, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text("Authorised Signatory", startX + contentWidth - 2, currentY + 20, { align: "right" });

  // Out-of-box footer
  doc.text("SUBJECT TO BHIWANDI JURISDICTION", pageWidth / 2, 285, { align: "center" });
  doc.text("This is a Computer Generated Invoice", pageWidth / 2, 288, { align: "center" });

  doc.save(`invoice_${orderId}.pdf`);
};
