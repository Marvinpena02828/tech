import Image from "next/image";

Image;

const Banner = () => {
  return (
    <div className="relative h-[500px] w-full">
      <Image
        fill
        src="/news/banner.jpg"
        alt="News Banner"
        className="w-full h-auto object-cover"
      />

      {/* Content */}
      <div className="absolute top-[10%] md:left-[10%] left-[30%] transform text-white -translate-x-1/2 z-10 text-center text-2xl px-4 ">
        <span className="uppercase tracking-wider text-2xl font-arial-bold tracking-widest ">
          Empowered by
        </span>
        <br />
        <span
          className=" font-neuropol uppercase tracking-wider font-semibold "
          style={{ fontFamily: "var(--font-neuropol), sans-serif" }}
        >
          INNOVATIONS
        </span>
      </div>

      {/* title */}
      <h1 className="absolute bottom-[10%] right-[10%] text-white text-4xl ">
        News
      </h1>
    </div>
  );
};

export default Banner;
