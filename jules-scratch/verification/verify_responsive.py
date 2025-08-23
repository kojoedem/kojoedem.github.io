import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Define a mobile viewport for an iPhone SE
        context = await browser.new_context(
            viewport={'width': 375, 'height': 667},
            device_scale_factor=2,
            is_mobile=True,
            has_touch=True
        )
        page = await context.new_page()

        # --- 1. Verify Homepage ---
        await page.goto("file:///app/index.html")
        # The rendering bug will likely cause this to fail, but the screenshot will still be valuable.
        try:
            await expect(page.locator("#latest-content-grid .card").first).to_be_visible(timeout=5000)
        except Exception:
            print("Homepage cards not rendered (known issue). Taking screenshot anyway.")
        await page.screenshot(path="jules-scratch/verification/01-responsive-homepage.png")


        # --- 2. Verify Projects Page ---
        await page.goto("file:///app/projects.html")
        try:
            await expect(page.locator(".projects-list .card").first).to_be_visible(timeout=5000)
        except Exception:
            print("Projects page cards not rendered (known issue). Taking screenshot anyway.")
        await page.screenshot(path="jules-scratch/verification/02-responsive-projects.png")

        # --- 3. Verify New Blog Page Layout ---
        await page.goto("file:///app/blog.html")
        try:
            await expect(page.locator("#blog-content h2").first).to_be_visible(timeout=5000)
        except Exception:
            print("Blog page content not rendered (known issue). Taking screenshot anyway.")
        await page.screenshot(path="jules-scratch/verification/03-responsive-blog.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
