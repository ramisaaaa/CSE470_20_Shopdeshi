import React from 'react';
import Link from 'next/link';
import Title from '../components/ui/text';
import Image from 'next/image';
import banner from '../images/banner/banner.png';

const HomeBanner = () => {
  return (
    <div className='flex items-center justify-between px-10 py-16 rounded-lg md:py-0 bg-shop-dark-pink lg:px-24'>
      <div>
        <Title>
          Biggest Summer Sale!<br />
          Grab upto 50% discount on all <br />
          products by HomeMakers!
        </Title>
        <Link 
          href={"/shop"} 
          className="px-5 py-2 rounded-md bg-shop-dark-green/90 text-white/90 hover:text-white hover:bg-shop-dark-green hoverEffect"
        >
          Buy now
        </Link>
      </div>
      <div>
        <Image src={banner} alt="banner" className="hidden md:inline-flex w-96" />
      </div>
    </div>
  );
};

export default HomeBanner;