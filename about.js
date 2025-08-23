document.addEventListener("DOMContentLoaded", () => {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = currentYear;
    }

    async function loadAboutContent() {
        const aboutContent = document.getElementById("about-content");
        if (!aboutContent) return;

        try {
            const response = await fetch("about/about.md");
            if (!response.ok) throw new Error("Failed to load about.md");

            const markdown = await response.text();
            aboutContent.innerHTML = marked.parse(markdown);
        } catch (error) {
            console.error("Error loading about content:", error);
            aboutContent.textContent = "Error loading content.";
        }
    }

    loadAboutContent();
});
