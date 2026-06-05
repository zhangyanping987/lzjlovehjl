# 贺峻霖 · 3D 立体相册

在 3D 空间中用图片组成球体，支持旋转、缩放、点击查看。适配桌面与手机，可部署到 GitHub Pages。

## 本地开发

```bash
npm install
npm run dev
```

## 获取 / 刷新图片链接

使用**百度图片搜索**，关键词已针对「贺峻霖 神图 / 壁纸高清 / 头像」等优化：

```bash
# 自动搜图，默认 150 张
npm run fetch-photos -- --count 150

# 自定义数量或关键词
npm run fetch-photos -- --count 200
npm run fetch-photos -- --keywords "贺峻霖 神图,贺峻霖 壁纸高清" --count 100

# 从文件补充 URL（复制 urls.example.txt 为 urls.txt）
npm run fetch-photos -- --from-file urls.txt --count 150
```

更新后推送：

```bash
git add public/photos.json
git commit -m "refresh photo urls"
git push
```

## 部署 GitHub Pages

1. 仓库 Settings → Pages → Source 选 **GitHub Actions**
2. 推送 `main` 分支，Actions 自动构建发布
3. 访问 `https://<用户名>.github.io/lzjlovehjl/`

## 操作说明

- **拖拽** 旋转球体
- **滚轮 / 双指** 缩放
- **点击图片** 全屏查看，左右切换
