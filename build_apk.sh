#!/bin/bash
# 简单的 APK 构建脚本 - 使用 WebView 包装

echo "🐕 阿呆健身 - APK 构建脚本"
echo ""

# 检查是否有 Android SDK
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ 未找到 ANDROID_HOME 环境变量"
    echo ""
    echo "💡 本地构建 APK 需要配置 Android SDK，比较复杂"
    echo ""
    echo "✅ 推荐方案："
    echo "1. 使用 Expo Go 在手机上预览（最简单）"
    echo "   - 在手机上安装 Expo Go"
    echo "   - 运行: npx expo start"
    echo "   - 扫描二维码即可在手机上打开"
    echo ""
    echo "2. 使用 EAS Build 在线构建"
    echo "   - 注册 Expo 账号"
    echo "   - 安装 EAS CLI: npm install -g eas-cli"
    echo "   - 运行: eas build --platform android --profile preview"
    echo ""
    echo "3. 使用 preview.html 在手机浏览器打开"
    echo "   - 把 preview.html 传到手机"
    echo "   - 用浏览器打开就能看到完整界面"
    exit 1
fi

echo "✅ 找到 Android SDK"
echo ""
echo "💡 本地构建流程较长，建议使用 Expo Go 或在线构建"
