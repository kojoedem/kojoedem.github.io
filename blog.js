document.addEventListener("DOMContentLoaded", () => {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = currentYear;
    }

    async function loadBlogPosts() {
        try {
            const response = await fetch("data.json");
            if (!response.ok) throw new Error("Failed to load data.json");

            const data = await response.json();
            const postsList = document.getElementById("posts-list");

            if (data.blog && data.blog.length > 0) {
                for (const post of data.blog) {
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
                    postElement.appendChild(contentElement);

                    postsList.appendChild(postElement);

                    // Fetch and render markdown content
                    try {
                        const mdResponse = await fetch(post.file);
                        if (!mdResponse.ok) throw new Error(`Failed to load ${post.file}`);
                        const markdown = await mdResponse.text();
                        contentElement.innerHTML = marked.parse(markdown);
                    } catch (error) {
                        console.error("Error loading markdown file:", error);
                        contentElement.textContent = "Error loading post content.";
                    }
                }
            } else {
                postsList.textContent = "No blog posts found.";
            }
        } catch (error) {
            console.error("Error loading blog posts:", error);
            const postsList = document.getElementById("posts-list");
            if (postsList) {
                postsList.textContent = "Could not load blog posts.";
            }
        }
    }

    loadBlogPosts();
});
