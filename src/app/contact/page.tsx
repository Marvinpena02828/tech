import type { Metadata } from "next";
import { Mail } from "lucide-react";
import ContactBanner from "@/app/contact/components/ContactBanner";
import ContactForm from "./components/ContactForm";
import { getContactInfo } from "@/actions/contactInfo";
import { getAddresses } from "@/actions/address";
import * as LucideIcons from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact AyyanTech – Get in Touch with Ayyan Technology",
  description:
    "Contact AyyanTech for B2B electronics inquiries, wholesale smartphone accessories, and partnership opportunities. Reach Ayyan Technology today.",
  alternates: {
    canonical: "https://ayyantech.net/contact",
  },
};

export default async function ContactPage() {
  // Fetch contact info and addresses from database
  const contactInfos = await getContactInfo();
  const addresses = await getAddresses();
  return (
    <div className="bg-white">
      <ContactBanner />

      {/* Main Content Grid */}
      <section className=" px-6 sm:px-8 lg:px-12 pb-20 py-8 bg-white">
        <div className="flex flex-col  gap-6 lg:gap-10 container">
          {/* left */}
          <div className="flex-2/12 w-full  py-16">
            <h2 className="heading text-center text-black mb-6">Contact Us</h2>
            <p className="text-center mb-6">
              Please fill out the form below to get in touch with us.
            </p>
            <ContactForm />
          </div>

          {/* Right Column - Addresses */}
          <div className="space-y-3 flex-1 text-center">
            <h1 className="heading">Mytechon Innovations</h1>
            {addresses.map((address, idx) => {
              return (
                <div key={address.id}>
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <div className="text-center w-full text-base">
                      <h3 className="text-2xl  text-[#3A2E59]">
                        {address.title}
                      </h3>

                      <p className="w-full text-[#333333] leading-relaxed">
                        {address.address_line1}
                        {address.address_line2 && (
                          <>
                            <br />
                            {address.address_line2}
                          </>
                        )}
                        <br />
                        {[
                          address.city,
                          address.state_province,
                          address.country,
                          address.postal_code,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                        <br />
                      </p>

                      {address.map_link && (
                        <Link
                          href={address.map_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#8A2BE2] hover:text-[#3A2E59] transition-colors text-md font-medium inline-block mt-2"
                        >
                          View on Map →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <p>
              <span className="font-semibold text-base">Email:</span>{" "}
              sales@ayyantech.net
            </p>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="heading  text-center text-black mb-6">
          Contact Us For More Inquiries
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-center py-8 items-stretch ">
          {contactInfos.map((info, index) => {
            // Dynamically get the icon component from lucide-react
            const IconComponent = (LucideIcons as any)[info.icon_name] || Mail;

            return (
              <div
                key={info.id}
                className="p-12 flex-1 flex flex-col items-center bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <IconComponent size={70} className="mb-4 text-black" />
                <h3 className="text-2xl font-bold text-black mb-2">
                  {info.title}
                </h3>
                <p className="text-[#666666] mb-4">
                  {info.link ? (
                    <Link
                      href={info.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-purple-600 transition-colors"
                    >
                      {info.label}
                    </Link>
                  ) : (
                    info.label
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
