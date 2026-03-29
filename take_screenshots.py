#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成阿呆健身APP截图
"""

import os
import sys

# 检查是否有playwright
try:
    from playwright.sync_api import sync_playwright
    HAS_PLAYWRIGHT = True
except ImportError:
    HAS_PLAYWRIGHT = False

def generate_screenshots():
    """生成APP截图"""
    
    print("📸 开始生成阿呆健身APP截图...")
    
    preview_path = os.path.join(os.path.dirname(__file__), 'preview.html')
    file_url = 'file://' + preview_path
    
    # 使用Playwright
    if HAS_PLAYWRIGHT:
        print("🎭 使用Playwright生成截图...")
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
                page = browser.new_page(viewport={'width': 375, 'height': 812, 'isMobile': True})
                
                # 首页
                print("🏠 生成首页截图...")
                page.goto(file_url, wait_until='networkidle', timeout=30000)
                page.wait_for_timeout(1000)
                home_screenshot = '/tmp/adai-fitness-home.png'
                page.screenshot(path=home_screenshot)
                print(f"✅ 首页截图: {home_screenshot}")
                
                # 训练页
                print("🏋️ 生成训练页截图...")
                page.evaluate("() => showScreen('workout')")
                page.wait_for_timeout(500)
                workout_screenshot = '/tmp/adai-fitness-workout.png'
                page.screenshot(path=workout_screenshot)
                print(f"✅ 训练页截图: {workout_screenshot}")
                
                # 历史页
                print("📋 生成历史页截图...")
                page.evaluate("() => showScreen('history')")
                page.wait_for_timeout(500)
                history_screenshot = '/tmp/adai-fitness-history.png'
                page.screenshot(path=history_screenshot)
                print(f"✅ 历史页截图: {history_screenshot}")
                
                browser.close()
                
                print("\n🎉 所有截图完成！")
                return [home_screenshot, workout_screenshot, history_screenshot]
                
        except Exception as e:
            print(f"❌ Playwright截图失败: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n💡 提示: 你可以直接在浏览器中打开 preview.html 文件查看预览效果！")
    return []

if __name__ == '__main__':
    results = generate_screenshots()
    if results:
        print(f"\n✅ 截图文件: {results}")