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
  const linkClassName =
    "text-muted-foreground transition-colors hover:text-foreground";

  return (
    <footer className="bg-muted/40 text-foreground mt-auto w-full border-t">
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
              <p className="text-muted-foreground mb-4 text-sm">
                Hotline:{" "}
                <span className="text-foreground font-semibold">1900 1234</span>
              </p>
              <p className="text-muted-foreground mb-4 text-sm">
                Email: support@onlineauction.vn
              </p>
              <p className="text-muted-foreground text-sm">
                Thời gian: 8:00 - 22:00 (Hằng ngày)
              </p>
            </address>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="text-muted-foreground text-center text-sm">
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
