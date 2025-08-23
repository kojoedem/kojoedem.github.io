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

    // Function to display a random slogan
    function getRandomLine(lines) {
        if (!lines || lines.length === 0) return;
        const sloganElement = document.querySelector('.slogan');
        if (sloganElement) {
            const randomIndex = Math.floor(Math.random() * lines.length);
            const randomLine = lines[randomIndex];

            sloganElement.classList.remove('typing');
            void sloganElement.offsetWidth; // Trigger reflow
            sloganElement.textContent = randomLine;
            sloganElement.classList.add('typing');
        }
    }

    function loadLatestPosts(posts) {
        const latestPostsList = document.getElementById("latest-posts-list");
        if (!latestPostsList || !posts || posts.length === 0) return;

        // Sort posts by date in descending order
        const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Get the 3 most recent posts
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

            // Populate About Me
            document.querySelector("#about p").textContent = data.about?.text || "No About Me section found.";

            // Populate sections
            renderSectionWithMarkdown(data.techChronicles || [], "tech-chronicles-list");
            renderSectionWithMarkdown(data.projects || [], "projects-list");
            loadLatestPosts(data.blog || []);

            // Populate Resume
            const resumeLink = document.querySelector("#resume a");
            if (data.resume) {
                resumeLink.href = data.resume;
            } else {
                resumeLink.textContent = "Resume not available.";
                resumeLink.href = "#";
            }

            // Populate Contact
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

            // Setup slogan rotator
            if (data.lines) {
                getRandomLine(data.lines);
                setInterval(() => getRandomLine(data.lines), 30000);
            }

        } catch (error) {
            console.error("Error loading data:", error);
            alert("Failed to load portfolio data. Please ensure the data.json file is available.");
        }
    }

    function renderSectionWithMarkdown(items, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const totalCards = items.length;
        const totalPages = Math.ceil(totalCards / CARDS_PER_PAGE);
        let currentPage = 1;

        async function renderPage(page) {
            container.innerHTML = "";
            const start = (page - 1) * CARDS_PER_PAGE;
            const pageItems = items.slice(start, start + CARDS_PER_PAGE);

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
                    technologiesHTML = `<ul class="technologies-list">
                        ${item.technologies.map(tech => `<li>${tech}</li>`).join('')}
                    </ul>`;
                }

                let readMoreLink = item.readMoreLink || "#";
                let target = "_blank";
                if (containerId === 'projects-list') {
                    readMoreLink = `project.html?name=${encodeURIComponent(item.name)}`;
                }

                card.innerHTML = `
                    <div class="card-front" style="${backgroundStyle}">
                        <h3>${item.title || item.name}</h3>
                    </div>
                    <div class="card-content">
                        <div>${description}</div>
                        ${technologiesHTML}
                        <a href="${readMoreLink}" class="read-more" target="${target}">Read More</a>
                    </div>
                `;

                container.appendChild(card);
                card.addEventListener("click", (e) => {
                    if (e.target.tagName !== 'A') {
                        card.classList.toggle("open");
                    }
                });
            }
        }

        function renderPagination() {
            const paginationContainer = container.parentElement.querySelector(".pagination");
            if (!paginationContainer) return;
            paginationContainer.innerHTML = "";

            if (totalPages <= 1) return;

            const prevButton = document.createElement("button");
            prevButton.textContent = "Previous";
            prevButton.disabled = currentPage === 1;
            prevButton.addEventListener("click", () => updatePage(currentPage - 1));
            paginationContainer.appendChild(prevButton);

            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement("button");
                pageButton.textContent = i;
                if (i === currentPage) pageButton.classList.add("active");
                pageButton.addEventListener("click", () => updatePage(i));
                paginationContainer.appendChild(pageButton);
            }

            const nextButton = document.createElement("button");
            nextButton.textContent = "Next";
            nextButton.disabled = currentPage === totalPages;
            nextButton.addEventListener("click", () => updatePage(currentPage + 1));
            paginationContainer.appendChild(nextButton);
        }

        async function updatePage(page) {
            if (page < 1 || page > totalPages) return;
            currentPage = page;
            await renderPage(page);
            renderPagination();
        }

        updatePage(1);
    }

    loadData();
});
