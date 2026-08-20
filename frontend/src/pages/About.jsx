import { ShieldCheck, Sparkles, Truck, Zap } from "lucide-react";
import "./About.css";

function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-container">
          <span>ABOUT NOVA</span>
          <h1>Shopping Built Around Choice</h1>
          <p>
            Nova Store is designed as a flexible modern marketplace,
            bringing different product categories together in one clean
            shopping experience.
          </p>
        </div>
      </section>

      <section className="about-values">
        <div className="about-container about-values-grid">
          <article>
            <Sparkles size={28} />
            <h3>Modern Experience</h3>
            <p>
              A dynamic interface focused on clarity, speed and modern
              shopping.
            </p>
          </article>

          <article>
            <Truck size={28} />
            <h3>Reliable Delivery</h3>
            <p>
              A clear ordering workflow from checkout to final delivery.
            </p>
          </article>

          <article>
            <ShieldCheck size={28} />
            <h3>Secure Shopping</h3>
            <p>
              Structured account, order and checkout flows built with
              security in mind.
            </p>
          </article>

          <article>
            <Zap size={28} />
            <h3>Flexible Store</h3>
            <p>
              The store can adapt its identity, categories and homepage
              content through administration settings.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default About;