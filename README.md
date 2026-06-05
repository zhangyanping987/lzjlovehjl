# 贺峻霖 · 3D 立体相册

在 3D 空间中用图片组成球体，支持旋转、缩放、点击查看。适配桌面与手机，可部署到 GitHub Pages。

## 本地开发

```bash
npm install
npm run dev
```

## 获取 / 刷新图片链接

图片外链会失效，需在本地重新搜图后 push 到 GitHub。**详细步骤见：[docs/刷新图片.md](./docs/刷新图片.md)**

```bash
# 自动搜图，默认 150 张
npm run fetch-photos -- --count 150

# 更新后推送
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
