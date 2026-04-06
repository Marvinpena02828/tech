'use client';

import React from 'react';
import Image from 'next/image';
import { Award, Star, Medal, Trophy } from 'lucide-react';

export default function CompanyHonors() {
  const honors = [
    {
      id: 1,
      title: 'Top 10 Consumer Electronics Brand',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=900&fit=crop&q=80',
      icon: Trophy,
    },
    {
      id: 2,
      title: 'Innovation Excellence Award',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&h=900&fit=crop&q=80',
      icon: Star,
    },
    {
      id: 3,
      title: 'Best Quality Manufacturer',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=900&fit=crop&q=80',
      icon: Medal,
    },
    {
      id: 4,
      title: 'Export Excellence Award',
      year: '2022',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=900&fit=crop&q=80',
      icon: Award,
    },
    {
      id: 5,
      title: 'Green Manufacturing Certificate',
      year: '2022',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=900&fit=crop&q=80',
      icon: Award,
    },
    {
      id: 6,
      title: 'Customer Satisfaction Award',
      year: '2021',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=900&fit=crop&q=80',
      icon: Star,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-[#00CED1] tracking-widest mb-4">
            COMPANY HONORS
          </h2>
          <div className="w-20 h-1 bg-[#00CED1] mx-auto mb-6" />
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Recognition of our commitment to excellence and innovation in the industry.
          </p>
        </div>

        {/* Honors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {honors.map((honor, index) => {
            const IconComponent = honor.icon;
            return (
              <div
                key={honor.id}
                className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
                style={{
                  animation: `fadeInUp 0.7s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#3A2E59]/5 to-[#00CED1]/5">
                  <Image
                    src={honor.image}
                    alt={honor.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Icon Overlay */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <IconComponent size={24} className="text-[#00CED1]" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold text-[#00CED1] bg-[#00CED1]/10 px-3 py-1 rounded-full">
                      {honor.year}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#3A2E59] group-hover:text-[#00CED1] transition-colors">
                    {honor.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
