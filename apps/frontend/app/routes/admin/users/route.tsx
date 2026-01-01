import type { Route } from "./+types/route";

// eslint-disable-next-line no-empty-pattern
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Quản Lý Người Dùng - Online Auction" },
    {
      name: "description",
      content: "Trang quản lý người dùng cho ứng dụng Đấu Giá Trực Tuyến",
    },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return {};
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  return {};
}

export default function ManageUsersPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Manage Users</h1>
      <p>Content for Manage Users goes here.</p>
    </div>
  );
}
