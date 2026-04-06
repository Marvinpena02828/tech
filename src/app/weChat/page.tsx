import Image from "next/image";
import React from "react";
const page = () => {
  return (
    <div className="w-full min-h-screen flex items-start justify-center bg-white">
      <div className="mt-12">
        <Image
          className=""
          src="/wechat-qr.jpg"
          alt="WeChat QR"
          width={500}
          height={500}
        />
        <h1 className="text-3xl text-center font-bold">Scan to Connect with us</h1>
      </div>
    </div>
  );
};

export default page;
