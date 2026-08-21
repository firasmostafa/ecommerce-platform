import { useEffect, useState } from "react";
import axios from "axios";
import { Mail, MapPin, Phone } from "lucide-react";

import "./Contact.css";

const API_URL = "https://ecommerce-platform-4vwn.onrender.com/api";

const defaultStoreSettings = {
  store_name: "Nova Store",
  email: "frasm688@gmail.com",
  phone: "+961 79 360 988",
  address: "Lebanon",
};

function Contact() {
  const [storeSettings, setStoreSettings] = useState(defaultStoreSettings);

  useEffect(() => {
    let cancelled = false;

    const loadStoreSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/store-settings`);

        if (cancelled) {
          return;
        }

        const data = response.data?.data || response.data || {};

        setStoreSettings({
          store_name: data.store_name || defaultStoreSettings.store_name,

          email: data.email || defaultStoreSettings.email,

          phone: data.phone || defaultStoreSettings.phone,

          address: data.address || defaultStoreSettings.address,
        });
      } catch (error) {
        console.error("Failed to load store settings:", error);
      }
    };

    loadStoreSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const phoneLink = storeSettings.phone
    .replace(/\s+/g, "")
    .replace(/[()-]/g, "");

  const mapLink =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(storeSettings.address);

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-container">
          <span>WE&apos;RE HERE TO HELP</span>

          <h1>Contact {storeSettings.store_name}</h1>

          <p>
            Have a question about an order or product? Send us a message and our
            team will be happy to help.
          </p>
        </div>
      </section>

      <section className="contact-content">
        <div className="contact-container contact-grid">
          <div className="contact-info">
            <a
              href={`mailto:${storeSettings.email}`}
              className="contact-info-card"
            >
              <Mail size={22} />

              <div>
                <strong>Email</strong>

                <span>{storeSettings.email}</span>
              </div>
            </a>

            <a href={`tel:${phoneLink}`} className="contact-info-card">
              <Phone size={22} />

              <div>
                <strong>Phone</strong>

                <span>{storeSettings.phone}</span>
              </div>
            </a>

            <a
              href={mapLink}
              target="_blank"
              rel="noreferrer"
              className="contact-info-card"
            >
              <MapPin size={22} />

              <div>
                <strong>Location</strong>

                <span>{storeSettings.address}</span>
              </div>
            </a>
          </div>

          <form className="contact-form">
            <div>
              <label htmlFor="contact-name">Name</label>

              <input id="contact-name" type="text" placeholder="Your name" />
            </div>

            <div>
              <label htmlFor="contact-email">Email</label>

              <input
                id="contact-email"
                type="email"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="contact-message">Message</label>

              <textarea
                id="contact-message"
                rows="6"
                placeholder="How can we help?"
              />
            </div>

            <button type="submit">Send Message</button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Contact;
