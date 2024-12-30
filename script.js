document.addEventListener("DOMContentLoaded", () => {
    console.log("Portfolio loaded successfully!");

    const CARDS_PER_PAGE = 6; // Maximum cards per page

    async function loadData() {
        try {
            const response = await fetch("data.json");
            if (!response.ok) throw new Error("Failed to load data.json");

            const data = await response.json();

            // Get About Me section
            const aboutSection = document.querySelector("#about p");
            if (data.about && data.about.text) {
                aboutSection.textContent = data.about.text;
            } else {
                aboutSection.textContent = "No About Me section found.";
            }

            // Render Progress Section with Pagination
            renderSectionWithPagination(data.progress || [], "progress-list");

            // Render Projects Section with Pagination
            renderSectionWithPagination(data.projects || [], "projects-list");
        } catch (error) {
            console.error("Error loading data:", error);
            alert("Failed to load portfolio data. Please ensure the data.json file is available.");
        }
    }

    function renderSectionWithPagination(items, containerId) {
        const container = document.getElementById(containerId);
        const parentContainer = container.parentElement;
        let currentPage = 1; // Start from the first page
        const totalCards = items.length;
        const totalPages = Math.ceil(totalCards / CARDS_PER_PAGE);

        if (totalCards <= CARDS_PER_PAGE) {
            // If there are 6 or fewer cards, render all cards without pagination
            renderPage(items);
        } else {
            // If there are more than 6 cards, apply pagination
            renderPage(items.slice(0, CARDS_PER_PAGE)); // Render the first page initially
            renderPaginationControls(totalPages, items);
        }

        function renderPage(pageItems) {
            container.innerHTML = ""; // Clear the container

            pageItems.forEach((item) => {
                const card = document.createElement("div");
                card.classList.add("card");

                const cardFrontStyle = item.image
                    ? `background-image: url(${item.image}); background-size: cover; background-position: center;`
                    : 'background-color: #3498db;';

                card.innerHTML = `
                    <div class="card-front" style="${cardFrontStyle}">
                        <h3>${item.day ? 'Day ' + item.day : item.name || 'Item'}</h3>
                    </div>
                    <div class="card-content">
                        <p>${item.update || item.description}</p>
                        <a href="${item.readMoreLink || item.link}" target="_blank" class="read-more">Read More</a>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function renderPaginationControls(totalPages, items) {
            let paginationContainer = parentContainer.querySelector(".pagination");
            if (!paginationContainer) {
                paginationContainer = document.createElement("div");
                paginationContainer.classList.add("pagination");
                parentContainer.appendChild(paginationContainer);
            } else {
                paginationContainer.innerHTML = ""; // Clear previous pagination controls
            }

            const prevButton = document.createElement("button");
            prevButton.textContent = "Previous";
            prevButton.disabled = currentPage === 1;
            prevButton.addEventListener("click", () => {
                if (currentPage > 1) {
                    currentPage--;
                    updatePage();
                }
            });
            paginationContainer.appendChild(prevButton);

            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement("button");
                button.textContent = i;
                button.classList.add("page-button");
                if (i === currentPage) button.classList.add("active");

                button.addEventListener("click", () => {
                    currentPage = i;
                    updatePage();
                });

                paginationContainer.appendChild(button);
            }

            const nextButton = document.createElement("button");
            nextButton.textContent = "Next";
            nextButton.disabled = currentPage === totalPages;
            nextButton.addEventListener("click", () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    updatePage();
                }
            });
            paginationContainer.appendChild(nextButton);

            function updatePage() {
                const start = (currentPage - 1) * CARDS_PER_PAGE;
                const end = start + CARDS_PER_PAGE;
                renderPage(items.slice(start, end));
                updatePaginationControls();
            }

            function updatePaginationControls() {
                const buttons = paginationContainer.querySelectorAll(".page-button");
                buttons.forEach((button, index) => {
                    if (index === currentPage - 1) {
                        button.classList.add("active");
                    } else {
                        button.classList.remove("active");
                    }
                });

                prevButton.disabled = currentPage === 1;
                nextButton.disabled = currentPage === totalPages;
            }
        }
    }

    loadData();
});
