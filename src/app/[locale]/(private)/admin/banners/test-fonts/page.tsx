"use client";

import React from "react";

interface FontTest {
  name: string;
  family: string;
  weight?: number;
  displayName: string;
}

const fontTests: FontTest[] = [
  { name: "Arial", family: "Arial", displayName: "Arial" },
  { name: "Arial_bold", family: "Arial_bold", displayName: "Arial Bold" },
  { name: "Mukta Mahee", family: "Mukta Mahee", displayName: "Mukta Mahee" },
  {
    name: "MyriadPro-Light",
    family: "MyriadPro",
    weight: 300,
    displayName: "Myriad Pro Light",
  },
  {
    name: "MyriadPro-Regular",
    family: "MyriadPro",
    weight: 400,
    displayName: "Myriad Pro Regular",
  },
  {
    name: "MyriadPro-Semibold",
    family: "MyriadPro",
    weight: 600,
    displayName: "Myriad Pro Semibold",
  },
  {
    name: "MyriadPro-Bold",
    family: "MyriadPro",
    weight: 700,
    displayName: "Myriad Pro Bold",
  },
  {
    name: "MyriadPro Condensed",
    family: "MyriadPro Condensed",
    weight: 400,
    displayName: "Myriad Pro Condensed",
  },
  {
    name: "MyriadPro Condensed Bold",
    family: "MyriadPro Condensed",
    weight: 700,
    displayName: "Myriad Pro Condensed Bold",
  },
  { name: "Neuropol", family: "Neuropol", displayName: "Neuropol" },
  {
    name: "Play-Regular",
    family: "Play",
    weight: 400,
    displayName: "Play Regular",
  },
  { name: "Play-Bold", family: "Play", weight: 700, displayName: "Play Bold" },
  {
    name: "Poppins-Light",
    family: "Poppins",
    weight: 300,
    displayName: "Poppins Light",
  },
  {
    name: "Poppins-Regular",
    family: "Poppins",
    weight: 400,
    displayName: "Poppins Regular",
  },
  {
    name: "Poppins-Medium",
    family: "Poppins",
    weight: 500,
    displayName: "Poppins Medium",
  },
  {
    name: "Poppins-Semibold",
    family: "Poppins",
    weight: 600,
    displayName: "Poppins Semibold",
  },
  {
    name: "Poppins-Bold",
    family: "Poppins",
    weight: 700,
    displayName: "Poppins Bold",
  },
  {
    name: "SF Pro Display Regular",
    family: "SF Pro Display",
    weight: 400,
    displayName: "SF Pro Display Regular",
  },
  {
    name: "SF Pro Display Medium",
    family: "SF Pro Display",
    weight: 500,
    displayName: "SF Pro Display Medium",
  },
  {
    name: "SF Pro Display Semibold",
    family: "SF Pro Display",
    weight: 600,
    displayName: "SF Pro Display Semibold",
  },
  {
    name: "SF Pro Display Bold",
    family: "SF Pro Display",
    weight: 700,
    displayName: "SF Pro Display Bold",
  },
];

export default function TestFontsPage() {
  return (
    <div className="p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          Banner Font Testing Page
        </h1>
        <p className="text-gray-600 mb-8">
          This page tests all available fonts for the banner system. Each font
          should render distinctly.
        </p>

        <div className="space-y-6">
          {fontTests.map((font) => (
            <div
              key={font.name}
              className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {font.displayName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Family: {font.family}{" "}
                    {font.weight && `| Weight: ${font.weight}`}
                  </p>
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded">
                  {font.name}
                </div>
              </div>

              {/* Test at different sizes */}
              <div className="space-y-3">
                <div
                  style={{
                    fontFamily: font.family,
                    fontWeight: font.weight || 400,
                    fontSize: "48px",
                    color: "#1f2937",
                  }}
                >
                  The Quick Brown Fox Jumps Over The Lazy Dog
                </div>
                <div
                  style={{
                    fontFamily: font.family,
                    fontWeight: font.weight || 400,
                    fontSize: "32px",
                    color: "#4b5563",
                  }}
                >
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                </div>
                <div
                  style={{
                    fontFamily: font.family,
                    fontWeight: font.weight || 400,
                    fontSize: "24px",
                    color: "#6b7280",
                  }}
                >
                  abcdefghijklmnopqrstuvwxyz !@#$%^&*()
                </div>
              </div>

              {/* Dark background test */}
              <div className="mt-4 p-4 bg-gray-900 rounded">
                <div
                  style={{
                    fontFamily: font.family,
                    fontWeight: font.weight || 400,
                    fontSize: "36px",
                    color: "#ffffff",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  }}
                >
                  Banner Preview: {font.displayName}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-bold text-blue-900 mb-2">
            Testing Instructions
          </h2>
          <ul className="list-disc list-inside space-y-2 text-blue-800">
            <li>Each font should have a unique appearance</li>
            <li>
              Font weights should be visually distinct (Light, Regular, Medium,
              Semibold, Bold)
            </li>
            <li>
              All characters should render properly including special characters
            </li>
            <li>
              Fonts should be crisp and clear on both light and dark backgrounds
            </li>
            <li>
              If any font looks identical to another or uses a fallback, there's
              an issue
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
