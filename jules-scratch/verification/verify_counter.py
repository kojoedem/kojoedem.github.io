import os
from playwright.sync_api import sync_playwright, expect

def verify_visitor_counter():
    """
    This script navigates to the index.html page and takes a screenshot
    of the header to verify the visitor counter's appearance.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Get the absolute path to the index.html file
        base_dir = os.getcwd()
        file_path = os.path.join(base_dir, 'index.html')
        url = f'file://{file_path}'

        page.goto(url)

        # Wait for the header element to be visible
        header = page.locator('header')
        expect(header).to_be_visible()

        # Take a screenshot of the header
        screenshot_path = os.path.join(base_dir, 'jules-scratch/verification/verification.png')
        header.screenshot(path=screenshot_path)

        browser.close()

if __name__ == "__main__":
    verify_visitor_counter()
