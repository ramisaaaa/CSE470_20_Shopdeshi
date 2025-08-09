import { cn } from "@/lib/utils";
import React from "react";

const Title = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <h2 className={cn(
            "text-3xl font-bold text-shop-dark-pink capitalize tracking-wide font-sans", 
            className
        )}>
            {children}
        </h2>
    );
};

const SubTitle = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <h3 className={cn(
            "text-3xl font-semi bold text-shop-purple capitalize tracking-wide font-sans", 
            className
        )}>
            {children}
        </h3>
    );
};

const SubText = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <p className={cn("text-orange-600 text-sm", className)}>
            {children}
        </p>
    );
};

export { Title, SubText, SubTitle };