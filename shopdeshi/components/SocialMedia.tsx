import React from 'react';
import { cn } from '@/lib/utils';
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';

interface SocialMediaProps {
  className?: string;
  iconClassName?: string;
  tooltipClassName?: string;
}

const socialMediaLinks = [
  {
    name: 'Facebook',
    href: 'https://facebook.com/shopdeshi',
    icon: Facebook,
  },
  {
    name: 'Instagram', 
    href: 'https://instagram.com/shopdeshi',
    icon: Instagram,
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/shopdeshi', 
    icon: Twitter,
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/shopdeshi',
    icon: Youtube,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/shopdeshi',
    icon: Linkedin,
  },
];

const SocialMedia = ({ 
  className, 
  iconClassName, 
  tooltipClassName 
}: SocialMediaProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {socialMediaLinks.map((social) => {
        const IconComponent = social.icon;
        return (
          <div key={social.name} className="relative group">
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "p-2 rounded-full border-2 transition-all duration-300 hover:scale-110",
                iconClassName
              )}
              aria-label={`Visit our ${social.name} page`}
            >
              <IconComponent className="w-4 h-4" />
            </a>
            
            {/* Tooltip */}
            <div className={cn(
              "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap",
              tooltipClassName
            )}>
              {social.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SocialMedia;