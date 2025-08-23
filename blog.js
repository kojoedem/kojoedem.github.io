document.addEventListener("DOMContentLoaded", () => {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = currentYear;
    }

    const searchInput = document.getElementById("search-input");
    const postsList = document.getElementById("posts-list");
    let allPosts = [];

    async function fetchPostContent(post) {
        if (post.file) {
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
                const postPromises = data.blog.map(fetchPostContent);
                allPosts = await Promise.all(postPromises);
                renderPosts(allPosts);
            } else {
                postsList.textContent = "No blog posts found.";
            }
        } catch (error) {
            console.error("Error loading blog posts:", error);
            if (postsList) {
                postsList.textContent = "Could not load blog posts.";
            }
        }
    }

    function renderPosts(posts) {
        postsList.innerHTML = "";
        if (posts.length === 0) {
            postsList.textContent = "No posts found.";
            return;
        }

        posts.forEach(post => {
            const postElement = document.createElement("div");
            postElement.classList.add("blog-post");

            const titleElement = document.createElement("h3");
            titleElement.textContent = post.title;
            postElement.appendChild(titleElement);

            const dateElement = document.createElement("p");
            dateElement.classList.add("post-date");
            dateElement.textContent = `Posted on ${post.date}`;
            postElement.appendChild(dateElement);

            const contentElement = document.createElement("div");
            contentElement.classList.add("post-content");
            contentElement.innerHTML = marked.parse(post.content || "");
            postElement.appendChild(contentElement);

            postsList.appendChild(postElement);
        });
    }

    searchInput.addEventListener("keyup", (e) => {
        const searchTerm = e.target.value.toLowerCase();

        const filteredPosts = allPosts.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(searchTerm);
            const contentMatch = post.content.toLowerCase().includes(searchTerm);
            const tagsMatch = post.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
            return titleMatch || contentMatch || tagsMatch;
        });

        renderPosts(filteredPosts);
    });

    loadBlogPosts();
});
