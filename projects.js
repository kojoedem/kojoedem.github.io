document.addEventListener("DOMContentLoaded", () => {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = currentYear;
    }

    async function loadProjects() {
        try {
            const response = await fetch("data.json");
            if (!response.ok) throw new Error("Failed to load data.json");

            const data = await response.json();
            renderSectionWithMarkdown(data.projects || [], "projects-list-all", 8);
        } catch (error) {
            console.error("Error loading projects:", error);
            const container = document.getElementById("projects-list-all");
            if(container) {
                container.textContent = "Could not load projects.";
            }
        }
    }

    function renderSectionWithMarkdown(items, containerId, cardsPerPage) {
        const sectionContainer = document.getElementById(containerId)?.parentElement;
        const container = document.getElementById(containerId);
        if (!container || !sectionContainer) return;

        let allItems = [...items];
        let filteredItems = [...allItems];
        let currentPage = 1;

        async function renderPage() {
            container.innerHTML = "";
            const totalPages = Math.ceil(filteredItems.length / cardsPerPage);
            const start = (currentPage - 1) * cardsPerPage;
            const pageItems = filteredItems.slice(start, start + cardsPerPage);

            for (const item of pageItems) {
                const card = document.createElement("div");
                card.classList.add("card");

                const backgroundStyle = item.image ? `background-image: url(${item.image});` : "background-color: #3498db;";

                let description = "No description available.";
                if (item.file) {
                    try {
                        const mdResponse = await fetch(item.file);
                        if (mdResponse.ok) {
                            const markdown = await mdResponse.text();
                            // Create a snippet instead of full parsed markdown
                            const snippet = markdown.replace(/#.*$/m, '').trim().substring(0, 150) + '...';
                            description = `<p>${snippet}</p>`; // Wrap snippet in a p tag for consistent styling
                        } else {
                            throw new Error(`Failed to load ${item.file}`);
                        }
                    } catch (error) {
                        console.error("Error loading markdown file:", error);
                        description = "<p>Error loading content.</p>";
                    }
                }

                let technologiesHTML = '';
                if (item.technologies && item.technologies.length > 0) {
                    technologiesHTML = `<div class="technologies"><h4>Technologies</h4><ul class="technologies-list">${item.technologies.map(tech => `<li>${tech}</li>`).join('')}</ul></div>`;
                }

                let tagsHTML = '';
                if (item.tags && item.tags.length > 0) {
                    tagsHTML = `<div class="tags"><h4>Tags</h4><ul class="tags-list">${item.tags.map(tag => `<li>${tag}</li>`).join('')}</ul></div>`;
                }

                const readMoreLink = `project.html?name=${encodeURIComponent(item.name)}`;

                card.innerHTML = `
                    <div class="card-front" style="${backgroundStyle}"><h3>${item.title || item.name}</h3></div>
                    <div class="card-content">
                        <div>${description}</div>
                        <a href="${readMoreLink}" class="read-more" target="_blank">Read More</a>
                    </div>`;

                container.appendChild(card);
                card.addEventListener("click", (e) => {
                    if (e.target.tagName !== 'A') {
                        card.classList.toggle("open");
                    }
                });
            }
            renderPagination(totalPages);
        }

        function renderPagination(totalPages) {
            const paginationContainer = sectionContainer.querySelector(".pagination");
            if (!paginationContainer) return;
            paginationContainer.innerHTML = "";

            if (totalPages <= 1) return;

            const prevButton = document.createElement("button");
            prevButton.textContent = "Previous";
            prevButton.disabled = currentPage === 1;
            prevButton.addEventListener("click", () => {
                currentPage--;
                updatePage();
            });
            paginationContainer.appendChild(prevButton);

            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement("button");
                pageButton.textContent = i;
                if (i === currentPage) pageButton.classList.add("active");
                pageButton.addEventListener("click", () => {
                    currentPage = i;
                    updatePage();
                });
                paginationContainer.appendChild(pageButton);
            }

            const nextButton = document.createElement("button");
            nextButton.textContent = "Next";
            nextButton.disabled = currentPage === totalPages;
            nextButton.addEventListener("click", () => {
                currentPage++;
                updatePage();
            });
            paginationContainer.appendChild(nextButton);
        }

        function updatePage() {
            renderPage();
        }

        updatePage();
    }

    loadProjects();
});
