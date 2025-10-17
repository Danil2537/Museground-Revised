/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { createContext, useState, useContext, ReactNode } from "react";

const AccordionContext = createContext<{
  openItem: string | null;
  toggleItem: (id: string) => void;
}>({
  openItem: null,
  toggleItem: () => {},
});

export function Accordion({
  children,
  type,
  className = "",
}: {
  children: ReactNode;
  type?: string;
  className?: string;
}) {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const toggleItem = (id: string) =>
    setOpenItem((prev) => (prev === id ? null : id));

  return (
    <AccordionContext.Provider value={{ openItem, toggleItem }}>
      <div className={`space-y-2 ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  children,
  value,
  className = "",
}: {
  children: ReactNode;
  value: string;
  className?: string;
}) {
  return (
    <div className={`border border-zinc-800 rounded-lg ${className}`}>
      {children}
    </div>
  );
}

export function AccordionTrigger({
  children,
  className = "",
  value,
}: {
  children: ReactNode;
  className?: string;
  value: string;
}) {
  const { openItem, toggleItem } = useContext(AccordionContext);
  const isOpen = openItem === value;

  return (
    <div
      className={`px-3 py-2 font-semibold flex justify-between items-center text-gray-100 cursor-pointer ${className}`}
      onClick={() => toggleItem(value)}
    >
      <div className="flex-1">{children}</div>
      <span className="ml-2 text-cyan-400 hover:text-cyan-300 select-none">
        {isOpen ? "−" : "+"}
      </span>
    </div>
  );
}

export function AccordionContent({
  children,
  value,
  className = "",
}: {
  children: ReactNode;
  value: string;
  className?: string;
}) {
  const { openItem } = useContext(AccordionContext);
  const isOpen = openItem === value;
  return (
    <div
      className={`transition-all overflow-hidden ${
        isOpen ? "max-h-[1000px] p-3" : "max-h-0 p-0"
      } text-sm text-gray-300 ${className}`}
    >
      {isOpen && children}
    </div>
  );
}
