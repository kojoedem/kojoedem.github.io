document.addEventListener("DOMContentLoaded", () => {
    // Setup common elements like menu and footer year
    setupMenu();
    setYear();
    setupScrollAnimations();

    async function loadData() {
        try {
            const response = await fetch("data.json");
            if (!response.ok) throw new Error("Failed to load data.json");

            const data = await response.json();

            // Render content based on the current page
            if (document.getElementById("about")) {
                renderAbout(data);
            }
            if (document.getElementById("projects-list")) {
                renderProjects(data);
            }
            if (document.getElementById("progress-list")) {
                renderBlog(data);
            }
            if (document.getElementById("latest-posts-list")) {
                renderLatestPosts(data);
            }

            // Contact is in the footer, so it should be on all pages
            renderContact(data);

        } catch (error) {
            console.error("Error loading data:", error);
            alert("Failed to load portfolio data. Please ensure the data.json file is available.");
        }
    }

    loadData();
});
