document.addEventListener("DOMContentLoaded", () => {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = currentYear;
    }

    function setMetaTag(property, content) {
        let element = document.querySelector(`meta[property='${property}']`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute('property', property);
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    }

    async function loadProjectDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const projectName = urlParams.get('name');

        if (!projectName) {
            document.getElementById("project-title").textContent = "Project not found";
            return;
        }

        try {
            const response = await fetch("data.json");
            if (!response.ok) throw new Error("Failed to load data.json");

            const data = await response.json();
            const project = data.projects.find(p => p.name === projectName);

            if (project) {
                document.title = `${project.name} - Edem Robin`;
                document.getElementById("project-title").textContent = project.name;

                setMetaTag('og:title', `${project.name} - Edem Robin`);
                setMetaTag('og:url', window.location.href);

                if (project.image) {
                    const projectImage = document.getElementById("project-image");
                    projectImage.src = project.image;
                    projectImage.alt = project.name;
                    setMetaTag('og:image', project.image);
                }

                if (project.file) {
                    try {
                        const mdResponse = await fetch(project.file);
                        if (!mdResponse.ok) throw new Error(`Failed to load ${project.file}`);
                        const markdown = await mdResponse.text();
                        document.getElementById("project-content").innerHTML = marked.parse(markdown);

                        const description = markdown.substring(0, 155) + '...';
                        setMetaTag('description', description);
                        setMetaTag('og:description', description);

                    } catch (error) {
                        console.error("Error loading markdown file:", error);
                        document.getElementById("project-content").textContent = "Error loading project details.";
                    }
                }
            } else {
                document.getElementById("project-title").textContent = "Project not found";
            }
        } catch (error) {
            console.error("Error loading project details:", error);
            document.getElementById("project-title").textContent = "Error loading project details.";
        }
    }

    loadProjectDetails();
});
