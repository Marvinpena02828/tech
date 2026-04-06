"use client";

import Image from "next/image";

export const achievements = [
  {
    image: "/services/page/oemodmservices.jpg",
    title: "End-to-End OEM/ODM Solutions",
    description: (
      <>
        We provide <b>end-to-end OEM/ODM services</b> to bring your vision to
        life. From design and engineering to certified mass production, our
        scalable solutions help you launch high-performance products faster
        while minimizing risk and maximizing market impact.
        <br />
        <b>Product & ID Design:</b> Conceptualization and industrial design for
        a unique, market-ready appearance.
        <br />
        <b>Unique UI Design:</b>Development of custom user interface/user
        experience (UI/UX) for smart products.
        <br />
        <b>PCBA Customization:</b> Development of custom user interface/user
        experience (UI/UX) for smart products.
        <br />
        <b>Product Development:</b> Full engineering support from prototypes to
        mass production.
        <br />
        <b> Retail Packaging:</b> Design and production of compelling,
        brand-aligned retail packaging.
      </>
    ),
  },
  {
    image: "/services/page/professionalCertification.jpg",
    title: "Global Certifications & Compliance",
    description: (
      <>
        At Ayyan Innovations, rigorous certification is more than a formality—it
        is our core commitment to safety and global excellence. We bridge the
        gap between innovation and regulation, ensuring every product meets the
        world’s most stringent performance standards. Our comprehensive
        compliance suite includes CE, FCC, RoHS, UL, UKCA, PSE, CB, Qi, ETL,
        KCC, and SAA approvals. By managing everything from laboratory testing
        to final verification, we provide our partners with a streamlined path
        to international markets and a faster time-to-market.
      </>
    ),
  },
  {
    image: "/services/page/factoryQualification.jpg",
    title: "In-House Manufacturing & Factory Qualification",
    description: (
      <>
        As a direct manufacturer, our facilities are engineered to meet the
        highest international standards for production, safety, and technical
        excellence. Our Dongguan and Shenzhen operations undergo rigorous
        internal and third-party evaluations, covering everything from our
        automated SMT workshops to our final assembly lines. By maintaining
        total control over our quality management systems and ethical practices,
        we ensure 100% consistency and long-term reliability. Our commitment to
        continuous improvement and regular audits guarantees that every product
        leaving our floor is ready for the global market.
        <br />
        <br />
        <ul>
          <li>
            • <b>Quality & Environmental Management:</b> ISO 9001 and ISO 14001
            certified facilities.
          </li>
          <li>
            • <b>Sustainable Manufacturing:</b> GRS (Global Recycled Standard)
            certified for eco-conscious production.
          </li>
          <li>
            • <b>Social Responsibility:</b> BSCI-compliant operations, ensuring
            fair labor practices and ethical workplace standards
          </li>
        </ul>
      </>
    ),
  },
  {
    image: "/services/page/qualityGuarantee.jpg",
    title: "Quality Guarantee",
    description: (
      <>
        Our quality is the cornerstone of everything we do. We are committed to
        delivering products that consistently meet the highest standards of
        performance, safety, and durability. Our robust quality management
        system covers every stage of production from material sourcing and
        manufacturing to final inspection and delivery ensuring that each
        product exceeds customer expectations. Through rigorous testing,
        in-process inspections, and final quality audits, we guarantee
        reliability, efficiency, and long-lasting performance. This unwavering
        focus on quality allows our partners and customers to trust that every
        product bearing our name is crafted with precision and integrity. Our
        Quality Guarantee reflects our dedication to excellence, building
        long-term confidence, brand credibility, and enduring customer
        satisfaction.
      </>
    ),
  },
];

const ListOfServices = () => {
  return (
    <section className="font-poppins bg-white">
      <div className="lg:container p-2 mx-auto">
        <div className="mt-6 max-lg:space-y-6 space-y-10 xl:px-16">
          <h1 className=" text-black text-4xl pl-4">Our Services</h1>
          {achievements.map((achivement, index) => (
            <div
              id={`service-${index}`}
              className={`flex flex-col-reverse items-stretch justify-between my-10 mx-auto bg-white ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
              key={index}
            >
              <div className="flex-1 flex flex-col justify-center box-border w-full max-lg:px-10 lg:max-w-2xl mx-auto">
                <div className="p-4">
                  <h1 className="text-xl lg:text-xl font-bold mb-4">
                    {achivement.title}
                  </h1>
                  {/* */}
                  {achivement.description}
                  {/* </p> */}
                </div>
              </div>

              <Image
                src={achivement.image}
                alt={achivement.title}
                width={1280}
                height={1080}
                className="object-cover w-full aspect-video lg:aspect-square lg:max-w-1/2 h-full flex-1 xl:aspect-auto px-8"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ListOfServices;
