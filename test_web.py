"""Test web page rendering of worksheet exercises."""
from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Login first
    page.goto('http://localhost:5173/login')
    page.wait_for_load_state('networkidle')
    page.fill('input[type="email"]', 'teacher@example.com')
    page.fill('input[type="password"]', 'password123')
    page.click('button[type="submit"]')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    
    # Navigate to worksheet editor page (ws_id=17)
    page.goto('http://localhost:5173/worksheets/17')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)
    
    # Screenshot
    page.screenshot(path='d:/project smartMathAI/test_screenshot.png', full_page=True)
    print("Screenshot saved")
    
    # Check for exercises in the DOM
    exercises = page.locator('.question-item').all()
    print(f"Found {len(exercises)} exercise items in DOM")
    
    for i, ex in enumerate(exercises):
        text = ex.inner_text()
        visible = ex.is_visible()
        box = ex.bounding_box()
        print(f"  Exercise {i+1}: visible={visible}, text=[{text[:80]}], box={box}")
    
    # Check MathFormattedText elements
    math_texts = page.locator('p.break-words').all()
    print(f"\nFound {len(math_texts)} MathFormattedText <p> elements")
    for i, mt in enumerate(math_texts):
        text = mt.inner_text()
        visible = mt.is_visible()
        print(f"  MathText {i+1}: visible={visible}, text=[{text[:80]}]")
    
    # Console logs
    console_msgs = []
    page.on('console', lambda msg: console_msgs.append(f"{msg.type}: {msg.text}"))
    page.reload()
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(3000)
    
    errors = [m for m in console_msgs if 'error' in m.lower()]
    if errors:
        print(f"\nConsole errors: {errors[:5]}")
    
    browser.close()
