import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const Logo = ({
  className,
  spanDesign
}: {
  className?: string;
  spanDesign?: string;
}) => {
  return (
    <Link href={"/"} className="inline-flex">
      <h2
        className={cn(
          "text-2xl text-shop-dark-pink font-black tracking-wider uppercase hover:text-shop-orange hoverEffect group font-sans",
          className
        )}
      >
        Shopdesh
        <span
          className={cn(
            "text-shop-orange group-hover:text-shop-dark-pink hoverEffect",
            spanDesign
          )}
        >
          i
        </span>
      </h2>
    </Link>
  );
};

export default Logo;