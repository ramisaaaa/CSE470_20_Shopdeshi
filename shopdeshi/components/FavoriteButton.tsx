import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from './WishlistContext';
import Link from 'next/link';

const FavoriteButton = () => {
  const { wishlist } = useWishlist();
  return (
    <Link href="/wishlist" className="relative group" aria-label="Wishlist">
      <Heart className="w-5 h-5 hover:text-shop-orange hoverEffect" />
      <span className="absolute -top-1 -right-1 bg-shop-dark-pink text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center">{wishlist.length}</span>
    </Link>
  );
};

export default FavoriteButton;