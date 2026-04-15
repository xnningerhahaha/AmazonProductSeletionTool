# 如何获取亚马逊产品 ASIN

## 什么是 ASIN？

ASIN（Amazon Standard Identification Number）是亚马逊产品的唯一标识符：
- 10 位字符（字母和数字）
- 每个产品都有唯一的 ASIN
- 例如：`B08N5WRWNW`

## 获取方法

### 方法 1：从 URL 获取（推荐）

打开任意亚马逊产品页面，查看浏览器地址栏：

```
https://www.amazon.com/dp/B08N5WRWNW/ref=...
                        ^^^^^^^^^^
                        这就是 ASIN
```

**常见 URL 格式：**
- `https://www.amazon.com/dp/B08N5WRWNW`
- `https://www.amazon.com/product-name/dp/B08N5WRWNW`
- `https://www.amazon.com/gp/product/B08N5WRWNW`

### 方法 2：从产品详情获取

1. 打开产品页面
2. 向下滚动到 "Product Information" 部分
3. 找到 **ASIN** 字段

### 方法 3：右键复制链接

1. 在搜索结果或产品列表中
2. 右键点击产品图片或标题
3. 选择 "复制链接地址"
4. 从链接中提取 `/dp/` 后面的 10 位字符

## 测试用 ASIN 示例

### 电子产品
- Apple AirPods Pro (2nd Gen): `B0CHWRXH8B`
- Kindle Paperwhite: `B08KTZ8249`
- Echo Dot (5th Gen): `B09B8V1LZ3`
- Fire TV Stick 4K: `B08C1W5N87`
- Bose QuietComfort Headphones: `B0CCZ26B5V`

### 家居用品
- Instant Pot Duo: `B06Y1YD5W7`
- Ring Video Doorbell: `B08N5NQ869`
- Philips Hue Bulbs: `B07QV9XB87`

### 配件
- Anker Power Bank: `B07QXV6N1B`
- USB-C Cable: `B08R68T84N`
- Phone Case: `B09JQKJXVZ`

## 快速测试

1. 访问 http://localhost:3000
2. 输入上面任意一个 ASIN
3. 点击"分析"按钮
4. 查看分析结果

## 注意事项

- ASIN 区分大小写（通常是大写）
- 必须是 10 位字符
- 不同国家站点的同一产品可能有不同的 ASIN
- 书籍的 ASIN 通常就是 ISBN-10

## 不同国家站点

- 美国：amazon.com
- 英国：amazon.co.uk
- 日本：amazon.co.jp
- 德国：amazon.de
- 中国：amazon.cn

每个站点的产品有独立的 ASIN。

## 验证 ASIN

有效的 ASIN 格式：
- ✅ `B08N5WRWNW` - 正确
- ✅ `B0CHWRXH8B` - 正确
- ❌ `B08N5WRW` - 太短
- ❌ `B08N5WRWNW123` - 太长
- ❌ `12345ABCDE` - 格式错误（通常以 B 开头）

## 常见问题

**Q: 为什么有些产品没有 ASIN？**
A: 所有亚马逊产品都有 ASIN，如果找不到，可能是：
- 产品已下架
- 查看的是第三方卖家页面
- 需要在产品详情页面查找

**Q: ASIN 和 UPC/EAN 有什么区别？**
A: 
- ASIN 是亚马逊内部使用的唯一标识符
- UPC/EAN 是全球通用的产品条形码
- 一个产品可以有多个 UPC，但只有一个 ASIN

**Q: 可以通过产品名称搜索 ASIN 吗？**
A: 目前系统需要输入 ASIN，未来可以添加产品名称搜索功能。

## 实用技巧

### 批量获取 ASIN

如果需要分析多个产品：
1. 在亚马逊搜索相关产品
2. 逐个打开产品页面
3. 从 URL 复制 ASIN
4. 在系统中逐个分析

### 使用浏览器扩展

可以安装浏览器扩展来快速提取 ASIN：
- ASIN Grabber
- Amazon ASIN Finder
- 或使用书签工具

### 快捷键技巧

在产品页面：
1. 按 `Ctrl+L` (Windows) 或 `Cmd+L` (Mac) 选中 URL
2. 按 `Ctrl+C` 复制
3. 提取 `/dp/` 后面的 10 位字符

## 开始使用

现在你已经知道如何获取 ASIN 了！

访问 **http://localhost:3000** 开始分析产品吧！
