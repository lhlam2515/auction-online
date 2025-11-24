# Config Directory

Thư mục này chứa các file cấu hình cho ứng dụng backend.

## 📁 Cấu trúc

```text
config/
├── database.ts    # Cấu hình database connection
├── logger.ts      # Cấu hình Winston logger
└── README.md      # File này
```

## 🎯 Mục đích

Chứa tất cả các cấu hình của ứng dụng như:

- Database connection
- Logger configuration
- Environment variables
- Application settings

## 📝 Convention

### File naming

- Sử dụng **kebab-case** hoặc **camelCase** cho tên file
- Tên file phải mô tả rõ ràng chức năng: `database.ts`, `logger.ts`
- Có thể nhóm theo module: `auth.config.ts`, `mail.config.ts`

### Code structure

```typescript
// ✅ Recommended structure
// 1. Import dependencies
import { ... } from '...';

// 2. Define configuration object/class
export const configName = {
  // configuration properties
};

// hoặc sử dụng class
export class ConfigClass {
  // configuration methods and properties
}

// 3. Export default nếu cần
export default configName;
```

### Environment variables

- Sử dụng `process.env` để đọc environment variables
- Luôn có giá trị default hợp lý
- Validate environment variables khi khởi tạo

```typescript
// ✅ Good example
export const databaseConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  name: process.env.DB_NAME || "auction_db",
  // ...validate required fields
};
```

## 🚀 Cách sử dụng

### Import configuration

```typescript
// Từ các file khác trong dự án
import logger from "@/config/logger";
import { databaseConfig } from "@/config/database";

// Sử dụng
logger.info("Application started");
```

### Thêm config mới

1. Tạo file config mới trong thư mục này
2. Export configuration object/class
3. Import và sử dụng ở nơi cần thiết
4. Update file `README.md` này nếu cần

## 🔧 Best Practices

- **Centralized**: Tập trung tất cả config ở đây
- **Type-safe**: Sử dụng TypeScript interfaces cho config
- **Environment-aware**: Hỗ trợ nhiều môi trường (dev, prod, test)
- **Validation**: Validate config khi application start
- **Documentation**: Comment rõ ràng cho từng config option

## 📋 Checklist khi thêm config mới

- [ ] File name follow convention
- [ ] Type definitions for configuration
- [ ] Environment variable validation
- [ ] Default values for all optional fields
- [ ] JSDoc comments cho public APIs
- [ ] Update README if necessary
