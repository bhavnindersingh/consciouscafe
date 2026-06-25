import React from 'react';
import SEO from '../../components/seo/SEO/SEO';
import { generatePageSEO } from '../../utils/seoData';
import LegalDoc from './LegalDoc';

const sections = [
  {
    id: 'information-we-collect',
    title: 'Information we collect',
    body: (
      <>
        <p>We collect only what we need to serve you well:</p>
        <ul>
          <li><strong>Details you give us</strong> — your name, phone number and email when you place an order, book a table, reserve a wellness session or workshop, or get in touch.</li>
          <li><strong>Order and dietary information</strong> — what you order, delivery addresses, and any allergies or dietary preferences you share so we can prepare your food safely.</li>
          <li><strong>Wellness information</strong> — relevant health details you choose to share before an ice bath, sauna or yogashala session, so we can advise you and keep the session safe.</li>
          <li><strong>Payment details</strong> — processed securely by our payment partners. We do not store your card numbers.</li>
          <li><strong>Website usage</strong> — basic information such as pages viewed and device type, collected through cookies and analytics to help the site work and improve.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    title: 'How we use your information',
    body: (
      <>
        <p>We use your information to:</p>
        <ul>
          <li>Take, prepare and deliver your orders, and manage your reservations and bookings.</li>
          <li>Prepare food safely around your allergies and dietary needs.</li>
          <li>Respond to your questions, feedback and requests.</li>
          <li>Send you updates you have asked for, such as booking confirmations or news about menus and events. You can opt out of marketing messages at any time.</li>
          <li>Run and improve our website and services.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Sharing your information',
    body: (
      <>
        <p>We do not sell your personal information. We share it only with partners who help us run the café, and only as far as needed:</p>
        <ul>
          <li>Payment processors, to complete your transactions securely.</li>
          <li>Delivery partners, to bring your order to you.</li>
          <li>Service providers for our website, messaging and analytics.</li>
        </ul>
        <p>We may also disclose information where the law requires it, or to protect the rights and safety of our guests, our team and the café.</p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and analytics',
    body: (
      <p>
        Our website uses cookies and similar tools to keep it working, remember your
        preferences and understand how the site is used. You can control or block cookies
        through your browser settings, though some parts of the site may not work as well
        without them.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'Data security',
    body: (
      <p>
        We take reasonable steps to protect your information against loss, misuse and
        unauthorised access. No method of transmission or storage is completely secure, but
        we work to keep your data safe and to limit who can access it to those who need it.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <p>You can ask us to:</p>
        <ul>
          <li>Access the personal information we hold about you.</li>
          <li>Correct anything that is inaccurate or out of date.</li>
          <li>Delete your information, where we are not required to keep it.</li>
          <li>Stop sending you marketing messages.</li>
        </ul>
        <p>To make a request, contact us using the details below.</p>
      </>
    ),
  },
  {
    id: 'children',
    title: "Children's privacy",
    body: (
      <p>
        Families are welcome at the café. We do not knowingly collect personal information
        from children under 13 without the consent of a parent or guardian. If you believe a
        child has given us their information, please contact us and we will remove it.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <p>
        We may update this policy from time to time as our services or legal obligations
        change. When we do, we will revise the date at the top of this page.
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

const PrivacyPolicy = () => {
  const seoData = generatePageSEO('privacy-policy');

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
        title="Privacy Policy"
        updated="24 June 2026"
        intro={
          <p>
            This policy explains what information we collect at Conscious Café, how we use
            it, and the choices you have. We keep it short and plain because your privacy
            should be easy to understand.
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

export default PrivacyPolicy;
