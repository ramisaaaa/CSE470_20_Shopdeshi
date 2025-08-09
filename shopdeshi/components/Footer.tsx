import React from 'react';
import Container from "@/components/Container";
import FooterTop from "./FooterTop";
import Logo from "./Logo";
import SocialMedia from "./SocialMedia";
import { SubText } from "./Text";
import { SubTitle } from "./Text";
import { categoriesData, quickLinksData } from "@/constants/data";
import Link from "next/link";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <Container>
        <FooterTop />
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <SubText>
              Discover your favorite products directly from the makers themselves helping them avoid any third party interaction and taking control of their creations.
            </SubText>
            
            <SocialMedia 
              className="text-shop-light-green" 
              iconClassName="border-darkColor/60 hover:border-shop-light-green hover:text-shop-light-green"
              tooltipClassName="bg-darkColor text-white" 
            />
          </div>
          
          <div>
            <SubTitle>Quick Links</SubTitle>
            <ul className="mt-4 space-y-3">
              {quickLinksData?.map((item) => (
                <li key={item?.title}>
                  <Link href={item?.href} className="text-gray-600 transition-colors hover:text-shop-orange">
                    {item?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <SubTitle>Categories</SubTitle>
            <ul className="mt-4 space-y-3">
              {categoriesData?.map((item) => (
                <li key={item?.title}>
                  <Link href={`/category/${item?.href}`} className="text-gray-600 transition-colors hover:text-shop-orange">
                    {item?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-4">
            <SubTitle>Newsletter</SubTitle>
            <SubText>Subscribe to receive new updates and exclusive offers</SubText>
            <form className="space-y-3">
              <Input placeholder="Enter your Email" type="email" required />
              <Button className="w-full">Subscribe</Button>
            </form>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;