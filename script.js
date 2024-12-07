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
            aboutSection.textContent = data.about || "Hi! Update your about section in the dashboard.";

            // Populate the CCNP Progress section
            const progressList = document.getElementById("progress-list");
            progressList.innerHTML = ""; // Clear previous content
            if (data.progress && data.progress.length) {
                data.progress.forEach((entry) => {
                    const li = document.createElement("li");
                    li.textContent = `Day ${entry.day}: ${entry.update}`;
                    progressList.appendChild(li);
                });
            } else {
                progressList.innerHTML = "<li>No progress updates yet. Add some!</li>";
            }

            // Populate the Projects section
            const projectList = document.getElementById("project-list");
            projectList.innerHTML = ""; // Clear previous content
            if (data.projects && data.projects.length) {
                data.projects.forEach((project) => {
                    const div = document.createElement("div");
                    div.classList.add("project-item");
                    div.innerHTML = `
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
