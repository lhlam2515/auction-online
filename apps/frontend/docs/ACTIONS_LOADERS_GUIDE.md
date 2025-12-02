# Hướng Dẫn Actions và Loaders

> **React Router v7** - Data fetching với Loaders và form handling với Actions

## 📚 Mục Lục

- [Khái Niệm](#khái-niệm)
- [Cấu Trúc](#cấu-trúc)
- [Loaders](#loaders)
- [Actions](#actions)
- [Tích Hợp Routes](#tích-hợp-routes)
- [Patterns Thường Dùng](#patterns-thường-dùng)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Khái Niệm

| Khái niệm  | Mục đích                            | Khi nào chạy        |
| ---------- | ----------------------------------- | ------------------- |
| **Loader** | Load dữ liệu trước khi render       | Trước khi vào route |
| **Action** | Xử lý mutations (POST, PUT, DELETE) | Khi submit form     |

## Cấu Trúc

```text
app/lib/
├── loaders/    # 9 files: auth, bid, category, order, product, question, rating, seller, user
└── actions/    # 7 files: auth, bid, order, product, question, rating, user
```

---

## Loaders

### Cú Pháp

```typescript
import type { LoaderFunctionArgs } from "react-router";

export async function myLoader({ request, params }: LoaderFunctionArgs) {
  const data = await Service.getData(params.id);
  return { data };
}
```

### Danh Sách Loaders

**Auth** (3): `currentUserLoader`, `guestOnlyLoader`, `verifyEmailLoader`

**Product** (4): `searchProductsLoader`, `topListingsLoader`, `productDetailsLoader`, `relatedProductsLoader`

**Bid** (2): `myBidsLoader`, `winningBidsLoader`

**Order** (2): `orderHistoryLoader`, `orderDetailsLoader`

**User** (2): `userProfileLoader`, `watchlistLoader`

**Seller** (2): `sellerProductsLoader`, `sellerStatsLoader`

**Category** (1): `categoriesLoader`

**Question** (1): `productQuestionsLoader`

**Rating** (1): `productRatingsLoader`

### Query Parameters

```typescript
export async function searchProductsLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const filters = {
    keyword: url.searchParams.get("keyword") || "",
    page: parseInt(url.searchParams.get("page") || "1"),
  };
  return await ProductService.search(filters);
}
```

### Error Handling

```typescript
if (!product) {
  throw new Response("Not found", { status: 404 });
}
```

### Parallel Loading

```typescript
const [product, reviews] = await Promise.all([
  ProductService.getById(id),
  RatingService.getByProductId(id),
]);
```

---

## Actions

### Cú Pháp Action

```typescript
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";

export async function myAction({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const result = await Service.create(Object.fromEntries(formData));
  return redirect(`/success/${result.id}`);
}
```

### Danh Sách Actions

**Auth** (6): `registerAction`, `loginAction`, `logoutAction`, `forgotPasswordAction`, `verifyOtpAction`, `resetPasswordAction`

**Product** (5): `createProductAction`, `updateDescriptionAction`, `toggleAutoExtendAction`, `uploadImagesAction`, `deleteProductAction`

**Bid** (1): `placeBidAction`

**Order** (2): `checkoutAction`, `updateOrderStatusAction`

**Question** (2): `askQuestionAction`, `answerQuestionAction`

**Rating** (1): `rateSellerAction`

**User** (3): `updateProfileAction`, `changePasswordAction`, `toggleWatchlistAction`

### Form Data Types

```typescript
// 1. Form data
const formData = await request.formData();
const email = formData.get("email") as string;

// 2. JSON data
const product = await request.json();

// 3. File upload
const files = formData.getAll("images") as File[];
```

### Validation với Zod

```typescript
import { z } from "zod";

const Schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8),
});

const result = Schema.safeParse(data);
if (!result.success) {
  return { errors: result.error.flatten().fieldErrors };
}
```

---

## Tích Hợp Routes

### Re-export Loader và Action

Cách đơn giản nhất là re-export trực tiếp từ thư viện loaders/actions:

```typescript
// app/routes/profile/route.tsx
import type { Route } from "./+types/route";
import { currentUserLoader } from "@/lib/loaders/auth.loaders";
import { updateProfileAction } from "@/lib/actions/user.actions";

// Re-export loader và action
export const clientLoader = currentUserLoader;
export const clientAction = updateProfileAction;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Profile - Online Auction" },
    { name: "description", content: "User profile page" },
  ];
}

export default function ProfilePage() {
  const user = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();

  return (
    <Form method="post">
      <input name="name" defaultValue={user.name} />
      <button type="submit">Cập nhật</button>
      {actionData?.success && <p>✓ Thành công</p>}
    </Form>
  );
}
```

---

## Patterns Thường Dùng

### Protected Route

```typescript
export async function protectedLoader({ request }: LoaderFunctionArgs) {
  const user = await AuthService.getCurrentUser();
  if (!user) throw redirect("/login");
  return { user };
}
```

### Optimistic UI

```typescript
function BidForm({ productId, currentPrice }: Props) {
  const fetcher = useFetcher();
  const optimisticBid = fetcher.formData?.get("amount");
  const displayPrice = optimisticBid || currentPrice;

  return (
    <fetcher.Form method="post" action={`/products/${productId}/bid`}>
      <p>Giá: {displayPrice} VNĐ</p>
      <input name="amount" type="number" />
      <button type="submit">Đặt giá</button>
    </fetcher.Form>
  );
}
```

### Multi-Step Action

```typescript
export async function checkoutAction({ request }: ActionFunctionArgs) {
  const intent = (await request.formData()).get("intent");

  switch (intent) {
    case "update-address":
      return await updateAddress(formData);
    case "confirm":
      return await confirmOrder(formData);
  }
}
```

---

## Best Practices

### ✅ Loaders - NÊN

- Parallel load dữ liệu độc lập với `Promise.all()`
- Throw `Response` cho errors (404, 403, 500)
- Type-safe với TypeScript

### ❌ Loaders - KHÔNG NÊN

- Load dữ liệu không cần thiết
- Làm mutations (POST/PUT/DELETE)
- Load tuần tự khi có thể parallel

### ✅ Actions - NÊN

- Validate input với Zod trước khi xử lý
- Return structured errors
- Redirect sau khi thành công
- Log errors

### ❌ Actions - KHÔNG NÊN

- Skip validation
- Return sensitive data
- Ignore errors

---

## Troubleshooting

| Vấn đề                         | Giải pháp                                                          |
| ------------------------------ | ------------------------------------------------------------------ |
| Loader không rerun sau Action  | Đảm bảo action `return` value                                      |
| Type inference không hoạt động | Dùng `export async function`, không dùng `const`                   |
| Form không submit              | Kiểm tra: `<Form>` từ react-router, `method="post"`, action config |

---

## Tài Liệu Tham Khảo

- [React Router v7 Docs](https://reactrouter.com/)
- [Loader API](https://reactrouter.com/en/main/route/loader)
- [Action API](https://reactrouter.com/en/main/route/action)
