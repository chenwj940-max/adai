# 🐕 阿呆健身 - Android APK

这是一个使用 WebView 包装的简单 Android 应用。

## 构建方式

### 方案一：使用在线构建服务（推荐）

1. 把 `android-app` 文件夹打包成 zip
2. 上传到 https://appcenter.ms/ 或 https://build.phonegap.com/
3. 在线构建 APK

### 方案二：本地构建（需要 Android Studio）

```bash
# 安装 JDK 17+
# 安装 Android Studio
# 打开 android-app 项目
# 点击 Build -> Build Bundle(s) / APK(s) -> Build APK(s)
```

### 方案三：使用 GitHub Actions（需要 GitHub 账号）

1. 把代码推到 GitHub
2. 在 `.github/workflows/build.yml` 配置构建
3. 自动构建 APK
