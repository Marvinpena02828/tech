'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function GaNTechSection() {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.4 });
    
    return (
        <section ref={ref as React.RefObject<HTMLElement>} className="relative w-full overflow-hidden flex items-center" style={{height: "400px", minHeight: "400px"}}>
            {/* Background Image */}
            <div className="absolute inset-0 z-0" style={{backgroundImage: "url('/Images/gantech-section/gantechbackground.avif')", backgroundSize: "cover", backgroundPosition: "50% 50%", objectFit: "cover"}}></div>
            
            {/* White Background Shape with Diagonal Edges - Desktop Only */}
            <div className="absolute inset-0 z-5 hidden lg:block" style={{
                background: "white",
                clipPath: "polygon(0 0, 40% 0, 25% 100%, 0 100%)"
            }}></div>

            {/* Mobile Overlay */}
            <div className="absolute inset-0 z-5 bg-black/50 lg:hidden"></div>

            <div className="relative z-10 w-full px-4 md:px-8 flex flex-col md:flex-row items-center">
                <div className={`w-full lg:w-1/2 text-center lg:text-left transition-all duration-1000 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
                }`}>
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 mb-3 md:mb-4 inline-block">New</span>
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight text-white lg:text-gray-900">
                        GaN Technology<br />
                        <span className="text-blue-400 lg:text-blue-600">Infusion suits</span>
                    </h2>
                    <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white lg:text-gray-900">GaN Technology</h3>
                    <p className="text-white lg:text-gray-700 mb-6 md:mb-8 max-w-md mx-auto lg:mx-0 text-sm md:text-base">
                        Experience the future of charging with our advanced GaN technology. Faster, smaller, and more efficient.
                    </p>
                    <button className="px-6 md:px-8 py-3 bg-transparent border border-white lg:border-gray-900 text-white lg:text-gray-900 font-bold rounded-sm transition-all duration-300 hover:bg-white hover:text-gray-900 lg:hover:bg-gray-900 lg:hover:text-white hover:scale-105 hover:shadow-lg w-auto h-auto text-sm md:text-base">
                        Learn More
                    </button>
                </div>
            </div>
        </section>
    );
}
