const fs = require('fs');
const PDFDocument = require('pdfkit');


function generateBill(order){

    const doc = new PDFDocument();
    const filePath = `./bill-${order._id}.pdf`;

    doc.pipe(fs.createWriteStream(filePath));

    doc.text('Thank you for shopping with EcoCart!', { align: 'center' });
    doc.fontSize(20).text('EcoCart Invoice', { align: 'center' }).moveDown(1);
    doc.fontSize(12).text(`Order ID: ${order._id}`, { align: 'left' }).moveDown(0.5);
    // doc.text(`Date: ${order.createdAt.toLocaleString()}`, { align: 'left' }).moveDown(1);
    
    // Add User Information
    doc.text('Customer Information:', { underline: true }).moveDown(0.5);
    // doc.text(`Name: ${order.shippingAddress.fullName}`);
    // doc.text(`Address: ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}`);
    // doc.text(`Phone: ${order.user.phoneNumber}`);  // Assuming user has a phone number
    
    // Add Product Details
    doc.moveDown(1);
    doc.text('Products:', { underline: true }).moveDown(0.5);
    
    let totalAmount = 0;
    // order.products.forEach(item => {
    //     doc.text(`${item.productName}: ${item.quantity} x ${item.price} = ${item.quantity * item.price}`);
    //     totalAmount += item.quantity * item.price;
    // });
    
    // Add Total
    doc.moveDown(1);
    doc.text(`Total Amount: $${totalAmount.toFixed(2)}`);
    
    // Add Footer
    doc.moveDown(2);
    doc.text('Thank you for shopping with EcoCart!', { align: 'center' });

    doc.end();

    return filePath;
}

module.exports = generateBill;