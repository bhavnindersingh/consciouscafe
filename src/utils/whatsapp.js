import { calcTotals } from './totals';

export const formatWhatsAppMessage = (cartItems, customerInfo, packagingRates = null) => {
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
  
  cartItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    message += `${index + 1}. ${item.name}\n`;
    message += `   Qty: ${item.quantity} × ₹${item.price.toFixed(2)} = ₹${itemTotal.toFixed(2)}\n\n`;
  });

  // Same numbers the checkout drawer showed — this message is what the cafe
  // bills from, so it must never compute its own total.
  const { subtotal, packaging, packagingKnown, gst, total } = calcTotals(cartItems, packagingRates);

  message += `💰 *Bill Summary:*\n`;
  message += `Subtotal: ₹${subtotal.toFixed(2)}\n`;
  message += packagingKnown
    ? `Packaging: ₹${packaging.toFixed(2)}\n`
    : `Packaging: to be added on confirmation\n`;
  message += `GST (5%): ₹${gst.toFixed(2)}\n`;
  message += `*Total Amount: ₹${total.toFixed(2)}*`;
  message += packagingKnown ? `\n\n` : ` _(before packaging)_\n\n`;
  
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

export const sendToWhatsApp = (cartItems, customerInfo, packagingRates = null) => {
  const { phone, message } = formatWhatsAppMessage(cartItems, customerInfo, packagingRates);
  const whatsappUrl = `https://wa.me/${phone.replace('+', '')}?text=${message}`;
  window.open(whatsappUrl, '_blank');
};
