"use client";

import React from "react";
import Link from "next/link";

interface HeaderProps {
  activeTop?: string; // e.g. 'Profile'
  activeBottom?: string; // e.g. 'Samples'
}

export default function Header({ activeTop, activeBottom }: HeaderProps) {
  const topLinks = ["Profile", "Explore", "Upload", "Saved", "Created"];
  const bottomLinks = ["Samples", "Preset", "Packs"];

  const baseLinkClasses =
    "block py-1 text-white hover:text-[#343a40] hover:bg-[#00f0ff] transition-colors text-center";
  const activeLinkClasses =
    "bg-[#0396ff] text-[#343a40] font-semibold rounded-lg";

  return (
    <header className="w-full fixed top-0 z-50">
      <nav className="bg-[#343a40]">
        <ul className="flex justify-center space-x-2">
          {topLinks.map((link) => (
            <li key={link} className="flex-1 min-w-[140px]">
              <Link
                href={`/${link.toLowerCase()}/samples`}
                className={`${baseLinkClasses} ${
                  activeTop === link ? activeLinkClasses : ""
                }`}
              >
                {link}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="flex justify-center space-x-2 mt-1">
          {bottomLinks.map((link) => (
            <li key={link} className="flex-1 min-w-[140px]">
              <Link
                href={`/${link.toLowerCase()}`}
                className={`${baseLinkClasses} ${
                  activeBottom === link ? activeLinkClasses : ""
                }`}
              >
                {link}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
