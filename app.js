function renderAbout(data) {
    const aboutSection = document.querySelector("#about .about-me-p");
    if (aboutSection) {
        aboutSection.textContent = data.about?.text || "No About Me section found.";
    }
}

function renderFilterableSection(items, containerId, filterContainerId, searchInputId, CARDS_PER_PAGE = 8) {
    const container = document.getElementById(containerId);
    const filterContainer = document.getElementById(filterContainerId);
    const searchInput = document.getElementById(searchInputId);
    if (!container) return;

    let currentFilter = "All";
    let searchTerm = "";
    let allItems = [...items];

    function applyFilters() {
        let filtered = [...allItems];
        if (currentFilter !== "All") {
            filtered = filtered.filter(item => item.tags?.includes(currentFilter));
        }
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(item => {
                const title = (item.day || item.name || "").toLowerCase();
                const description = Array.isArray(item.description) ? item.description.join(' ').toLowerCase() : (item.description || "").toLowerCase();
                return title.includes(lowerCaseSearchTerm) || description.includes(lowerCaseSearchTerm);
            });
        }
        return filtered;
    }

    function renderPage(page, itemsToRender) {
        container.innerHTML = "";
        const start = (page - 1) * CARDS_PER_PAGE;
        const pageItems = itemsToRender.slice(start, start + CARDS_PER_PAGE);

        pageItems.forEach((item) => {
            const card = document.createElement("div");
            card.classList.add("card");
            if (item.image) {
                card.classList.add("has-image");
            }
            const backgroundStyle = item.image ? `background-image: url(${item.image}); background-size: cover;` : "background-color: #3498db;";
            card.innerHTML = `
                <div class="card-front" style="${backgroundStyle}">
                    <h3>${item.day || item.name}</h3>
                </div>
                <div class="card-content">
                    <div class="card-meta">
                        <span class="author">By: ${item.author || 'Anonymous'}</span>
                        <span class="date">${item.date || ''}</span>
                    </div>
                    <p>${Array.isArray(item.description) ? item.description.join(' ') : item.description || "No description available."}</p>
                    ${item.tags ? `<div class="tags-container">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                    <button class="read-more" data-markdown-path="${item.readMoreLink || "#"}">Read More</button>
                </div>
            `;
            container.appendChild(card);
            card.addEventListener("click", (e) => {
                if (e.target.classList.contains('read-more')) {
                    e.stopPropagation(); // Prevent card flip when clicking button
                    showMarkdownModal(e.target.dataset.markdownPath, item.type === 'blog' ? 'blog.html' : 'projects.html');
                } else {
                    card.classList.toggle("open");
                }
            });
        });
    }

    function renderPagination(totalPages, currentPage) {
        const paginationContainer = container.parentElement.querySelector(".pagination") || document.createElement("div");
        paginationContainer.classList.add("pagination");
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
        container.parentElement.appendChild(paginationContainer);
    }

    function updatePage(page) {
        const filteredItems = applyFilters();
        const totalPages = Math.ceil(filteredItems.length / CARDS_PER_PAGE);
        renderPage(page, filteredItems);
        renderPagination(totalPages, page);
        updateFilterButtons();
    }

    function updateFilterButtons() {
        if (!filterContainer) return;
        const buttons = filterContainer.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.textContent === currentFilter) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    function renderFilterButtons() {
        if (!filterContainer) return;
        const allTags = new Set(items.flatMap(item => item.tags || []));
        const tags = ["All", ...allTags];
        filterContainer.innerHTML = "";
        tags.forEach(tag => {
            const button = document.createElement("button");
            button.textContent = tag;
            button.addEventListener("click", () => {
                currentFilter = tag;
                updatePage(1);
            });
            filterContainer.appendChild(button);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            searchTerm = e.target.value;
            updatePage(1);
        });
    }

    renderFilterButtons();
    updatePage(1);
}

function renderProjects(data) {
    renderFilterableSection(data.projects || [], "projects-list", "projects-filter-container", null);
}

function renderBlogPage(data) {
    const contentContainer = document.getElementById('blog-content');
    const sidebarList = document.getElementById('blog-sidebar-list');
    const searchInput = document.getElementById('sidebar-search-input');
    if (!contentContainer || !sidebarList || !searchInput) return;

    const allPosts = (data.progress || []).slice().reverse();

    const populateSidebar = (postsToRender) => {
        sidebarList.innerHTML = "";
        postsToRender.forEach(post => {
            const listItem = document.createElement("li");
            const link = document.createElement("a");
            link.href = "#";
            link.textContent = post.day;
            link.dataset.path = post.readMoreLink;

            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadBlogPost(link.dataset.path, contentContainer);
                sidebarList.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                link.classList.add('active');
            });

            listItem.appendChild(link);
            sidebarList.appendChild(listItem);
        });
    };

    populateSidebar(allPosts);

    if (allPosts.length > 0) {
        loadBlogPost(allPosts[0].readMoreLink, contentContainer);
        sidebarList.querySelector('a')?.classList.add('active');
    }

    searchInput.addEventListener('keyup', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredPosts = allPosts.filter(post =>
            post.day.toLowerCase().includes(searchTerm)
        );
        populateSidebar(filteredPosts);
    });
}

async function loadBlogPost(path, container) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to fetch ${path}`);
        const markdown = await response.text();
        container.innerHTML = marked.parse(markdown);

    } catch (error) {
        console.error("Error loading blog post:", error);
        container.innerHTML = "<h3>Error</h3><p>Could not load blog post content.</p>";
    }
}

function renderContact(data) {
    const contactSection = document.querySelector("#contact .contact-list");
    if (contactSection && data.contact?.length) {
        contactSection.innerHTML = "";
        data.contact.forEach(contactItem => {
            const contactElement = document.createElement("div");
            contactElement.classList.add("contact-item");
            if (contactItem.link) {
                const contactLink = document.createElement("a");
                contactLink.href = contactItem.link;
                contactLink.target = "_blank";
                if (contactItem.image) {
                    const contactImage = document.createElement("img");
                    contactImage.src = contactItem.image;
                    contactImage.alt = `${contactItem.name} image`;
                    contactImage.classList.add("contact-image");
                    contactLink.appendChild(contactImage);
                }
                contactLink.title = contactItem.name;
                contactElement.appendChild(contactLink);
            } else {
                contactElement.textContent = contactItem.name || "Contact option unavailable.";
            }
            contactSection.appendChild(contactElement);
        });
    } else if (contactSection) {
        contactSection.textContent = "No contact options available.";
    }
}

function renderGallery(data) {
    const galleryContainer = document.getElementById("image-gallery");
    if (galleryContainer && data.gallery?.length) {
        galleryContainer.innerHTML = "";
        data.gallery.forEach(item => {
            const galleryItem = document.createElement("div");
            galleryItem.classList.add("gallery-item");
            galleryItem.dataset.src = item.imageUrl; // For lightGallery
            galleryItem.dataset.subHtml = `<h4>${item.title}</h4>`; // For lightGallery caption

            const img = document.createElement("img");
            img.src = item.imageUrl;
            img.alt = item.title;

            galleryItem.appendChild(img);
            galleryContainer.appendChild(galleryItem);
        });

        // Initialize lightGallery
        lightGallery(galleryContainer, {
            selector: '.gallery-item',
            plugins: [lgThumbnail, lgPager],
            download: false
        });
    }
}

function setupMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (menuToggle && navLinks) {
        const navLinksItems = navLinks.querySelectorAll("a");
        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");
            menuToggle.setAttribute("aria-expanded", isOpen);
        });
        navLinksItems.forEach(link => {
            link.addEventListener("click", () => {
                if (navLinks.classList.contains("open")) {
                    navLinks.classList.remove("open");
                    menuToggle.setAttribute("aria-expanded", false);
                }
            });
        });
    }
}

function setYear() {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = currentYear;
    }
}

function renderLatestContent(data, count = 8) {
    const listContainer = document.getElementById("latest-posts-list");
    if (!listContainer) return;

    const allContent = [...(data.progress || []), ...(data.projects || [])];
    allContent.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestContent = allContent.slice(0, count);

    if (latestContent.length === 0) {
        listContainer.innerHTML = "<li>No recent content available.</li>";
        return;
    }

    listContainer.innerHTML = "";
    latestContent.forEach(item => {
        const listItem = document.createElement("li");
        const button = document.createElement("button");
        const itemType = item.type === 'blog' ? 'Blog' : 'Project';
        const fullPageLink = item.type === 'blog' ? 'blog.html' : 'projects.html';

        button.textContent = `[${itemType}] ${item.day || item.name}`;
        button.addEventListener('click', () => {
            showMarkdownModal(item.readMoreLink, fullPageLink);
        });

        listItem.appendChild(button);
        listContainer.appendChild(listItem);
    });
}


function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    const elementsToAnimate = document.querySelectorAll('.scroll-animate');
    elementsToAnimate.forEach(el => {
        el.classList.add('hidden');
        observer.observe(el);
    });
}

// --- Modal Logic ---
async function showMarkdownModal(path, fullPageLink) {
    if (!path || path === "#") return;
    const modalOverlay = document.getElementById('markdown-modal');
    const modalBody = document.getElementById('modal-body');
    if (!modalOverlay || !modalBody) return;

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to fetch ${path}`);
        const markdown = await response.text();

        let readMoreButton = '';
        if (fullPageLink) {
            readMoreButton = `<a href="${fullPageLink}" class="read-more modal-read-more">Read More on Full Page</a>`;
        }

        modalBody.innerHTML = marked.parse(markdown) + readMoreButton;
        modalOverlay.classList.add('visible');
    } catch (error) {
        console.error("Error loading markdown:", error);
        modalBody.innerHTML = "<p>Error: Could not load content.</p>";
        modalOverlay.classList.add('visible');
    }
}

function setupModal() {
    const modalOverlay = document.getElementById('markdown-modal');
    const modalCloseButton = modalOverlay?.querySelector('.modal-close');

    function closeModal() {
        modalOverlay.classList.remove('visible');
    }

    if (modalOverlay && modalCloseButton) {
        modalCloseButton.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', setupModal);

function renderLatestContentGrid(data, count = 8) {
    const container = document.getElementById("latest-content-grid");
    if (!container) return;

    const allContent = [...(data.progress || []), ...(data.projects || [])];
    allContent.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestContent = allContent.slice(0, count);

    container.innerHTML = "";
    latestContent.forEach((item) => {
        const card = document.createElement("div");
        card.classList.add("card");
        if (item.image) {
            card.classList.add("has-image");
        }
        const backgroundStyle = item.image ? `background-image: url(${item.image}); background-size: cover;` : "background-color: #3498db;";
        card.innerHTML = `
            <div class="card-front" style="${backgroundStyle}">
                <h3>${item.day || item.name}</h3>
            </div>
            <div class="card-content">
                <div class="card-meta">
                    <span class="author">By: ${item.author || 'Anonymous'}</span>
                    <span class="date">${item.date || ''}</span>
                </div>
                <p>${Array.isArray(item.description) ? item.description.join(' ') : item.description || "No description available."}</p>
                ${item.tags ? `<div class="tags-container">${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                <button class="read-more" data-markdown-path="${item.readMoreLink || "#"}">Read More</button>
            </div>
        `;
        container.appendChild(card);
        card.addEventListener("click", (e) => {
            if (e.target.classList.contains('read-more')) {
                e.stopPropagation();
                const fullPageLink = item.type === 'blog' ? 'blog.html' : 'projects.html';
                window.location.href = fullPageLink;
            } else {
                card.classList.toggle("open");
            }
        });
    });
}
