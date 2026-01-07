# Hướng dẫn Sử dụng Màu sắc (UI Color System)

Dự án sử dụng hệ thống màu **Semantic (Màu theo ý nghĩa)** để hỗ trợ tốt cho cả Dark Mode và dễ dàng bảo trì. Tuyệt đối hạn chế việc sử dụng trực tiếp các mã màu như `gray-500`, `blue-600` trong các component.

## 1. Màu Văn bản (Text Colors)

- **`text-foreground`**: Dùng cho nội dung quan trọng nhất (Tiêu đề, tên sản phẩm, giá tiền).
- **`text-muted-foreground`**: Dùng cho thông tin phụ, labels, văn bản ít quan trọng hơn (thay thế cho `gray-400`, `gray-500`).
- **`text-primary`**: Dùng để nhấn mạnh thông tin thương hiệu hoặc các liên kết quan trọng.
- **`text-destructive`**: Dùng cho các cảnh báo, lỗi, hoặc đánh dấu các trường bắt buộc (`*`).
- **`text-emerald-600`**: Dùng cho văn bản trạng thái "Thành công", "Đã thanh toán" khi đi kèm nền nhạt.

## 2. Màu Nền & Viền (Background & Borders)

- **`bg-background`**: Nền trang web.
- **`bg-card`**: Nền của các khối nội dung, card.
- **`bg-muted`**: Nền cho các khu vực phân tách nhẹ, footer (thay thế cho `gray-50`, `gray-100`).
- **`bg-primary/10`**: Nền nhấn mạnh nhẹ cho các stats hoặc thông tin người dùng.
- **`border`**: Màu viền tiêu chuẩn cho các component.

## 3. Màu Trạng thái & Pattern (Status Patterns)

Để đảm bảo tính nhất quán và hỗ trợ Dark Mode, sử dụng pattern 3 lớp cho các Badge hoặc Block trạng thái:

- **Success**: `bg-emerald-500/10 text-emerald-600 border-emerald-500/20`.
- **Warning**: `bg-amber-500/10 text-amber-600 border-amber-500/20`.
- **Error/Destructive**: `bg-destructive/10 text-destructive border-destructive/20`.
- **Info/Primary**: `bg-primary/10 text-primary border-primary/20`.

### Form Error Messages

Sử dụng pattern đồng nhất cho các thông báo lỗi lỗi mức form (`errors.root`):

```tsx
<div className="bg-destructive/10 border-destructive/20 text-destructive rounded-md border p-3 text-sm">
  {errorMessage}
</div>
```

## 4. Biểu đồ (Charts)

Khi cấu hình `chartConfig` trong `ChartContainer`:

- **Active/Primary**: `var(--color-emerald-500)` hoặc `var(--color-primary)`.
- **Secondary/Completed**: `var(--color-blue-500)`.
- **Warning/Pending**: `var(--color-amber-500)`.
- **Destructive/Rejected**: `var(--color-red-500)`.
- **Neutral**: `var(--muted)`.

## 5. Hiệu ứng Hover & Tương tác (Hover & Interaction Effects)

Để tạo phản hồi thị giác tốt cho người dùng, hãy áp dụng các nguyên tắc sau:

- **Primary Hover (Navigation, Sidebar Items)**: Sử dụng nền mờ kết hợp đổi màu text.
  - _Pattern_: `hover:bg-primary/10 hover:text-primary transition-all duration-300`.
- **Secondary Hover (Nút phụ, Dropdown Items)**: Sử dụng màu nền hệ thống.
  - _Pattern_: `hover:bg-accent hover:text-accent-foreground transition-all`.
- **Destructive Hover (Nút Xóa, Đăng xuất)**:
  - _Pattern_: `hover:bg-destructive/10 hover:text-destructive transition-colors`.
- **Hiệu ứng Thu phóng (Scale)**:
  - **Hover (Nhấn mạnh nhẹ)**: Sử dụng `hover:scale-105` cho các thành phần như Avatar, Icon quan trọng.
  - **Active (Phản hồi Click)**: Sử dụng `active:scale-95` cho các nút bấm chính (Toggle Button, FAB).
- **Trạng thái Loading**: Sử dụng `bg-muted` cho các khối skeleton lớn.

## 6. Ghi chú chung

1. **Tuyệt đối không** sử dụng trực tiếp các class `text-gray-XXX` hoặc `text-red-XXX`. Thay vào đó hãy dùng `muted-foreground` và `destructive`.
2. Sử dụng `emerald` thay cho `green` để đảm bảo độ tươi màu nhất quán trên hệ thống shadcn/ui.
3. Độ mờ (opacity) phổ biến cho nền là `/10` và cho viền là `/20`.
