import React from "react";
import { Link } from "react-router";

import { Separator } from "@/components/ui/separator";
import { APP_ROUTES } from "@/constants/routes";

const aboutLinks = [
  { label: "Giới thiệu", to: APP_ROUTES.HOME },
  { label: "Đội ngũ", to: APP_ROUTES.HOME },
  { label: "Tuyển dụng", to: APP_ROUTES.HOME },
];

const policyLinks = [
  { label: "Điều khoản sử dụng", to: APP_ROUTES.HOME },
  { label: "Chính sách bảo mật", to: APP_ROUTES.HOME },
  { label: "Quy định đấu giá", to: APP_ROUTES.HOME },
  { label: "Phương thức thanh toán", to: APP_ROUTES.HOME },
];

const contactLinks = [
  { label: "Hỗ trợ khách hàng", to: APP_ROUTES.HOME },
  { label: "Trung tâm trợ giúp", to: APP_ROUTES.HOME },
  { label: "Góp ý - Khiếu nại", to: APP_ROUTES.HOME },
];

const Footer = () => {
  const linkClassName = "text-slate-300 transition-colors hover:text-white";

  return (
    <footer className="mt-auto w-full bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Về chúng tôi</h3>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className={linkClassName}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Chính sách</h3>
            <ul className="space-y-2">
              {policyLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className={linkClassName}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Liên hệ</h3>
            <ul className="space-y-2">
              {contactLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className={linkClassName}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              Kết nối với chúng tôi
            </h3>
            <address className="not-italic">
              <p className="mb-4 text-sm text-slate-300">
                Hotline:{" "}
                <span className="font-semibold text-white">1900 1234</span>
              </p>
              <p className="mb-4 text-sm text-slate-300">
                Email: support@onlineauction.vn
              </p>
              <p className="text-sm text-slate-300">
                Thời gian: 8:00 - 22:00 (Hằng ngày)
              </p>
            </address>
          </div>
        </div>

        <Separator className="my-6 bg-slate-700" />

        <div className="text-center text-sm text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Online Auction. All rights
            reserved. | Sàn đấu giá trực tuyến uy tín hàng đầu Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
