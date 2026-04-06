"use client";
import { Send, CheckCircle, X } from "lucide-react";
import React, { useEffect, useState } from "react";

const ContactForm = () => {
  const [captcha, setCaptcha] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    contactInfo: "",
    email: "",
    subject: "General Inquiry",
    message: "",
    code: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission

    if (formData.code !== captcha) {
      alert("Invalid captcha code!");
      return;
    }

    // post to formspree(https://formspree.io/f/mldqlpjq)
    const response = await fetch("https://formspree.io/f/mldqlpjq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setFormData({
        nickname: "",
        contactInfo: "",
        email: "",
        subject: "General Inquiry",
        message: "",
        code: "",
      });
      setShowSuccessModal(true);
    } else {
      alert("There was an error submitting your message.");
    }
  };

  const generateCaptcha = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";

    const code =
      letters[Math.floor(Math.random() * letters.length)] +
      letters[Math.floor(Math.random() * letters.length)] +
      letters[Math.floor(Math.random() * letters.length)] +
      numbers[Math.floor(Math.random() * numbers.length)];

    return code;
  };

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 w-full max-w-4xl mx-auto"
      >
        {/* Name Field */}

        {/* nickname */}
        <div>
          <label
            htmlFor="nickname"
            className="block text-sm font-semibold text-[#3A2E59] mb-2"
          >
            Name *
          </label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            required
            placeholder="Please enter a nickname"
            className="w-full px-4 py-3 bg-white border"
          />
        </div>
        {/* contact info */}
        <div>
          <label
            htmlFor="contactInfo"
            className="block text-sm font-semibold text-[#3A2E59] mb-2"
          >
            Contact Info
          </label>
          <input
            type="text"
            id="contactInfo"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            placeholder="Please enter contact phone no. (Optional)"
            className="w-full px-4 py-3 bg-white border"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Email Field */}
          <div className="flex-1 w-full">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#3A2E59] mb-2"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Please enter your email address"
              className="w-full px-4 py-3 bg-white border"
            />
          </div>

          {/* Email Field */}
          <div className="flex-1">
            <label
              htmlFor="code"
              className="block text-sm font-semibold text-[#3A2E59] mb-2"
            >
              Code *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="Please enter the code"
                className="w-full px-4 py-3 bg-white border"
              />

              <div
                onClick={() => setCaptcha(generateCaptcha())}
                className="cursor-pointer bg-blue-200 w-28 h-12 flex items-center justify-center rounded-md shadow-inner select-none relative overflow-hidden"
              >
                {captcha.split("").map((c, i) => {
                  const randomRotate = Math.floor(Math.random() * 30) - 20; // -15 to +15°
                  const randomY = Math.floor(Math.random() * 12) - 5; // small vertical shift

                  return (
                    <span
                      key={i}
                      className="text-gray-800 font-semibold absolute "
                      style={{
                        left: `${15 + i * 10}px`,
                        top: `calc(50% + ${randomY}px)`,
                        transform: `translateY(-50%) rotate(${randomRotate}deg)`,
                        fontSize: "15px",
                        fontFamily: "monospace",
                      }}
                    >
                      {c}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Message Textarea */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-semibold text-[#3A2E59] mb-2"
          >
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Please enter the message content"
            className="w-full px-4 py-3 bg-white border"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-fit button-animation py-2 px-5 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 "
        >
          <span>Submit</span>
        </button>
      </form>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-8 text-center relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-[#3A2E59] mb-2">
              Message Sent!
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Thank you for reaching out to Ayyan Tech. One of our specialists
              will contact you soon. We look forward to powering your vision.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 px-4 bg-[#3A2E59] hover:bg-[#2a2140] text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactForm;
