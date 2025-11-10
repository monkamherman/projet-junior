import React from "react";
import { Database, Headset, Smartphone } from "lucide-react";

type Service = {
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  link: string;
};

const services: Service[] = [
  {
    title: "Database Security",
    description:
      "Refine designs and the content you use to provide digital solutions.",
    icon: <Database className="w-6 h-6 text-blue-600" />,
    image: "/img1.jpg", // à remplacer par ton image
    link: "#",
  },
  {
    title: "IT Consultancy",
    description:
      "Professional advice on infrastructure and system integration.",
    icon: <Headset className="w-6 h-6 text-blue-600" />,
    image: "/etudiante.jpg",
    link: "#",
  },
  {
    title: "App Development",
    description:
      "We build scalable web and mobile apps for modern businesses.",
    icon: <Smartphone className="w-6 h-6 text-blue-600" />,
    image: "/img3.jpg",
    link: "#",
  },
];

const ServicesSection: React.FC = () => {
  return (
    <section className="bg-gray-900 text-white px-6 md:px-16 py-20">
      {/* Section header */}
      <div className="mb-12">
        <p className="text-blue-400 uppercase tracking-wide font-semibold text-sm">
          IT Services We’re Offering
        </p>
        <h2 className="text-3xl md:text-4xl font-bold">Exclusive IT Services</h2>
      </div>

      {/* Services cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition"
          >
            {/* Image */}
            <div className="relative">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow">
                {service.icon}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <a
                href={service.link}
                className="text-blue-600 font-medium hover:underline"
              >
                Read More →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
