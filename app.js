function renderAbout(data) {
    const aboutSection = document.querySelector("#about");
    if (aboutSection) {
        // Clear the "Loading..." text
        aboutSection.innerHTML = '';

        const professional = data.about?.professional;
        const funny = data.about?.funny;

        const parseText = (text) => {
            if (typeof marked !== "undefined") {
                return marked.parse(text || "");
            }
            return text || "";
        };

        const parseInlineText = (text) => {
            if (typeof marked !== "undefined") {
                return marked.parseInline(text || "");
            }
            return text || "";
        };

        if (professional) {
            const professionalContainer = document.createElement('div');
            professionalContainer.classList.add('about-section');

            const title = document.createElement('h2');
            title.className = 'about-me';
            title.textContent = "About Me";
            professionalContainer.appendChild(title);

            const intro = document.createElement('div');
            intro.classList.add('about-intro');
            intro.innerHTML = parseText(professional.introduction);
            professionalContainer.appendChild(intro);

            const createList = (title, items) => {
                const listContainer = document.createElement('div');
                listContainer.classList.add('about-list-card');
                const listTitle = document.createElement('h4');
                listTitle.classList.add('about-list-title');
                listTitle.textContent = title;
                listContainer.appendChild(listTitle);
                const ul = document.createElement('ul');
                items.forEach(item => {
                    const li = document.createElement('li');
                    li.innerHTML = parseInlineText(item);
                    ul.appendChild(li);
                });
                listContainer.appendChild(ul);
                return listContainer;
            };

            const listsGrid = document.createElement('div');
            listsGrid.classList.add('about-lists-grid');

            if (professional.values) {
                listsGrid.appendChild(createList("My Values", professional.values));
            }
            if (professional.focus) {
                listsGrid.appendChild(createList("My Focus", professional.focus));
            }
            if (professional.philosophy) {
                listsGrid.appendChild(createList("My Philosophy", professional.philosophy));
            }

            if (professional.values || professional.focus || professional.philosophy) {
                professionalContainer.appendChild(listsGrid);
            }

            const personality = document.createElement('div');
            personality.classList.add('about-paragraph');
            personality.innerHTML = parseText(professional.personality);
            professionalContainer.appendChild(personality);

            const vision = document.createElement('div');
            vision.classList.add('about-paragraph');
            vision.innerHTML = parseText(professional.future_vision);
            professionalContainer.appendChild(vision);

            const closing = document.createElement('div');
            closing.classList.add('about-paragraph');
            closing.innerHTML = parseText(professional.closing);
            professionalContainer.appendChild(closing);

            aboutSection.appendChild(professionalContainer);
        }

        if (funny) {
            const funnyContainer = document.createElement('div');
            funnyContainer.classList.add('about-section', 'funny-section');

            const funnyTitle = document.createElement('h3');
            funnyTitle.textContent = "The Lighter Side...";
            funnyContainer.appendChild(funnyTitle);

            const funnyText = document.createElement('div');
            funnyText.innerHTML = parseText(funny.text);
            funnyContainer.appendChild(funnyText);

            aboutSection.appendChild(funnyContainer);
        }

        if (!professional && !funny) {
            aboutSection.innerHTML = '<h2 class="about-me">About Me</h2><p class="about-me-p">No About Me section found.</p>';
        }
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

// Helper to transform a filename path (content/pyats-day-1.md) into a shareable slug
function getSlug(link) {
    if (!link) return "";
    // Remove content/ prefix and .md extension
    return link.replace(/^content\//i, "").replace(/\.md$/i, "");
}

// Helper to look up an item in data.json by its slug
function findItemBySlug(data, slug) {
    if (!slug) return null;
    const allPosts = data.progress || [];
    return allPosts.find(post => getSlug(post.readMoreLink) === slug);
}

// Helper to update the browser URL search parameter without reloading
function updateUrlSlug(slug) {
    if (slug) {
        const newUrl = `${window.location.pathname}?post=${encodeURIComponent(slug)}`;
        window.history.replaceState({ path: newUrl }, "", newUrl);
    }
}

function renderPyatsPosts(data) {
    const sidebarList = document.getElementById('pyats-sidebar-list');
    const contentContainer = document.getElementById('blog-content');
    const progressText = document.getElementById('pyats-progress-text');
    const progressBarFill = document.getElementById('pyats-progress-bar-fill');

    if (!sidebarList || !contentContainer) return;

    // Filter posts for pyATS category
    const pyatsPosts = (data.progress || []).filter(post => post.category === 'pyats');

    if (pyatsPosts.length === 0) {
        sidebarList.innerHTML = "<li>No pyATS posts yet.</li>";
        return;
    }

    // Sort by day number ascending
    pyatsPosts.sort((a, b) => (a.day_num || 0) - (b.day_num || 0));

    // Calculate progress based on the latest day number completed
    const maxDayCompleted = Math.max(...pyatsPosts.map(post => post.day_num || 0), 0);
    const progressPercent = Math.min((maxDayCompleted / 100) * 100, 100);

    if (progressText) {
        progressText.textContent = `Progress: Day ${maxDayCompleted} / 100`;
    }
    if (progressBarFill) {
        progressBarFill.style.width = `${progressPercent}%`;
    }

    // Render pyATS sidebar links
    sidebarList.innerHTML = "";
    pyatsPosts.forEach(post => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#";
        link.textContent = post.day;
        link.dataset.path = post.readMoreLink;
        link.dataset.slug = getSlug(post.readMoreLink);

        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadBlogPost(link.dataset.path, contentContainer);
            updateUrlSlug(link.dataset.slug);
            // Clear active from both blog lists to make selection exclusive
            document.querySelectorAll('#pyats-sidebar-list a, #blog-sidebar-list a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
        });

        listItem.appendChild(link);
        sidebarList.appendChild(listItem);
    });
}

function renderBlogPage(data) {
    const contentContainer = document.getElementById('blog-content');
    const sidebarList = document.getElementById('blog-sidebar-list');
    const searchInput = document.getElementById('sidebar-search-input');
    if (!contentContainer || !sidebarList || !searchInput) return;

    // Exclude pyATS posts from the main blog's sidebar and page view to keep lists separate
    const allPosts = (data.progress || [])
        .filter(post => post.category !== 'pyats')
        .slice()
        .reverse();

    const populateSidebar = (postsToRender) => {
        sidebarList.innerHTML = "";
        postsToRender.forEach(post => {
            const listItem = document.createElement("li");
            const link = document.createElement("a");
            link.href = "#";
            link.textContent = post.day;
            link.dataset.path = post.readMoreLink;
            link.dataset.slug = getSlug(post.readMoreLink);

            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadBlogPost(link.dataset.path, contentContainer);
                updateUrlSlug(link.dataset.slug);
                // Clear active from both blog lists to make selection exclusive
                document.querySelectorAll('#pyats-sidebar-list a, #blog-sidebar-list a').forEach(a => a.classList.remove('active'));
                link.classList.add('active');
            });

            listItem.appendChild(link);
            sidebarList.appendChild(listItem);
        });
    };

    populateSidebar(allPosts);

    // Check if query parameter specifies a specific blog post slug or path to load
    const urlParams = new URLSearchParams(window.location.search);
    const rawPostToLoad = urlParams.get('post');
    let finalPathToLoad = null;

    if (rawPostToLoad) {
        // Try looking up the item by slug
        const matchedItemBySlug = findItemBySlug(data, rawPostToLoad);
        if (matchedItemBySlug) {
            finalPathToLoad = matchedItemBySlug.readMoreLink;
        } else {
            // Fallback: Check if the raw parameter is already a path
            finalPathToLoad = rawPostToLoad;
        }
    }

    if (finalPathToLoad) {
        loadBlogPost(finalPathToLoad, contentContainer);
        // Highlight active link
        setTimeout(() => {
            document.querySelectorAll('#pyats-sidebar-list a, #blog-sidebar-list a').forEach(a => {
                if (a.dataset.path === finalPathToLoad) {
                    a.classList.add('active');
                } else {
                    a.classList.remove('active');
                }
            });
        }, 100);
    } else {
        // Default load: Prefer first other post if available, else first pyATS post
        if (allPosts.length > 0) {
            loadBlogPost(allPosts[0].readMoreLink, contentContainer);
            sidebarList.querySelector('a')?.classList.add('active');
            updateUrlSlug(getSlug(allPosts[0].readMoreLink));
        } else {
            const pyatsPosts = (data.progress || []).filter(post => post.category === 'pyats');
            if (pyatsPosts.length > 0) {
                pyatsPosts.sort((a, b) => (a.day_num || 0) - (b.day_num || 0));
                loadBlogPost(pyatsPosts[0].readMoreLink, contentContainer);
                document.querySelector('#pyats-sidebar-list a')?.classList.add('active');
                updateUrlSlug(getSlug(pyatsPosts[0].readMoreLink));
            }
        }
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
    console.log("Rendering gallery");
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

    // Compile biography text markdown under profile image if we have a loader and are on a page containing #header-bio-text
    const bioTextElement = document.getElementById("header-bio-text");
    if (bioTextElement && typeof marked !== "undefined" && !bioTextElement.dataset.parsed) {
        bioTextElement.dataset.parsed = "true";
        // Extract raw text before links
        const htmlContent = bioTextElement.innerHTML;
        // To keep links functional and parse only text, let's extract the bio lines and process with marked
        const linkMatches = htmlContent.match(/<a[\s\S]*?<\/a>/gi) || [];
        // Temporary replacement for links
        let processedText = htmlContent.replace(/<a[\s\S]*?<\/a>/gi, "[[LINK_PLACEHOLDER]]");
        // Replace <br> tags with double newlines so marked interprets them as paragraphs
        processedText = processedText.replace(/<br\s*\/?>/gi, "\n\n");
        // Parse with marked.js
        let parsedHtml = marked.parse(processedText);
        // Put links back
        linkMatches.forEach(link => {
            parsedHtml = parsedHtml.replace("[[LINK_PLACEHOLDER]]", link);
        });
        bioTextElement.innerHTML = parsedHtml;
    }

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

        const isPyats = item.category === 'pyats';
        const itemType = isPyats ? 'pyATS' : (item.type === 'blog' ? 'Blog' : 'Project');
        const badgeClass = isPyats ? 'badge-pyats' : (item.type === 'blog' ? 'badge-blog' : 'badge-project');
        const fullPageLink = item.type === 'blog' ? 'blog.html' : 'projects.html';

        button.innerHTML = `
            <span class="activity-badge ${badgeClass}">${itemType}</span>
            <span class="activity-title">${item.day || item.name}</span>
            <span class="activity-meta">By: ${item.author || 'Anonymous'} | ${item.date || ''}</span>
        `;

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
            // Include deep linking query parameters for readMoreLink if we are showing a blog post modal
            const isBlogLink = fullPageLink.startsWith('blog.html');
            const targetLink = isBlogLink ? `blog.html?post=${encodeURIComponent(getSlug(path))}` : fullPageLink;
            readMoreButton = `<a href="${targetLink}" class="read-more modal-read-more">Read More on Full Page</a>`;
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

function renderLatestContentGrid(data) {
    const container = document.getElementById("latest-content-grid");
    if (!container) return;

    const CARDS_PER_PAGE = 6;
    let currentPage = 1;

    const allContent = [...(data.progress || []), ...(data.projects || [])];
    allContent.sort((a, b) => new Date(b.date) - new Date(a.date));

    function renderPage(page) {
        container.innerHTML = "";
        const start = (page - 1) * CARDS_PER_PAGE;
        const pageItems = allContent.slice(start, start + CARDS_PER_PAGE);

        // Update heading title based on page number
        const headingElement = document.getElementById("latest-content-title");
        if (headingElement) {
            if (page === 1) {
                headingElement.textContent = "Latest Content";
            } else {
                headingElement.textContent = "Older Content";
            }
        }

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
                    e.stopPropagation();
                    // Ensure redirect parameters are passed correctly for standard or pyats posts
                    const queryParam = item.readMoreLink ? `?post=${encodeURIComponent(getSlug(item.readMoreLink))}` : '';
                    const fullPageLink = item.type === 'blog' ? `blog.html${queryParam}` : `projects.html`;
                    window.location.href = fullPageLink;
                } else {
                    card.classList.toggle("open");
                }
            });
        });

        renderPagination(Math.ceil(allContent.length / CARDS_PER_PAGE), page);
    }

    function renderPagination(totalPages, page) {
        let paginationContainer = container.parentElement.querySelector(".latest-content-pagination");
        if (!paginationContainer) {
            paginationContainer = document.createElement("div");
            paginationContainer.classList.add("pagination", "latest-content-pagination");
            container.parentElement.appendChild(paginationContainer);
        }
        paginationContainer.innerHTML = "";
        if (totalPages <= 1) return;

        const prevButton = document.createElement("button");
        prevButton.innerHTML = "&larr; Newer";
        prevButton.disabled = page === 1;
        prevButton.addEventListener("click", () => {
            currentPage = page - 1;
            renderPage(currentPage);
            container.scrollIntoView({ behavior: 'smooth' });
        });
        paginationContainer.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement("button");
            pageButton.textContent = i;
            if (i === page) pageButton.classList.add("active");
            pageButton.addEventListener("click", () => {
                currentPage = i;
                renderPage(currentPage);
                container.scrollIntoView({ behavior: 'smooth' });
            });
            paginationContainer.appendChild(pageButton);
        }

        const nextButton = document.createElement("button");
        nextButton.innerHTML = "Older &rarr;";
        nextButton.disabled = page === totalPages;
        nextButton.addEventListener("click", () => {
            currentPage = page + 1;
            renderPage(currentPage);
            container.scrollIntoView({ behavior: 'smooth' });
        });
        paginationContainer.appendChild(nextButton);
    }

    renderPage(1);
}
