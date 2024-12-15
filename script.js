document.addEventListener("DOMContentLoaded", () => {
    console.log("Portfolio loaded successfully!");

    // Function to fetch and load data dynamically from data.json
    async function loadData() {
        try {
            const response = await fetch("data.json");
            if (!response.ok) throw new Error("Failed to load data.json");

            const data = await response.json();

            // Populate the About Me section
            const aboutSection = document.querySelector("#about p");
            aboutSection.textContent = data.about?.text || "Hi! Update your about section in the dashboard.";

            // Populate the CCNP Progress section
            const progressList = document.getElementById("progress-list");
            progressList.innerHTML = ""; // Clear previous content
            if (data.progress && data.progress.length) {
                data.progress.forEach((entry) => {
                    const div = document.createElement("div");
                    div.classList.add("progress-item", "card"); // Added 'card' class for styling
                    div.innerHTML = `
                        <h3>Day ${entry.day}</h3>
                        <p>${entry.update}</p>
                        <p>${entry.description}</p>
                        <a href="${entry.readMoreLink}" target="_blank" class="read-more">Read More</a>
                    `;
                    progressList.appendChild(div);
                });
            } else {
                progressList.innerHTML = "<p>No progress updates yet. Add some!</p>";
            }

            // Populate the Projects section
            const projectList = document.getElementById("projects-list");
            projectList.innerHTML = ""; // Clear previous content
            if (data.projects && data.projects.length) {
                data.projects.forEach((project) => {
                    const div = document.createElement("div");
                    div.classList.add("project-item", "card"); // Corrected class for consistency
                    div.innerHTML = `
                        <img src="${project.image}" alt="${project.name}" class="project-image">
                        <h3>${project.name}</h3>
                        <p>${project.description}</p>
                        <a href="${project.link}" target="_blank">View Project</a>
                    `;
                    projectList.appendChild(div);
                });
            } else {
                projectList.innerHTML = "<p>No projects yet. Add some!</p>";
            }

            // Populate the Resume section
            const resumeLink = document.getElementById("resume-link");
            resumeLink.href = data.resume || "#";
            resumeLink.textContent = data.resume ? "Download Resume" : "Resume not available.";
        } catch (error) {
            console.error("Error loading data:", error);
            alert("Failed to load portfolio data. Please ensure the data.json file is available.");
        }
    }

    // Call the function to load data on page load
    loadData();
});
