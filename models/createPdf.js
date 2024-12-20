const fs = require('fs');
const PDFDocument = require('pdfkit');


function generateBill(order, res) {
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bill-${order._id}.pdf`);

    doc.pipe(res);

    // Header
    doc.text('Thank you for shopping with EcoCart!', { align: 'center' });
    doc.fontSize(20).text('EcoCart Invoice', { align: 'center' }).moveDown(1);

    // Order Info
    doc.fontSize(12).text(`Order ID: ${order._id}`, { align: 'left' }).moveDown(0.5);
    doc.text(`Date: ${order.createdAt.toLocaleString()}`, { align: 'left' }).moveDown(1);

    // Customer Information
    doc.text('Customer Information:', { underline: true }).moveDown(0.5);
    doc.text(`Name: ${order.shippingAddress.fullName}`);
    doc.text(`Address: ${order.shippingAddress.addressLine1}, ${order.shippingAddress.addressLine2 || ''}, ${order.shippingAddress.city}`);
    doc.text(`Phone: ${order.user.phoneNumber || 'N/A'}`);

    // Product Details
    doc.moveDown(1);
    doc.text('Products:', { underline: true }).moveDown(0.5);

    let totalAmount = 0;
    order.products.forEach(item => {
        const productName = item.product.productname; // From populated product
        const totalPrice = item.quantity * item.price;
        doc.text(`${productName}: ${item.quantity} x ${item.price} = ${totalPrice}`);
        totalAmount += totalPrice;
    });

    // Total Amount
    doc.moveDown(1);
    doc.text(`Total Amount: $${totalAmount.toFixed(2)}`);

    // Footer
    doc.moveDown(2);
    doc.text('Thank you for shopping with EcoCart!', { align: 'center' });

    doc.end();

    
}


module.exports = generateBill;