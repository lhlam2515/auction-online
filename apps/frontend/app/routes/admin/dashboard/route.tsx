import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bảng Điều Khiển Quản Trị - Online Auction" },
    {
      name: "description",
      content: "Trang bảng điều khiển quản trị cho ứng dụng Đấu Giá Trực Tuyến",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function AdminDashboardPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
      <p>Content for Admin Dashboard goes here.</p>
    </div>
  );
}
