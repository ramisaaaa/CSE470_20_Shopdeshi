"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Container from "@/components/Container";
import Logo from "@/components/Logo";
import HeaderMenu from "@/components/HeaderMenu";
import SearchBar from "@/components/SearchBar";
import FavoriteButton from "@/components/FavoriteButton";
import SignIn from "@/components/SignIn";
import CartIcon from "@/components/CartIcon";
import MobileMenu from "@/components/MobileMenu";
import { ClerkLoaded, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const Header = () => {
  const router = useRouter();

  const handleSearch = (query: string, category: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    
    const searchUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    router.push(searchUrl);
  };

  return (
    <header className="py-5 bg-pink-200 border-b border-b-black/20">
      <Container className="flex items-center justify-between text-shop-orange">
        <div className="flex items-center justify-start w-auto gap-3 md:w-1/3 md:gap-0">
          <MobileMenu />
          <Logo />
        </div>

        <HeaderMenu />

        <div className="flex items-center justify-end flex-1 gap-5">
          <SearchBar onSearch={handleSearch} className="flex-grow max-w-3xl md:max-w-10xl lg:max-w-10xl" />
          <CartIcon />
          <FavoriteButton />
          <ClerkLoaded>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignIn />
            </SignedOut>
          </ClerkLoaded>
        </div>
      </Container>
    </header>
  );
};

export default Header;