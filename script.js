document.addEventListener("DOMContentLoaded", () => {
    console.log("Portfolio loaded successfully!");

    const currentYear = new Date().getFullYear();

    // Insert the current year into the span with id "current-year"
    document.getElementById("current-year").textContent = currentYear;

        const CARDS_PER_PAGE = 6; // Maximum cards per page

        async function loadData() {
        try {
            const response = await fetch("data.json");
            if (!response.ok) throw new Error("Failed to load data.json");

            const data = await response.json();

            // Populate About Me section
            const aboutSection = document.querySelector("#about p");
            aboutSection.textContent = data.about?.text || "No About Me section found.";

            // Render sections with pagination
            renderSectionWithPagination(data.progress || [], "progress-list");
            renderSectionWithPagination(data.projects || [], "projects-list");

            // Populate Resume section
            const resumeLink = document.querySelector("#resume a");
            if (data.resume) {
                resumeLink.href = data.resume;
                resumeLink.textContent = "View Resume";
            } else {
                resumeLink.textContent = "Resume not available.";
                resumeLink.href = "#";
            }

          // Populate Contact section
const contactSection = document.querySelector("#contact .contact-list");
if (data.contact?.length) {
    contactSection.innerHTML = "";
    data.contact.forEach(contactItem => {
        const contactElement = document.createElement("div");
        contactElement.classList.add("contact-item"); // Adding a class for styling

        // Check if the link exists
        if (contactItem.link) {
            const contactLink = document.createElement("a");
            contactLink.href = contactItem.link;
            contactLink.target = "_blank";

            // Create and append image if it exists
            if (contactItem.image) {
                const contactImage = document.createElement("img");
                contactImage.src = contactItem.image;
                contactImage.alt = `${contactItem.name} image`;
                contactImage.classList.add("contact-image"); // Optional: Add class for styling
                contactLink.appendChild(contactImage);
            }

            // Add the name as text to the link
            contactLink.innerHTML += `<span>${contactItem.name}</span>`;
            contactElement.appendChild(contactLink);
        } else {
            // If there's no link, just display the name or default text
            contactElement.textContent = contactItem.name || "Contact option unavailable.";
        }

        contactSection.appendChild(contactElement);
    });
} else {
    contactSection.textContent = "No contact options available.";
}

        } catch (error) {
            console.error("Error loading data:", error);
            alert("Failed to load portfolio data. Please ensure the data.json file is available.");
        }
    }

    function renderSectionWithPagination(items, containerId) {
        const container = document.getElementById(containerId);
        const totalCards = items.length;
        const totalPages = Math.ceil(totalCards / CARDS_PER_PAGE);
        let currentPage = 1;

        function renderPage(page) {
            container.innerHTML = "";
            const start = (page - 1) * CARDS_PER_PAGE;
            const pageItems = items.slice(start, start + CARDS_PER_PAGE);

            pageItems.forEach((item) => {
                const card = document.createElement("div");
                card.classList.add("card");

                const backgroundStyle = item.image
                    ? `background-image: url(${item.image}); background-size: cover;`
                    : "background-color: #3498db;";

                card.innerHTML = `
                    <div class="card-front" style="${backgroundStyle}">
                        <h3>${item.day || item.name}</h3>
                    </div>
                    <div class="card-content">
                        <p>${item.description || "No description available."}</p>
                        <a href="${item.readMoreLink || "#"}" class="read-more" target="_blank">Read More</a>
                    </div>
                `;

                container.appendChild(card);

                card.addEventListener("click", () => card.classList.toggle("open"));
            });
        }

        function renderPagination() {
            const paginationContainer = container.parentElement.querySelector(".pagination") || document.createElement("div");
            paginationContainer.classList.add("pagination");
            paginationContainer.innerHTML = "";

            const prevButton = document.createElement("button");
            prevButton.textContent = "Previous";
            prevButton.disabled = currentPage === 1;
            prevButton.addEventListener("click", () => {
                if (currentPage > 1) updatePage(--currentPage);
            });

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
            nextButton.addEventListener("click", () => {
                if (currentPage < totalPages) updatePage(++currentPage);
            });

            paginationContainer.appendChild(nextButton);
            container.parentElement.appendChild(paginationContainer);
        }

        function updatePage(page) {
            currentPage = page;
            renderPage(page);
            renderPagination();
        }

        updatePage(1);
    }

    loadData();
});
