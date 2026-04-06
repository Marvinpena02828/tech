"use client";
import Image from "next/image";
import React, { useState } from "react";

export const customerCategories = [
  {
    image: "/partners/brandOwner.jpg",
    type: "Are You a Brand Owner? ",
    description:
      "Elevate your brand with bespoke manufacturing and strategic support.",
    items: [
      {
        title: "Exclusive Cooperation",
        detail:
          "Market differentiation and protection for your unique product designs.",
      },
      {
        title: "Complete OEM/ODM Services",
        detail: "Full-cycle support from concept design to mass production.",
      },
      {
        title: "Customized Product Certification",
        detail:
          "Tailored certification support aligned with your target market needs.",
      },
      {
        title: "Dedicated Service Team",
        detail:
          "Fast, responsive, and expert support from a single point of contact.",
      },
    ],
    contact: {
      company: "Ayyan Technology Co. LTD.",
      address:
        "4th Floor, Bldg. B, HuaFeng Intelligence Valley, Yuanshan High-tech Industrial Park, Longgang District, Shenzhen, China 518100",
      email: "sales@ayyantech.net",
    },

    dropdownItems: [
      {
        title: "Exclusive Strategic Cooperation",
        detail: `Secure your market position with a dedicated, long-term partnership.
Establish a protected market presence through a partnership that prioritizes your brand's long-term interests. We offer exclusive regional rights and dedicated manufacturing priority to ensure you remain the sole provider of our innovations in your territory.`,
      },
      {
        title: "Comprehensive OEM/ODM Solutions",
        detail: `Turn your concepts into reality with our expert design, manufacturing capabilities and with our end-to-end R&D and manufacturing capabilities. From initial prototyping and engineering to final assembly, we deliver bespoke solutions that align perfectly with your brand’s unique specifications.`,
      },
      {
        title: "Tailored Product Certification",
        detail: `We handle the technical compliance and testing required for your specific target markets. Global Market Compliance Navigate the complexities of global trade with our comprehensive compliance support. We manage the entire testing and documentation process to ensure your products meet the specific regulatory standards—such as CE, FCC, RoHS, UL, UKCA, PSE, CB, Qi, ETL, KCC, and SAA —required for your target international markets.`,
      },
      {
        title: "Dedicated Account Team",
        detail: `Experience seamless communication with a specialized team assigned exclusively to your brand. From project kickoff to final delivery, our experts act as an extension of your own office, ensuring your goals are understood and your deadlines are met with precision.`,
      },
    ],
  },

  {
    image: "/partners/tradingCompany.jpg",

    type: "Are You a Trading Company? ",
    description:
      "Your supply chain partner for reliable manufacturing and market growth.",
    items: [
      {
        title: "Original Factory Pricing",
        detail:
          "Maximizing margins with direct access to competitive manufacturer pricing.",
      },
      {
        title: "Customer Brand Protection Agreement",
        detail:
          "Guaranteeing security and confidentiality of your clients' intellectual property.",
      },
      {
        title: "Comprehensive OEM/ODM Resources",
        detail: "Access to a full suite of R&D and production capabilities.",
      },
      {
        title: "Quick Team Service",
        detail: "Ensuring rapid communication and smooth project execution.",
      },
    ],

    dropdownItems: [
      {
        title: "Direct Factory Pricing",
        detail:
          "Focused on Profitability, Gain a clear price advantage with our transparent, direct-from-source pricing structure. By bypassing agents and third-party markups, we ensure you receive the most cost-effective solution without compromising on product quality or manufacturing standards.",
      },
      {
        title: "Client Protection Protocols",
        detail:
          "Focused on Ethics & Trust, We prioritize the integrity of your business by implementing strict non-disclosure and customer protection agreements. Our protocols ensure that your client relationships remain yours alone, providing a secure environment where you can grow your business without the risk of factory-direct bypass.",
      },
      {
        title: "Extensive OEM/ODM Resources",
        detail:
          "Focused on Versatility, Gain full access to our comprehensive library of existing blueprints and advanced production facilities. Whether your client needs a minor branding adjustment or a completely new product design, our vast manufacturing infrastructure allows you to fulfill any request with total confidence.",
      },
      {
        title: "Dedicated Backend Support",
        detail:
          "Focused on Professional Reliability, Eliminate communication gaps with a consistent support structure that follows your orders from inquiry to delivery.",
      },
    ],
  },

  {
    image: "/partners/wholeSaler.jpg",

    type: "Are You a Wholesaler? ",
    description:
      "Streamline your supply chain with our comprehensive one-stop distribution solutions.",
    items: [
      {
        title: "Wide Product Portfolio",
        detail:
          "Access to a broad range of established, high-demand product series.",
      },
      {
        title: "Sufficient Stock",
        detail:
          "Reliable inventory levels to consistently meet high-volume demands.",
      },
      {
        title: "Flexible Ordering",
        detail:
          "Accommodating minimum order quantities (MOQ) and production schedules.",
      },
      {
        title: "Overseas Warehouse & Fast Delivery",
        detail:
          "Reduced lead times and logistics costs with international fulfillment centers.",
      },
    ],
    dropdownItems: [
      {
        title: "Extensive Product Portfolio",
        detail:
          "Focused on Market Coverage: Capture a larger market share by accessing our diverse range of product series, spanning multiple categories and price points. Our broad selection ensures that you can serve a variety of customer segments and stay ahead of evolving industry trends with a single partner.",
      },
      {
        title: "High-Volume Inventory Levels",
        detail:
          "Focused on Supply Chain Stability: Maintain a consistent market presence with the support of our massive stock reserves. We invest heavily in inventory so that you don't have to worry about back-orders or manufacturing delays, ensuring you can fulfill even the largest bulk requests at a moment's notice.",
      },
      {
        title: "Flexible Ordering Solutions",
        detail:
          "Focused on Business Growth: Optimize your capital and reduce inventory risk with ordering options that adapt to your business cycle. Whether you are testing a new market with a small batch or scaling up for a peak season, our flexible volume requirements allow you to grow at your own pace without the burden of restrictive quotas.",
      },
      {
        title: "Global Logistics Hubs",
        detail:
          'Focused on Cost & Efficiency: Lower your operational overhead with localized distribution that minimizes international shipping fees and import complexities. Our global hubs allow you to maintain a lean inventory model while still offering the "fast and free" shipping experience that modern buyers expect.',
      },
    ],
  },

  {
    image: "/partners/crossBorder.jpg",

    type: "Are you Cross-Border E-Commerce Partner?",
    description:
      "Accelerate your online growth with tools designed for global marketplaces.",
    items: [
      {
        title: "Complete Sales Toolkit",
        detail:
          "High-resolution images, detailed descriptions, and marketing videos for quick listing creation.",
      },
      {
        title: "Extended Quality Guarantee",
        detail:
          "24-month quality guarantee to minimize returns and build customer trust.",
      },
      {
        title: "Overseas Warehouse & Logistics",
        detail: "Fast, efficient shipping and reduced operational complexity.",
      },
      {
        title: "1-to-1 Customer Service",
        detail:
          "Personalized support to resolve post-sale or platform-related issues quickly.",
      },
    ],
    dropdownItems: [
      {
        title: "High-Definition Marketing Assets",
        detail:
          "Focused on Conversion: Boost your click-through rates and sales conversions with our complete suite of professional, high-resolution product imagery. We provide listing-ready photos and technical visuals designed to highlight key features, allowing you to launch your storefront immediately without the cost of independent photography.",
      },
      {
        title: "Extended 24-Month Quality Warranty",
        detail:
          "Focused on Consumer Confidence: Build a loyal customer base and a 5-star reputation by offering an industry-leading two-year quality guarantee. Our extended warranty minimizes the risk for your buyers and demonstrates our absolute confidence in the durability and performance of every product we manufacture.",
      },
      {
        title: "Rapid Global Fulfillment",
        detail:
          'Focused on Customer Satisfaction: Meet the demand for "next day" delivery by leveraging our strategic network of overseas warehouses. By positioning stock closer to your customers, we dramatically reduce shipping times and shipping costs, ensuring a domestic-speed experience that leads to higher ratings and repeat business.',
      },
      {
        title: "Personalized 1-on-1 Account Management",
        detail:
          "Focused on Professional Reliability, eliminate communication gaps with a consistent support structure that follows your orders from inquiry to delivery.",
      },
    ],
  },
];

const ListOfPartners = () => {
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>(
    {},
  );

  const toggleCategory = (categoryIndex: number) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryIndex]: !prev[categoryIndex],
    }));
  };

  return (
    <section className="font-poppins bg-white">
      <div className="lg:container px-2 mx-auto">
        <div className=" py-6">
          <h2 className="text-3xl font-bold mb-2 text-center">
            Our Valued Partners
          </h2>
          <p className="text-base text-center px-4">
            Ayyan Tech delivers tailored manufacturing, supply chain, and
            service solutions for a diverse range of global business partners.
            <br />We customize our support to ensure your success, regardless of your
            market position.
          </p>
        </div>
        <div className="mt-2 max-lg:space-y-6 space-y-10 xl:px-16 pb-2">
          {customerCategories.map((category, index) => (
            <div
              id={`partners-${index}`}
              className={`flex flex-col-reverse items-stretch justify-between mx-auto bg-white ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
              key={index}
            >
              <div className="flex-1 flex flex-col justify-center box-border w-full max-lg:px-10 lg:max-w-xl mx-auto">
                <div className="lg:px-4 max-lg:mt-2">
                  <h3 className="text-xl font-bold">
                     {category.type}
                  </h3>
                  <p className="tracking-wider text-sm">
                    {category.description}
                  </p>

                  <ul className="mt-4 space-y-2 text-sm">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p>{item.detail}</p>
                      </li>
                    ))}
                  </ul>

                  {/* Learn More Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => toggleCategory(index)}
                      className="button-animation rounded-full py-1 px-4 inline-flex items-center gap-2"
                      aria-expanded={openCategories[index]}
                    >
                      <span>Learn More</span>
                      <svg
                        className={`w-5 h-5 transition-transform duration-300 ${
                          openCategories[index] ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Accordion Dropdown Content */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openCategories[index]
                        ? "max-h-[2000px] opacity-100 mt-6"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                      {category.dropdownItems?.map((dropItem, dropIndex) => (
                        <div
                          key={dropIndex}
                          className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
                        >
                          <h5 className="font-bold text-lg text-primary-blue mb-2">
                            {dropItem.title}
                          </h5>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {dropItem.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <Image
                src={category.image}
                alt={category.type}
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

export default ListOfPartners;
