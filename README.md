# ykb_copyer
医考帮爬虫，基于autojsX获取app试题数据的自动化脚本

## 项目结构
```
ykb_copyer/
├── crawler/                  # 爬虫脚本 (Auto.js X + Frida)
│   ├── ykb.js                # Auto.js X 主爬虫脚本
│   └── frida/                # Frida 逆向辅助脚本
│       ├── webhook.js        # HTTP/OkHttp hook
│       └── tracer.py         # Frida Python 注入脚本
├── processor/                # 后端数据处理脚本
│   ├── changemode.py         # 替换 mode 字段值
│   ├── cleanjson.py          # 清理格式错误的 JSON
│   ├── dedupe.py             # 题目去重
│   ├── guess_undefine.py     # 推测未定义题目类型
│   ├── remove.py             # 移动含指定字符串的 MD 文件
│   ├── rm_empty.py           # 删除空 JSON 文件
│   ├── rm_undefined.py       # 移动无 mode 字段的文件
│   └── tomd.py              # JSON 转 Markdown
├── tests_json_vault/          # 试题数据仓库
└── undefined/                # 未分类试题
```

## 试题仓库
- 路径：`./tests_json_vault`
- 涵盖内容
    - 临床期末全科目
    - 考研真题（章节科目分类）

## 题目抓取
### 环境配置
1. 模拟器：MuMu模拟器
2. 屏幕大小：1440* 2500 380DPI
3. 脚本环境：AutojsX
4. Vscode插件：Auto.js-Autox.js-VSCodeExt

### 说明
- 入口：`crawler/ykb.js`
- 需进入具体试题界面启动脚本

## 后处理
1. `processor/rm_empty.py` — 删除空 JSON 文件
2. `processor/rm_undefined.py` — 分离缺少 mode 字段的文件
3. `processor/dedupe.py` — 按 test 字段去重
4. `processor/cleanjson.py` — 修复 undefined 中的畸形 JSON
5. `processor/guess_undefine.py` — 为 undefined 文件猜测 mode
6. `processor/changemode.py` — 标准化 mode 字段值
7. `processor/tomd.py` — JSON 转 Markdown (Obsidian 格式)
