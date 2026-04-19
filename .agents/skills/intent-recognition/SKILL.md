---
name: "intent-recognition"
description: "Analyzes natural language commands in SOLO Coder mode to identify core programming intents. Invoke when user sends natural language instructions via chat that need intent classification and extraction."
---

# Intent Recognition 意图识别技能

## 功能概述

该技能模块用于在 SOLO Coder 模式下，通过聊天界面接收用户的自然语言指令时，自动分析并识别指令中包含的核心意图。模块能够处理各类编程相关的自然语言指令，并输出结构化的意图识别结果。

## 触发条件

- 用户在 SOLO Coder 模式下通过聊天界面输入自然语言指令
- 需要分析用户指令的核心意图（如创建文件、修改代码、运行测试等）
- 需要将自然语言转换为结构化的意图对象供后续处理
- 需要理解多意图复合指令并拆分处理

## 意图分类体系

### 主要意图类别

| 类别 | 标识符 | 说明 | 示例 |
|------|--------|------|------|
| 文件操作 | `file_operation` | 创建、读取、修改、删除文件 | "创建一个用户模型文件" |
| 代码修改 | `code_modification` | 修改现有代码逻辑 | "把登录验证改成JWT方式" |
| 功能开发 | `feature_development` | 开发新功能模块 | "添加一个支付接口" |
| 测试相关 | `testing` | 编写或运行测试用例 | "运行单元测试" |
| 调试排查 | `debugging` | 排查和修复bug | "帮我看看这个报错是怎么回事" |
| 重构优化 | `refactoring` | 重构或优化代码 | "优化这个函数的性能" |
| 查询检索 | `query_search` | 查找代码或信息 | "搜索所有使用axios的地方" |
| 部署运维 | `deployment` | 构建、部署、运维操作 | "打包发布到生产环境" |
| 配置管理 | `configuration` | 修改配置或环境变量 | "修改数据库连接配置" |
| 文档编写 | `documentation` | 编写或更新文档 | "给这个函数写注释" |

### 意图子类别

每个主类别下可进一步细分，例如：

```
file_operation
├── create_file (创建文件)
├── read_file (读取文件)
├── update_file (修改文件)
├── delete_file (删除文件)
├── rename_file (重命名文件)
└── move_file (移动文件)

code_modification
├── add_function (添加函数)
├── modify_function (修改函数)
├── remove_function (删除函数)
├── change_logic (修改逻辑)
└── update_dependency (更新依赖)
```

## 识别流程

```
┌─────────────────────────────────────────────────────────┐
│  1. 输入预处理                                           │
│     - 清理空白字符和特殊符号                              │
│     - 语言检测和转换（支持中英文）                        │
│     - 分词和词性标注                                      │
└───────────────────────┬─────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│  2. 特征提取                                             │
│     - 提取关键词（动词、名词、技术术语）                   │
│     - 识别实体（文件名、函数名、类名等）                   │
│     - 提取上下文参数                                      │
└───────────────────────┬─────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│  3. 意图分类                                             │
│     - 规则匹配（高优先级）                                │
│     - 关键词匹配（中优先级）                              │
│     - 语义相似度匹配（低优先级）                          │
│     - 置信度计算                                          │
└───────────────────────┬─────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│  4. 参数提取                                             │
│     - 提取目标文件/模块                                   │
│     - 提取操作参数                                        │
│     - 提取约束条件                                        │
└───────────────────────┬─────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│  5. 结果输出                                             │
│     - 生成结构化意图对象                                  │
│     - 包含置信度和备选意图                                │
│     - 支持多意图识别                                      │
└─────────────────────────────────────────────────────────┘
```

## 使用示例

### 示例 1：简单意图识别

```
用户输入: "创建一个用户登录接口"

输出结果:
{
  "intents": [
    {
      "category": "feature_development",
      "subCategory": "create_api",
      "confidence": 0.95,
      "action": "create",
      "target": "用户登录接口",
      "parameters": {
        "type": "api",
        "module": "authentication",
        "function": "login"
      }
    }
  ]
}
```

### 示例 2：复合意图识别

```
用户输入: "修改用户模型的字段，然后运行测试"

输出结果:
{
  "intents": [
    {
      "category": "code_modification",
      "subCategory": "modify_model",
      "confidence": 0.92,
      "action": "modify",
      "target": "用户模型",
      "parameters": {
        "type": "model",
        "entity": "user"
      },
      "order": 1
    },
    {
      "category": "testing",
      "subCategory": "run_test",
      "confidence": 0.98,
      "action": "run",
      "target": "测试",
      "parameters": {
        "type": "test"
      },
      "order": 2
    }
  ],
  "isCompound": true
}
```

### 示例 3：模糊意图识别

```
用户输入: "这个报错了，帮我看看"

输出结果:
{
  "intents": [
    {
      "category": "debugging",
      "subCategory": "error_analysis",
      "confidence": 0.78,
      "action": "analyze",
      "target": "错误信息",
      "parameters": {
        "type": "error",
        "needContext": true
      }
    }
  ],
  "needsClarification": true
}
```

## 输出格式

### 意图对象结构

```typescript
interface Intent {
  category: IntentCategory;          // 主类别
  subCategory?: string;              // 子类别
  confidence: number;                // 置信度 0-1
  action: string;                    // 核心动作
  target: string;                    // 操作目标
  parameters?: Record<string, any>;  // 参数
  entities?: Entity[];               // 识别的实体
  constraints?: Constraint[];        // 约束条件
  order?: number;                    // 执行顺序（多意图时）
}

interface IntentRecognitionResult {
  intents: Intent[];                 // 识别的意图列表
  originalInput: string;             // 原始输入
  processedInput: string;            // 预处理后的输入
  isCompound: boolean;               // 是否复合意图
  needsClarification: boolean;       // 是否需要澄清
  alternatives?: Intent[];           // 备选意图
  metadata?: Record<string, any>;    // 元数据
}
```

## 训练数据管理

### 数据格式

训练数据使用 JSON 格式存储，每条数据包含：

```json
{
  "text": "用户输入文本",
  "category": "意图类别",
  "subCategory": "子类别",
  "action": "动作",
  "target": "目标",
  "parameters": {},
  "language": "zh/en"
}
```

### 数据扩充策略

1. **同义词替换**：使用同义词生成更多样本
2. **句式变换**：改变句式结构增加多样性
3. **参数泛化**：替换具体参数为占位符
4. **交叉语言**：中英文混合样本

## 配置选项

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `minConfidence` | 0.6 | 最低置信度阈值 |
| `maxIntents` | 5 | 单次识别最大意图数量 |
| `enableMultiIntent` | true | 是否启用多意图识别 |
| `language` | 'auto' | 语言模式 (auto/zh/en) |
| `useRuleFirst` | true | 是否优先使用规则匹配 |

## 性能指标

- 单次识别时间：< 50ms
- 准确率：> 90%（基于训练集）
- 支持语言：中文、英文
- 最大输入长度：2000 字符
