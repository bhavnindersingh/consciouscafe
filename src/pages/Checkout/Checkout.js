import React, { useState } from 'react';
import { sendToWhatsApp } from '../../utils/whatsapp';

const money = (n) =>
  `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const WhatsAppGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.479 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" fill="currentColor"/>
  </svg>
);

const Checkout = ({ isOpen, onClose, cartItems = [], onOrderComplete }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    distance: ''
  });

  const [errors, setErrors] = useState({});
  const [distanceError, setDistanceError] = useState('');

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = subtotal * 0.05; // 5% GST
  const total = subtotal + gst;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (name === 'distance' && distanceError) {
      setDistanceError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!customerInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Delivery details validation
    if (!customerInfo.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Distance validation
    const distance = parseFloat(customerInfo.distance);
    if (!customerInfo.distance.trim() || isNaN(distance) || distance <= 0) {
      setDistanceError('Please enter a valid distance');
      setErrors(newErrors);
      return false;
    } else if (distance > 6) {
      setDistanceError('Delivery only available within 6 km');
      setErrors(newErrors);
      return false;
    } else {
      setDistanceError('');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Send order to WhatsApp
      sendToWhatsApp(cartItems, customerInfo);

      // Clear cart and close checkout
      onOrderComplete();
      onClose();

      // Show success message
      alert('Order sent to WhatsApp! We will contact you shortly to confirm your order.');
    }
  };

  return (
    <>
      <div className={`scrim ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer checkout-drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
        <div className="drawer-head">
          <h3>Checkout</h3>
          <button className="x" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="co-form" onSubmit={handleSubmit}>
          <div className="drawer-body">
            {/* Order Summary */}
            <section className="co-summary">
              <div className="co-sec-label">Order Summary</div>
              {cartItems.map(item => (
                <div className="co-sum-row" key={item.id}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>{money(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="co-sum-row muted">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="co-sum-row muted">
                <span>GST (5%)</span>
                <span>{money(gst)}</span>
              </div>
            </section>

            {/* Delivery Details */}
            <section className="co-fields">
              <div className="co-sec-label">Delivery Details</div>

              <div className="co-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  className={`co-input ${errors.name ? 'error' : ''}`}
                />
                {errors.name && <span className="co-error">{errors.name}</span>}
              </div>

              <div className="co-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  className={`co-input ${errors.phone ? 'error' : ''}`}
                />
                {errors.phone && <span className="co-error">{errors.phone}</span>}
              </div>

              <div className="co-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  className={`co-input ${errors.email ? 'error' : ''}`}
                />
                {errors.email && <span className="co-error">{errors.email}</span>}
              </div>

              <div className="co-group">
                <label htmlFor="address">Delivery Address *</label>
                <textarea
                  id="address"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  rows="3"
                  className={`co-input co-textarea ${errors.address ? 'error' : ''}`}
                  placeholder="Enter your full delivery address with landmarks"
                ></textarea>
                {errors.address && <span className="co-error">{errors.address}</span>}
              </div>

              <div className="co-group">
                <label htmlFor="distance">Distance from Cafe (km) *</label>
                <input
                  type="number"
                  id="distance"
                  name="distance"
                  value={customerInfo.distance}
                  onChange={handleInputChange}
                  min="0"
                  max="6"
                  step="0.1"
                  className={`co-input ${distanceError ? 'error' : ''}`}
                  placeholder="Enter distance in km (e.g., 2.5)"
                />
                {distanceError && <span className="co-error">{distanceError}</span>}
                <p className="co-hint">📍 Delivery only available within 6 km radius from our cafe</p>
              </div>

              <div className="co-group">
                <label htmlFor="notes">Special Instructions (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={customerInfo.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="co-input co-textarea"
                  placeholder="Special requests or delivery instructions"
                ></textarea>
              </div>
            </section>
          </div>

          <div className="drawer-foot">
            <div className="ftot">
              <span className="l">Total</span>
              <span className="v">{money(total)}</span>
            </div>
            <button type="submit" className="btn solid co-submit">
              <WhatsAppGlyph />
              <span>Send Order via WhatsApp</span>
            </button>
            <p className="co-note">
              Your order is sent via WhatsApp — we'll confirm availability and arrange delivery.
            </p>
          </div>
        </form>
      </aside>
    </>
  );
};

export default Checkout;
