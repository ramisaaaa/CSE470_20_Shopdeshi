import React from "react";
import Container from "./Container";
import { Clock, Mail, Map, Phone } from "lucide-react";

interface ContactItemData {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
}

const data: ContactItemData[] = [
    {
        title: "Visit Us",
        subtitle: "Dhaka, Bangladesh",
        icon: (
            <Map className="w-6 h-6 transition-colors text-lightOrange group-hover:text-primary" />
        ),
    },
    {
        title: "Call us",
        subtitle: "+8801234567891",
        icon: (
            <Phone className="w-6 h-6 transition-colors text-lightOrange group-hover:text-primary" />
        ),
    },
    {
        title: "Working Hours",
        subtitle: "Sunday- Thursday : 9.00 Am - 9.00 Pm",
        icon: (
            <Clock className="w-6 h-6 transition-colors text-lightOrange group-hover:text-primary" />
        ),
    },
    {
        title: "Email",
        subtitle: "ShopDeshi247@gmail.com",
        icon: (
            <Mail className="w-6 h-6 transition-colors text-lightOrange group-hover:text-primary" />
        ),
    },
];

const FooterTop = () => {
    return (
        <div className="grid grid-cols-2 gap-8 py-8 border-b lg:grid-cols-4">
            {data?.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-4 transition-colors group hover:bg-lightOrange">
                    {item.icon}
                    <div>
                        <h3 className="font-semibold text-orange-900 group-hover:text-black">{item.title}</h3>
                        <p className="mt-1 text-sm text-orange-600 group-hover:text-orange-900">{item.subtitle}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FooterTop;