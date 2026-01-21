import PDFDocument from 'pdfkit';
import fs from 'fs';

// change this path to wherever you save the logo file
const LOGO_PATH = 'assets/khelBazar-logo.png';

export const generateInvoice = (order, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ---------- HELPERS ----------
    const formatMoney = (amount) =>
      Number(amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    // ---------- COLORS ----------
    const primaryColor = '#111827'; // dark
    const mutedColor = '#6B7280';   // gray
    const lineColor = '#E5E7EB';    // light gray
    const accentColor = '#2563EB';  // blue
    const softAccentBg = '#EFF6FF'; // light blue bg

    // ======================================================
    // 1. BRAND HEADER (WITH LOGO)
    // ======================================================
    const topY = 45;

    // Try drawing logo (if file exists)
    try {
      const logoWidth = 70;
      doc.image(LOGO_PATH, 50, topY, { width: logoWidth });
    } catch (e) {
      console.warn('Logo not found or could not be loaded:', e.message);
    }

    // text block starts a bit right of the logo
    const textStartX = 130;

    doc
      .fillColor(primaryColor)
      .fontSize(26)
      .text('KhelBazar', textStartX, topY, { align: 'left' });

    doc
      .fillColor(mutedColor)
      .fontSize(10)
      .text('Premium Basketball Gear & Apparel', textStartX, topY + 30)
      .text('Kathmandu, Nepal', textStartX)
      .text('Email: support@KhelBazar.com', textStartX);

    // Right side: Invoice label + date
    doc
      .fillColor(accentColor)
      .fontSize(22)
      .text('INVOICE', 350, topY, { align: 'right' });

    doc
      .fillColor(mutedColor)
      .fontSize(10)
      .text(`Order ID: ${order._id}`, 350, topY + 30, { align: 'right' })
      .text(
        `Date: ${new Date(order.createdAt).toLocaleString()}`,
        350,
        topY + 44,
        { align: 'right' }
      );

    // Horizontal line under header
    doc
      .moveTo(50, 120)
      .lineTo(550, 120)
      .strokeColor(lineColor)
      .stroke();

    doc.moveDown(2);

    // ======================================================
    // 2. CUSTOMER & ORDER INFO
    // ======================================================
    const customerName = order.user?.name || 'N/A';
    const phone = order.phone || 'N/A';
    const address = order.deliveryAddress || 'N/A';
    const paymentMethod = order.paymentMethod || 'COD';
    const orderStatus = order.status || 'Processing';

    // Left Column - Customer
    doc
      .fillColor(primaryColor)
      .fontSize(12)
      .text('Bill To:', 50, 135);

    doc
      .fillColor(mutedColor)
      .fontSize(10)
      .text(customerName, 50, 150)
      .text(`Phone: ${phone}`, 50)
      .text(`Address: ${address}`, 50);

    // Right Column - Order meta
    doc
      .fillColor(primaryColor)
      .fontSize(12)
      .text('Order Details:', 350, 135);

    doc
      .fillColor(mutedColor)
      .fontSize(10)
      .text(`Order Status: ${orderStatus}`, 350, 150)
      .text(`Payment Method: ${paymentMethod}`, 350, 162);

    doc.moveDown(4);

    // ======================================================
    // 3. ITEMS TABLE HEADER
    // ======================================================
    let tableTop = 200;

    // Header background bar
    doc
      .rect(50, tableTop, 500, 20)
      .fill('#F9FAFB');

    doc
      .fontSize(11)
      .fillColor(primaryColor);

    const colItemX = 55;
    const colQtyX = 320;
    const colPriceX = 380;
    const colTotalX = 460;

    doc.text('Item', colItemX, tableTop + 4);
    doc.text('Qty', colQtyX, tableTop + 4);
    doc.text('Price (Rs.)', colPriceX, tableTop + 4);
    doc.text('Total (Rs.)', colTotalX, tableTop + 4);

    // Underline header
    doc
      .moveTo(50, tableTop + 22)
      .lineTo(550, tableTop + 22)
      .strokeColor(lineColor)
      .stroke();

    let currentY = tableTop + 30;

    // ======================================================
    // 4. ITEMS TABLE BODY
    // ======================================================
    let subtotal = 0;

    if (Array.isArray(order.items) && order.items.length > 0) {
      order.items.forEach((item, index) => {
        const productName = item.product?.name || 'Unknown Product';
        const unitPrice =
          item.price ??
          item.product?.price ??
          0;

        const qty = item.quantity || 0;
        const lineTotal = unitPrice * qty;
        subtotal += lineTotal;

        // Safety: new page if too low on space
        if (currentY > 720) {
          doc.addPage();
          currentY = 60;
        }

        // zebra striping
        if (index % 2 === 0) {
          doc
            .rect(50, currentY - 2, 500, 18)
            .fillOpacity(0.03)
            .fill('#000000')
            .fillOpacity(1);
        }

        doc
          .fontSize(10)
          .fillColor(primaryColor)
          .text(productName, colItemX, currentY, {
            width: 250,
            lineBreak: false,
          });

        doc
          .fontSize(10)
          .fillColor(mutedColor)
          .text(String(qty), colQtyX, currentY, { width: 40, align: 'center' });

        doc
          .fontSize(10)
          .fillColor(mutedColor)
          .text(formatMoney(unitPrice), colPriceX, currentY, {
            width: 70,
            align: 'right',
          });

        doc
          .fontSize(10)
          .fillColor(primaryColor)
          .text(formatMoney(lineTotal), colTotalX, currentY, {
            width: 90,
            align: 'right',
          });

        currentY += 18;
      });
    } else {
      doc
        .fontSize(10)
        .fillColor(mutedColor)
        .text('No items found for this order.', colItemX, currentY);
      currentY += 20;
    }

    // Bottom line after items
    doc
      .moveTo(50, currentY + 5)
      .lineTo(550, currentY + 5)
      .strokeColor(lineColor)
      .stroke();

    // ======================================================
    // 5. TOTALS SECTION (RIGHT BOX)
    // ======================================================
    const discount = order.discount || 0;
    const shipping =
      order.shippingFee ??
      order.shippingCost ??
      order.deliveryCharge ??
      0;

    const calculatedTotal = subtotal - discount + shipping;
    const finalTotal =
      order.totalAmount != null ? order.totalAmount : calculatedTotal;

    const boxWidth = 220;
    const boxHeight = 100;
    const boxX = 330;
    const boxY = currentY + 20;

    doc
      .roundedRect(boxX, boxY, boxWidth, boxHeight, 8)
      .fill(softAccentBg);

    let lineY = boxY + 10;

    doc
      .fontSize(10)
      .fillColor(primaryColor)
      .text('Subtotal:', boxX + 10, lineY, { width: 120 });

    doc.text(`Rs. ${formatMoney(subtotal)}`, boxX + 10, lineY, {
      width: boxWidth - 20,
      align: 'right',
    });

    lineY += 14;

    if (discount > 0) {
      doc
        .fontSize(10)
        .fillColor(primaryColor)
        .text('Discount:', boxX + 10, lineY, { width: 120 });

      doc
        .fillColor('#DC2626')
        .text(`- Rs. ${formatMoney(discount)}`, boxX + 10, lineY, {
          width: boxWidth - 20,
          align: 'right',
        });

      lineY += 14;

      if (order.couponCode) {
        doc
          .fontSize(9)
          .fillColor(mutedColor)
          .text(`Coupon: ${order.couponCode}`, boxX + 10, lineY, {
            width: boxWidth - 20,
          });
        lineY += 12;
      }
    }

    if (shipping > 0) {
      doc
        .fontSize(10)
        .fillColor(primaryColor)
        .text('Shipping:', boxX + 10, lineY, { width: 120 });

      doc
        .fillColor(primaryColor)
        .text(`Rs. ${formatMoney(shipping)}`, boxX + 10, lineY, {
          width: boxWidth - 20,
          align: 'right',
        });

      lineY += 16;
    }

    doc
      .moveTo(boxX + 10, lineY)
      .lineTo(boxX + boxWidth - 10, lineY)
      .strokeColor('#BFDBFE')
      .stroke();

    lineY += 8;

    doc
      .fontSize(12)
      .fillColor(accentColor)
      .text('Total Payable:', boxX + 10, lineY, { width: 120 });

    doc.text(`Rs. ${formatMoney(finalTotal)}`, boxX + 10, lineY, {
      width: boxWidth - 20,
      align: 'right',
    });

    // ======================================================
    // 6. FOOTER
    // ======================================================
    const footerY = boxY + boxHeight + 40;

    doc
      .fontSize(10)
      .fillColor(mutedColor)
      .text(
        'Thank you for shopping with KhelBazar. We hope to see you back on the court soon!',
        50,
        footerY,
        { align: 'center' }
      );

    doc
      .moveDown(0.5)
      .fontSize(8)
      .fillColor('#9CA3AF')
      .text(
        'This is a system generated invoice. No physical signature is required.',
        { align: 'center' }
      );

    doc.end();

    stream.on('finish', () => resolve());
    stream.on('error', (err) => reject(err));
  });
};
