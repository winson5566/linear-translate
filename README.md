# Linear 中文翻译

Firefox 插件：在 [Linear](https://linear.app) 的 ticket 页面标题旁加一个"译"按钮，点击后用 DeepSeek 把标题、正文和评论翻译成中文，在弹窗中显示，保留原有格式。

## 安装

- 临时安装：打开 `about:debugging#/runtime/this-firefox`，点"临时载入附加组件…"，选 `manifest.json`。
- 永久安装：在 [addons.mozilla.org/developers](https://addons.mozilla.org/developers/) 以"On your own"方式提交签名，下载签名后的 `.xpi` 安装。

打包：

```bash
zip -r linear-translate.xpi manifest.json background.js content.js panel.css options.html options.js icon.svg
```

## 设置

在 `about:addons` 打开插件选项，填入 DeepSeek API key，模型默认 `deepseek-chat`。API key 只保存在本机浏览器里。
