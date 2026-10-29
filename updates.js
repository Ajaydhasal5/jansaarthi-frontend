const UPDATES_API_URL = "https://jansaarthi-backend-production-d805.up.railway.app/api/updates";
let allUpdates = [];
async function loadAllUpdates() {
    const container =
        document.getElementById("allUpdatesContainer");
    try {
        const response =
            await fetch(UPDATES_API_URL);
        if (!response.ok) {
            throw new Error(
                "Updates API failed"
            );
        }
        const data =
            await response.json();
        if (!Array.isArray(data)) {
            throw new Error(
                "Invalid updates data"
            );
        }
        allUpdates = data;
        displayUpdates(allUpdates);
    }
    catch (error) {
        console.error(
            "ALL UPDATES ERROR:",
            error
        );
        container.innerHTML = `
            <div class="no-updates">
                <div>⚠️</div>
                <h3>
                    अपडेट्स लोड झाले नाहीत
                </h3>
                <p>
                    Backend server चालू आहे का
                    ते तपासा.
                </p>
            </div>
        `;
        document.getElementById(
            "updateCount"
        ).innerText = "माहिती उपलब्ध नाही";
    }
}
function displayUpdates(updates) {
    const container =
        document.getElementById(
            "allUpdatesContainer"
        );
    const noUpdates =
        document.getElementById(
            "noUpdates"
        );
    const count =
        document.getElementById(
            "updateCount"
        );
    count.innerText =
        `${updates.length} अपडेट्स`;
    if (updates.length === 0) {
        container.innerHTML = "";
        noUpdates.style.display = "block";
        return;
    }
    noUpdates.style.display = "none";
    container.innerHTML =
        updates.map(function (update) {
            let date =
                "तारीख उपलब्ध नाही";
            if (update.created_at) {
                const updateDate =
                    new Date(
                        update.created_at
                    );
                if (
                    !isNaN(
                        updateDate.getTime()
                    )
                ) {
                    date =
                        updateDate.toLocaleDateString(
                            "mr-IN",
                            {
                                day: "2-digit",
                                month: "long",
                                year: "numeric"
                            }
                        );
                }
            }
            let moreButton = "";
            if (
                update.link &&
                update.link !== "#"
            ) {
                moreButton = `
                    <a
                        href="${escapeHTML(update.link)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="update-more">
                        अधिकृत माहिती →
                    </a>
                `;
            }
            return `
                <article class="update-item">
                    <div class="update-icon">
                        🔔
                    </div>
                    <div class="update-item-content">
                        <span class="update-badge">
                            ${escapeHTML(
                                update.update_type ||
                                "अपडेट"
                            )}
                        </span>
                        <h3>
                            ${escapeHTML(
                                update.title ||
                                "नवीन अपडेट"
                            )}
                        </h3>
                        <p>
                            ${escapeHTML(
                                update.description ||
                                "या अपडेटची माहिती उपलब्ध आहे."
                            )}
                        </p>
                        <span class="update-date">
                            📅 ${escapeHTML(date)}
                        </span>
                    </div>
                    ${moreButton}
                </article>
            `;
        }).join("");
}
function filterUpdates() {
    const searchInput =
        document.getElementById(
            "updateSearch"
        );
    const filter =
        document.getElementById(
            "updateFilter"
        );
    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();
    const selectedCategory =
        filter.value
            .trim()
            .toLowerCase();
    const filtered =
        allUpdates.filter(
            function (update) {
                const title =
                    String(
                        update.title || ""
                    ).toLowerCase();
                const description =
                    String(
                        update.description || ""
                    ).toLowerCase();
                const type =
                    String(
                        update.update_type || ""
                    ).toLowerCase();
                const matchesSearch =
                    searchText === "" ||
                    title.includes(searchText) ||
                    description.includes(searchText) ||
                    type.includes(searchText);
                const matchesCategory =
                    selectedCategory === "सर्व" ||
                    type.includes(
                        selectedCategory
                    );
                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );
    displayUpdates(filtered);
}
function escapeHTML(value) {
    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}
document.addEventListener(
    "DOMContentLoaded",
    function () {
        loadAllUpdates();
        const search =
            document.getElementById(
                "updateSearch"
            );
        const filter =
            document.getElementById(
                "updateFilter"
            );
        search.addEventListener(
            "input",
            filterUpdates
        );
        filter.addEventListener(
            "change",
            filterUpdates
        );
    }
);
