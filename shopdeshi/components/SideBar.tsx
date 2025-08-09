import React from "react";
import Logo from "./Logo";
import { X } from "lucide-react";
import { headerData } from "@/constants/data";
import { Store, User, Heart } from "lucide-react";

interface SideBarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SideBar: React.FC<SideBarProps> = ({ isOpen, onClose }) => {
  // If isOpen is undefined, always show (desktop); if false, hide (mobile drawer)
  if (isOpen === false) return null;
  return (
    <aside className="fixed top-0 left-0 z-50 flex flex-col w-64 h-full text-black shadow-lg bg-shop-light-blue transition-transform duration-300">
      <div className="relative flex items-center justify-between p-6 border-b border-shop-orange h-32 w-64 overflow-hidden">
        {/* Light pink overlay for better contrast */}
        <div className="absolute inset-0 bg-pink-200/70 z-0" />
        <div className="relative z-10 flex items-center w-full justify-between">
          <Logo className="text-2xl" />
          {onClose && (
            <button onClick={onClose} aria-label="Close sidebar">
              <X className="w-6 h-6 hover:text-shop-orange" />
            </button>
          )}
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-4">
          {headerData.filter(item => item.title && item.href).map((item, idx) => (
            <li key={idx}>
              <a href={item.href} className="block hover:text-shop-orange text-lg font-medium">
                {item.title}
              </a>
            </li>
          ))}
          <li>
            <a href="/shop" className="flex items-center gap-2 hover:text-shop-orange text-lg font-medium">
              <Store className="w-5 h-5" /> Shop
            </a>
          </li>
          <li>
            <a href="/seller" className="flex items-center gap-2 hover:text-shop-orange text-lg font-medium">
              <User className="w-5 h-5" /> Seller Dashboard
            </a>
          </li>
          <li>
            <a href="/buyer" className="flex items-center gap-2 hover:text-shop-orange text-lg font-medium">
              <Heart className="w-5 h-5" /> Buyer Dashboard
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;