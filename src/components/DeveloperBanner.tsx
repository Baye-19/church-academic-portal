import React from 'react';
import { Phone, Mail, Code } from 'lucide-react';

export const DeveloperBanner: React.FC = () => {
  return (
    <footer className="w-full bg-[#120803] border-t border-[#4A2715] px-4 py-2.5 text-[11px] text-[#CBB39C] mt-8 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-center sm:text-left">
        {/* Developer Title */}
        <div className="flex items-center gap-1.5 text-[#F5A623] font-bold text-[11px]">
          <Code className="w-3.5 h-3.5 text-[#FBB03B] shrink-0" />
          <span>
            Developed by <span className="text-white font-extrabold">Baye Nigusu(ብርሃነ መስቀል)</span>
          </span>
        </div>

        {/* Contact Info (Phone & Email) */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-5 text-[11px] font-medium">
          {/* Phone Number */}
          <a
            href="tel:0969278258"
            className="flex items-center gap-1.5 text-[#CBB39C] hover:text-[#F5A623] transition-colors"
            title="Call 0969278258"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[#CBB39C]">Phone:</span>
            <span className="font-bold text-white hover:underline">0969278258</span>
          </a>

          {/* Email */}
          <a
            href="mailto:bayenigusu4104@gmail.com"
            className="flex items-center gap-1.5 text-[#CBB39C] hover:text-[#F5A623] transition-colors"
            title="Send Email to bayenigusu4104@gmail.com"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[#CBB39C]">Email:</span>
            <span className="font-bold text-white hover:underline">bayenigusu4104@gmail.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
};


