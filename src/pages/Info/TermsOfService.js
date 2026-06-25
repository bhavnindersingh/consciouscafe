import React from 'react';
import SEO from '../../components/seo/SEO/SEO';
import { generatePageSEO } from '../../utils/seoData';
import LegalDoc from './LegalDoc';

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of these terms',
    body: (
      <p>
        By visiting Conscious Café, ordering from us, booking a wellness session, or using
        our website, you agree to these terms. Please read them — they explain what you can
        expect from us and what we ask of you.
      </p>
    ),
  },
  {
    id: 'services',
    title: 'What we offer',
    body: (
      <>
        <p>Conscious Café is a vegetarian café and wellness space near Auroville. Our offerings include:</p>
        <ul>
          <li><strong>Dining</strong> — vegetarian and vegan food, specialty coffee, and house-made drinks, served in the café.</li>
          <li><strong>Takeaway and delivery</strong> — available within our local service area.</li>
          <li><strong>Wellness sessions</strong> — ice bath (cold therapy), sauna (heat therapy) and yogashala (yoga) sessions.</li>
          <li><strong>Community space</strong> — a space for workshops, events and gatherings.</li>
          <li><strong>Workshops and events</strong> — hosted by us and by visiting facilitators.</li>
        </ul>
        <p>Availability of menu items, sessions and events can change with the season, demand and staffing.</p>
      </>
    ),
  },
  {
    id: 'ordering-payment',
    title: 'Ordering and payment',
    body: (
      <>
        <p>
          Prices are listed in Indian Rupees (INR) and include applicable taxes. We accept
          cash, UPI and major digital wallets, and cards. We may decline or cancel an order
          where an item is unavailable or where details cannot be confirmed.
        </p>
        <p>
          Online payments are handled by our payment partners. If a payment fails or is
          declined, your order may not be confirmed until payment is complete.
        </p>
      </>
    ),
  },
  {
    id: 'delivery',
    title: 'Delivery and takeaway',
    body: (
      <>
        <p>
          We deliver within our local service area near Auroville and Pondicherry. Delivery
          charges may apply based on distance, and estimated times are guidance rather than a
          guarantee — preparation time, weather and traffic can affect them.
        </p>
        <p>
          We use eco-friendly packaging where we can. Some items, such as cold-pressed
          juices, are best enjoyed soon after delivery.
        </p>
      </>
    ),
  },
  {
    id: 'wellness',
    title: 'Wellness sessions and your health',
    body: (
      <>
        <p>
          Ice bath, sauna and yoga sessions can carry risk if you have certain health
          conditions. Before taking part, please:
        </p>
        <ul>
          <li>Consult a healthcare provider if you are pregnant, or have heart, blood-pressure, circulatory or other relevant conditions.</li>
          <li>Tell our team about any condition that may affect your safety during a session.</li>
          <li>Follow the guidance of our staff and facilitators at all times.</li>
        </ul>
        <p>
          You take part in wellness sessions at your own discretion. Any wellness information
          we share is general and is not medical advice.
        </p>
      </>
    ),
  },
  {
    id: 'allergens',
    title: 'Allergens and dietary information',
    body: (
      <p>
        Our kitchen handles nuts, gluten, soy, dairy and other allergens, and we cannot
        guarantee a dish is completely free from traces of them. Please tell our team about
        any allergy or dietary restriction before you order so we can guide you to suitable
        choices.
      </p>
    ),
  },
  {
    id: 'bookings',
    title: 'Bookings, cancellations and refunds',
    body: (
      <>
        <p>
          For reservations, wellness sessions, workshops and events, we ask for reasonable
          notice if your plans change so we can offer the space to someone else.
        </p>
        <ul>
          <li>You can amend or cancel an order before we have begun preparing it.</li>
          <li>Refunds are offered for orders that have not yet been prepared.</li>
          <li>Some events and group bookings have their own terms, which we will share when you book.</li>
        </ul>
        <p>If something is not right with your order or experience, contact us and we will make it right.</p>
      </>
    ),
  },
  {
    id: 'house',
    title: 'In our space',
    body: (
      <>
        <p>To keep the café calm and welcoming for everyone, we ask guests to:</p>
        <ul>
          <li>Be considerate of the quiet, mindful atmosphere and of other guests.</li>
          <li>Support our low-waste approach and reusable packaging.</li>
          <li>Respect others' privacy when taking photos or filming, especially during wellness sessions and events.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    body: (
      <p>
        Our recipes, menus, branding, photography and website content belong to Conscious
        Café and may not be copied or used commercially without our permission.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <p>
        We work hard to deliver good food and a safe, well-run space. To the extent permitted
        by law, our liability for any order or service is limited to its value. Nothing in
        these terms limits liability that cannot be limited under applicable law.
      </p>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing law',
    body: (
      <p>
        These terms are governed by the laws of India and the State of Tamil Nadu. We would
        always rather resolve a concern through a friendly conversation, but any disputes fall
        under the jurisdiction of the courts of Pondicherry.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: (
      <p>
        We may update these terms as our services or legal obligations change. Continuing to
        use our services after an update means you accept the revised terms. The date at the
        top of this page shows when we last changed them.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: (
      <div className="legal-contact">
        <p className="legal-contact-name">Conscious Café</p>
        <p>Near Auroville, Pondicherry, Tamil Nadu, India</p>
        <p>
          <a href="mailto:hello@consciouscafe.in">hello@consciouscafe.in</a><br />
          <a href="tel:+918754561269">+91 87545 61269</a>
        </p>
      </div>
    ),
  },
];

const TermsOfService = () => {
  const seoData = generatePageSEO('terms-of-service');

  return (
    <>
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={seoData.url}
      />
      <LegalDoc
        eyebrow="Conscious Café · Legal"
        title="Terms of Service"
        updated="24 June 2026"
        intro={
          <p>
            These terms cover how we serve you — in the café, online, and across our wellness
            sessions, workshops and events. They are written plainly so you know where you
            stand when you visit or order.
          </p>
        }
        disclaimer={
          <p>
            <strong>A note:</strong> Conscious Café is an independent business near Auroville,
            Pondicherry. We are not affiliated with, endorsed by, or part of the Auroville
            Foundation.
          </p>
        }
        sections={sections}
      />
    </>
  );
};

export default TermsOfService;
