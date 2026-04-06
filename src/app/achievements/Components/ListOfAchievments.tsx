"use client";

import Image from "next/image";
import React from "react";

export const achievements = [
  {
    image: "/achievements/page/experience.jpg",
    title: "12+Years of Industry Experience",
    description: (
      <>
        Backed by 12+ years of hands-on industry expertise, we specialize in
        delivering reliable, future-ready consumer electronics and accessories.
        Our extensive experience enables us to anticipate market demands,
        maintain strict quality standards, and offer solutions that meet
        international benchmarks making us a trusted partner for distributors,
        retailers, and OEM clients worldwide.
        <br />
        <br />
        We have been at the forefront of the consumer electronics industry,
        continuously refining our processes, strengthening our supply chain, and
        enhancing product performance. This experience empowers us to deliver
        consistent quality, competitive value, and scalable solutions tailored
        to our clients’ business growth. Over the years, we have successfully
        supported businesses with high-performance products, earning long-term
        trust through professionalism, transparency, and dependable service.
      </>
    ),
  },
  {
    image: "/achievements/page/customerSatisfaction.jpg",
    title: "100% Customer Satisfaction",
    description: (
      <>
        We strive for 100% customer satisfaction by focusing on quality,
        reliability, and continuous improvement. Every product is developed and
        delivered with precision, ensuring compliance with industry standards
        and customer requirements. Our dedicated support team works closely with
        clients to provide solutions that add real value to their business.
        <br />
        <br />
        Customer satisfaction is at the core of everything we do. We are
        committed to delivering high-quality products, consistent performance,
        and dependable service that meet and exceed customer expectations.
        Through strict quality control, timely delivery, and responsive support,
        we ensure a seamless experience that builds trust and long-term
        partnerships.
      </>
    ),
  },
  {
    image: "/achievements/page/global.jpg",
    title: "Trusted by 150+ Brand Partners",
    description: (
      <>
        Trusted by 150+ Brand Partners Our portfolio includes 150+ strategic
        brand collaborations, demonstrating our capability to deliver OEM/ODM
        solutions that empower brands to compete confidently in fast-evolving
        markets. Each partnership is built on transparency, performance, and
        shared success. Our extensive cooperation experience reflects strong
        market trust, long-term relationships, and our ability to align with
        diverse brand visions across global markets.
        <br />
        <br />
        Our collaborative approach ensures mutual growth and sustainable
        success.
      </>
    ),
  },
  {
    image: "/achievements/page/propertyRights.jpg",
    title: "Protected Innovation l Proven Expertise",
    description: (
      <>
        Our portfolio includes 150+ strategic brand collaborations,
        demonstrating our capability to deliver OEM/ODM solutions that empower
        brands to compete confidently in fast-evolving markets. Each partnership
        is built on transparency, performance, and shared success. Our extensive
        cooperation experience reflects strong market trust, long-term
        relationships, and our ability to align with diverse brand visions
        across global markets.
        <br />
        <br />
        Our collaborative approach ensures mutual growth and sustainable
        success.
      </>
    ),
  },
];

const ListOfAchievments = () => {
  return (
    <section className="font-poppins bg-white">
      <div className="lg:container px-2 xl:px-16 mx-auto">
        <div className="mt-6 max-lg:space-y-6 space-y-10">
          {achievements.map((achivement, index) => (
            <div
              id={`achivement-${index}`}
              className={`flex flex-col-reverse items-stretch justify-between mx-auto bg-white ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}
              key={index}
            >
              <div className="flex-1 flex flex-col justify-center box-border w-full max-lg:px-10 lg:max-w-xl mx-auto">
                <div className="lg:px-4 max-lg:mt-2">
                  <h1 className="text-lg lg:text-xl font-bold mb-4">
                    {achivement.title}
                  </h1>
                  <p className="text-black text-base ">
                    {achivement.description}
                  </p>
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

export default ListOfAchievments;
