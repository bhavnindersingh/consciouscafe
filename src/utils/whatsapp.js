export const formatWhatsAppMessage = (cartItems, customerInfo) => {
  const businessPhone = "+918148132442"; // WhatsApp business number
  
  let message = `🍰 *New Order from Conscious Bakes* 🍰\n\n`;
  message += `👤 *Customer Details:*\n`;
  message += `Name: ${customerInfo.name}\n`;
  message += `Phone: ${customerInfo.phone}\n`;
  message += `Email: ${customerInfo.email}\n`;
  
  // Add order type specific info
  message += `📦 *Order Type:* ${customerInfo.orderType === 'cafe' ? '🏪 Cafe Guest' : '🚚 Delivery'}\n`;
  if (customerInfo.orderType === 'cafe') {
    message += `🪑 Table Number: ${customerInfo.tableNumber}\n\n`;
  } else {
    message += `📍 Address: ${customerInfo.address}\n`;
    message += `📏 Distance: ${customerInfo.distance} km\n\n`;
  }
  
  message += `🛒 *Order Details:*\n`;
  
  let total = 0;
  cartItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    message += `${index + 1}. ${item.name}\n`;
    message += `   Qty: ${item.quantity} × ₹${item.price.toFixed(2)} = ₹${itemTotal.toFixed(2)}\n\n`;
  });
  
  message += `💰 *Total Amount: ₹${total.toFixed(2)}*\n\n`;
  
  if (customerInfo.notes && customerInfo.notes.trim()) {
    message += `📝 *Special Instructions:*\n${customerInfo.notes}\n\n`;
  }
  
  message += `📅 Order Date: ${new Date().toLocaleDateString()}\n`;
  message += `⏰ Order Time: ${new Date().toLocaleTimeString()}\n\n`;
  message += `Thank you for choosing Conscious Bakes! 🙏`;
  
  return {
    phone: businessPhone,
    message: encodeURIComponent(message)
  };
};

export const sendToWhatsApp = (cartItems, customerInfo) => {
  const { phone, message } = formatWhatsAppMessage(cartItems, customerInfo);
  const whatsappUrl = `https://wa.me/${phone.replace('+', '')}?text=${message}`;
  window.open(whatsappUrl, '_blank');
};
