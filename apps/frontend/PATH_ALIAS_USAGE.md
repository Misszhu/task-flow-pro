# 路径别名使用说明

## 配置

路径别名已在 `tsconfig.json` 中配置：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "src/*": ["src/*"]
    }
  }
}
```

## 使用方法

现在你可以使用以下方式导入 `src` 目录下的文件：

### 之前的方式（相对路径）

```typescript
import { AuthState, User } from "../../types/auth";
import { authReducer } from "../slices/authSlice";
```

### 现在的方式（路径别名）

```typescript
import { AuthState, User } from "src/types/auth";
import { authReducer } from "src/store/slices/authSlice";
```

## 优势

1. **更清晰的导入路径**：不需要计算相对路径层级
2. **更容易重构**：移动文件时不需要更新导入路径
3. **更好的可读性**：路径更直观，容易理解文件位置
4. **减少错误**：避免相对路径计算错误

## 示例

```typescript
// 导入类型
import { AuthState, User } from "src/types/auth";

// 导入组件
import { Button } from "src/components/common/Button";

// 导入服务
import { apiService } from "src/services/api";

// 导入工具函数
import { formatDate } from "src/utils/date";

// 导入 hooks
import { useAuth } from "src/hooks/useAuth";

// 导入 store
import { authReducer } from "src/store/slices/authSlice";
```
