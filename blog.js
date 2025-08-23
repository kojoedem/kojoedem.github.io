document.addEventListener("DOMContentLoaded", () => {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = currentYear;
    }

    const searchInput = document.getElementById("search-input");
    const postsListContainer = document.getElementById("posts-list");
    const postContentContainer = document.getElementById("blog-post-content");

    let allPosts = [];

    async function fetchPostContent(post) {
        if (post.file && !post.content) {
            try {
                const mdResponse = await fetch(post.file);
                if (mdResponse.ok) {
                    post.content = await mdResponse.text();
                } else {
                    post.content = "Error loading content.";
                }
            } catch (error) {
                console.error("Error loading markdown file:", error);
                post.content = "Error loading content.";
            }
        }
        return post;
    }

    async function loadBlogPosts() {
        try {
            const response = await fetch("data.json");
            if (!response.ok) throw new Error("Failed to load data.json");

            const data = await response.json();

            if (data.blog && data.blog.length > 0) {
                allPosts = data.blog.sort((a, b) => new Date(b.date) - new Date(a.date));
                renderSidebar(allPosts);
                // Load the most recent post by default
                if (allPosts.length > 0) {
                    displayPost(allPosts[0]);
                }
            } else {
                postsListContainer.textContent = "No blog posts found.";
            }
        } catch (error) {
            console.error("Error loading blog posts:", error);
            if (postsListContainer) {
                postsListContainer.textContent = "Could not load blog posts.";
            }
        }
    }

    function renderSidebar(posts) {
        postsListContainer.innerHTML = "";
        if (posts.length === 0) {
            postsListContainer.textContent = "No posts found.";
            return;
        }

        const ul = document.createElement('ul');
        posts.forEach(post => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${post.title.replace(/\s+/g, '-').toLowerCase()}`;
            a.textContent = post.title;

            a.addEventListener('click', (e) => {
                e.preventDefault();
                displayPost(post);
                // Update URL hash
                window.location.hash = a.hash;
            });

            a.addEventListener('mouseover', async () => {
                const postWithContent = await fetchPostContent(post);
                const snippet = postWithContent.content.substring(0, 100) + '...';
                a.title = snippet;
            });

            li.appendChild(a);
            ul.appendChild(li);
        });
        postsListContainer.appendChild(ul);
    }

    async function displayPost(post) {
        if (!post) return;

        postContentContainer.innerHTML = '<h2>Loading...</h2>';

        const postWithContent = await fetchPostContent(post);

        postContentContainer.innerHTML = `
            <div class="blog-post">
                <h3>${postWithContent.title}</h3>
                <p class="post-date">Posted on ${postWithContent.date}</p>
                <div class="post-content">${marked.parse(postWithContent.content || "")}</div>
            </div>`;
    }

    searchInput.addEventListener("keyup", (e) => {
        const searchTerm = e.target.value.toLowerCase();

        const filteredPosts = allPosts.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(searchTerm);
            const tagsMatch = post.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
            return titleMatch || tagsMatch;
        });

        renderSidebar(filteredPosts);
    });

    // Handle loading post from URL hash
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        const postToLoad = allPosts.find(p => p.title.replace(/\s+/g, '-').toLowerCase() === hash);
        if (postToLoad) {
            displayPost(postToLoad);
        }
    });

    loadBlogPosts().then(() => {
        if (window.location.hash) {
             const hash = window.location.hash.substring(1);
             const postToLoad = allPosts.find(p => p.title.replace(/\s+/g, '-').toLowerCase() === hash);
             if (postToLoad) {
                displayPost(postToLoad);
             }
        }
    });
});
