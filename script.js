document.addEventListener("DOMContentLoaded", () => {
    const currentYear = new Date().getFullYear();
    document.getElementById("current-year").textContent = currentYear;

    const CARDS_PER_PAGE = 6;

    // Menu toggle
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", navLinks.classList.contains("open"));
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            if (navLinks.classList.contains("open")) {
                navLinks.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", false);
            }
        });
    });

    function loadLatestPosts(posts) {
        const latestPostsList = document.getElementById("latest-posts-list");
        if (!latestPostsList || !posts || posts.length === 0) return;

        const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentPosts = sortedPosts.slice(0, 3);

        const ul = document.createElement('ul');
        recentPosts.forEach(post => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `blog.html#${post.title.replace(/\s+/g, '-').toLowerCase()}`;
            a.textContent = post.title;
            li.appendChild(a);
            ul.appendChild(li);
        });

        latestPostsList.appendChild(ul);
    }

    async function loadData() {
        try {
            const response = await fetch("data.json");
            if (!response.ok) throw new Error("Failed to load data.json");

            const data = await response.json();

            renderSectionWithMarkdown(data.projects || [], "projects-list");
            loadLatestPosts(data.blog || []);

            const contactList = document.querySelector("#contact .contact-list");
            if (data.contact?.length) {
                contactList.innerHTML = "";
                data.contact.forEach(item => {
                    const link = document.createElement("a");
                    link.href = item.link;
                    link.target = "_blank";
                    link.title = item.name;
                    if(item.image) {
                        const img = document.createElement("img");
                        img.src = item.image;
                        img.alt = `${item.name} icon`;
                        link.appendChild(img);
                    }
                    contactList.appendChild(link);
                });
            } else {
                contactList.textContent = "No contact options available.";
            }

        } catch (error) {
            console.error("Error loading data:", error);
            alert("Failed to load portfolio data. Please ensure the data.json file is available.");
        }
    }

    function renderSectionWithMarkdown(items, containerId) {
        const sectionContainer = document.getElementById(containerId).parentElement;
        const container = document.getElementById(containerId);
        if (!container) return;

        let allItems = [...items];
        let filteredItems = [...allItems];
        let currentPage = 1;

        function getUniqueTags() {
            const allTags = allItems.flatMap(item => item.tags || []);
            return [...new Set(allTags)];
        }

        function renderFilterButtons() {
            const uniqueTags = getUniqueTags();
            const filterContainer = document.createElement('div');
            filterContainer.classList.add('filter-container');

            const allButton = document.createElement('button');
            allButton.textContent = 'All';
            allButton.classList.add('active');
            allButton.addEventListener('click', () => {
                filteredItems = [...allItems];
                currentPage = 1;
                updatePage();
                setActiveButton(allButton);
            });
            filterContainer.appendChild(allButton);

            uniqueTags.forEach(tag => {
                const button = document.createElement('button');
                button.textContent = tag;
                button.addEventListener('click', () => {
                    filteredItems = allItems.filter(item => item.tags?.includes(tag));
                    currentPage = 1;
                    updatePage();
                    setActiveButton(button);
                });
                filterContainer.appendChild(button);
            });

            sectionContainer.insertBefore(filterContainer, container);
        }

        function setActiveButton(activeButton) {
            const buttons = sectionContainer.querySelectorAll('.filter-container button');
            buttons.forEach(button => button.classList.remove('active'));
            activeButton.classList.add('active');
        }

        async function renderPage() {
            container.innerHTML = "";
            const totalPages = Math.ceil(filteredItems.length / CARDS_PER_PAGE);
            const start = (currentPage - 1) * CARDS_PER_PAGE;
            const pageItems = filteredItems.slice(start, start + CARDS_PER_PAGE);

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
                            description = marked.parse(markdown);
                        } else {
                            throw new Error(`Failed to load ${item.file}`);
                        }
                    } catch (error) {
                        console.error("Error loading markdown file:", error);
                        description = "Error loading content.";
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

                let readMoreLink = item.readMoreLink || "#";
                let target = "_blank";
                if (containerId === 'projects-list') {
                    readMoreLink = `project.html?name=${encodeURIComponent(item.name)}`;
                }

                card.innerHTML = `
                    <div class="card-front" style="${backgroundStyle}"><h3>${item.title || item.name}</h3></div>
                    <div class="card-content">
                        <div>${description}</div>
                        ${technologiesHTML}
                        ${tagsHTML}
                        <a href="${readMoreLink}" class="read-more" target="${target}">Read More</a>
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

        renderFilterButtons();
        updatePage();
    }

    loadData();
});
