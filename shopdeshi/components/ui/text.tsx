import React from 'react';
import { cn } from "@/lib/utils";

const Title = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h2 
      className={cn(
        "text-2xl md:text-3xl text-shop-dark-pink capitalize tracking-wide mb-5",
        className
      )}
    >
      {children}
    </h2>
  );
};

export default Title;