export const formatWhatsAppMessage = (cartItems, customerInfo) => {
  const businessPhone = "+918148132442"; // WhatsApp business number
  
  let message = `🥗 New Order from Consciouscafe.in \n\n`;
  message += `👤 *Customer Details:*\n`;
  message += `Name: ${customerInfo.name}\n`;
  message += `Phone: ${customerInfo.phone}\n`;
  message += `Email: ${customerInfo.email}\n`;
  
  // Delivery details
  message += `📦 *Order Type:* 🚚 Delivery\n`;
  message += `📍 Address: ${customerInfo.address}\n`;
  message += `📏 Distance: ${customerInfo.distance} km\n\n`;
  
  message += `🛒 *Order Details:*\n`;
  
  let subtotal = 0;
  cartItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    message += `${index + 1}. ${item.name}\n`;
    message += `   Qty: ${item.quantity} × ₹${item.price.toFixed(2)} = ₹${itemTotal.toFixed(2)}\n\n`;
  });
  
  const gst = subtotal * 0.05; // 5% GST
  const total = subtotal + gst;
  
  message += `💰 *Bill Summary:*\n`;
  message += `Subtotal: ₹${subtotal.toFixed(2)}\n`;
  message += `GST (5%): ₹${gst.toFixed(2)}\n`;
  message += `*Total Amount: ₹${total.toFixed(2)}*\n\n`;
  
  if (customerInfo.notes && customerInfo.notes.trim()) {
    message += `📝 *Special Instructions:*\n${customerInfo.notes}\n\n`;
  }
  
  message += `📅 Order Date: ${new Date().toLocaleDateString()}\n`;
  message += `⏰ Order Time: ${new Date().toLocaleTimeString()}\n\n`;
  message += `Thank you for choosing Conscious Cafe, Kavas Conscious Living LLP! 🙏`;
  
  try {
    return {
      phone: businessPhone,
      message: encodeURIComponent(message)
    };
  } catch (error) {
    console.error('Error formatting WhatsApp message:', error);
    return {
      phone: businessPhone,
      message: ''
    };
  }
};

export const sendToWhatsApp = (cartItems, customerInfo) => {
  const { phone, message } = formatWhatsAppMessage(cartItems, customerInfo);
  const whatsappUrl = `https://wa.me/${phone.replace('+', '')}?text=${message}`;
  window.open(whatsappUrl, '_blank');
};
