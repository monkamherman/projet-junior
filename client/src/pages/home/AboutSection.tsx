import React from "react";
import { CheckCircle } from "lucide-react";

const AboutSection: React.FC = () => {
  return (
    <section className="grid md:grid-cols-2 gap-10 items-center px-6 md:px-16 py-20">
      {/* Left - Image Section */}
      <div className="relative">
        <img
          src="/img3.jpg" 
          alt="Business professional"
          className="rounded-2xl shadow-lg"
        />
        <img
          src="/etudiante.jpg"
          alt="Team working"
          className="absolute bottom-[-40px] left-10 w-1/2 rounded-xl shadow-md border-4 border-white"
        />
      </div>

      {/* Right - Content Section */}
      <div className="space-y-6">
        <p className="text-blue-600 uppercase font-semibold tracking-wide">
          Who We Are
        </p>
        <h2 className="text-3xl md:text-4xl font-bold leading-snug">
          Ensuring Your Success Through <br /> Reliable IT Solutions
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Far far away, behind the word mountains, far from the countries Vokalia
          and Consonantia, there live the blind texts. Separated they live in
          Bookmarksgrove right at the coast of the Semantics.
        </p>

        {/* Features List */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={20} />
            <span>Technology Consultancy</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={20} />
            <span>Maintenance & Support</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={20} />
            <span>Web & Mobile Services</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-blue-600" size={20} />
            <span>Requirements Gathering</span>
          </div>
        </div>

        {/* CTA + Signature */}
        <div className="flex items-center gap-8 mt-6">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
            About Us
          </button>
          <span className="italic text-2xl font-signature">Signature</span>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
