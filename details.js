const API_URL = "https://jansaarthi-backend-production-d805.up.railway.app/api/schemes";

const params = new URLSearchParams(window.location.search);
const schemeId = params.get("id");


// =====================================================
// LOAD SCHEME DETAILS
// =====================================================

async function loadSchemeDetails() {

    // =================================================
    // 1. URL मध्ये ?id= असेल तर त्यालाच PRIORITY
    // =================================================

    if (schemeId) {

        try {

            const response = await fetch(
                `${API_URL}/${encodeURIComponent(schemeId)}`
            );

            if (!response.ok) {
                throw new Error("Scheme not found");
            }

            const scheme = await response.json();

            console.log("Scheme Details:", scheme);

            displayScheme(scheme);

            return;

        } catch (error) {

            console.error(
                "DETAILS LOAD ERROR:",
                error
            );

            showError(
                "योजनेची माहिती लोड झाली नाही. Backend Server चालू आहे का ते तपासा."
            );

            return;
        }
    }


    // =================================================
    // 2. URL मध्ये id नसेल तर AI Recommended Scheme
    // =================================================

    const savedScheme =
        localStorage.getItem("selectedScheme");

    if (savedScheme) {

        try {

            const scheme =
                JSON.parse(savedScheme);

            console.log(
                "AI Recommended Scheme Details:",
                scheme
            );

            displayScheme(scheme);

            return;

        } catch (error) {

            console.error(
                "SAVED SCHEME PARSE ERROR:",
                error
            );

            localStorage.removeItem(
                "selectedScheme"
            );
        }
    }


    // =================================================
    // 3. काहीच scheme मिळाली नाही
    // =================================================

    showError(
        "योजना निवडलेली नाही."
    );
}


// =====================================================
// DISPLAY SCHEME
// =====================================================

function displayScheme(scheme) {

    const title =
        document.getElementById("schemeTitle");

    const category =
        document.getElementById("schemeCategory");

    const description =
        document.getElementById("schemeShortDescription");

    const about =
        document.getElementById("schemeAbout");

    const updated =
        document.getElementById("lastUpdated");


    // =================================================
    // BASIC DETAILS
    // =================================================

    if (title) {

        title.textContent =
            scheme.name ||
            "योजना";
    }


    if (category) {

        category.textContent =
            scheme.category ||
            "-";
    }


    if (description) {

        description.textContent =
            scheme.short_description ||
            scheme.description ||
            "या योजनेची माहिती उपलब्ध आहे.";
    }


    if (about) {

        about.textContent =
            scheme.about ||
            scheme.description ||
            "या योजनेबद्दल अधिक माहिती उपलब्ध नाही.";
    }


    // =================================================
    // LAST UPDATED
    // =================================================

    if (updated) {

        if (scheme.updated_at) {

            const date =
                new Date(scheme.updated_at);

            if (!isNaN(date.getTime())) {

                updated.textContent =
                    date.toLocaleDateString(
                        "mr-IN",
                        {
                            day: "2-digit",
                            month: "long",
                            year: "numeric"
                        }
                    );

            } else {

                updated.textContent =
                    "अद्यतन उपलब्ध नाही";
            }

        } else {

            updated.textContent =
                "अद्यतन उपलब्ध नाही";
        }
    }


    // =================================================
    // CATEGORY ICON
    // =================================================

    const icon =
        document.querySelector(
            ".scheme-header-icon"
        );

    if (icon) {

        icon.textContent =
            getCategoryIcon(
                scheme.category
            );
    }


    // =================================================
    // QUICK INFORMATION
    // =================================================

    const department =
        document.getElementById(
            "department"
        );

    const state =
        document.getElementById(
            "state"
        );

    const beneficiary =
        document.getElementById(
            "beneficiary"
        );

    const schemeType =
        document.getElementById(
            "schemeType"
        );


    if (department) {

        department.textContent =
            scheme.department ||
            "-";
    }


    if (state) {

        state.textContent =
            scheme.state ||
            "-";
    }


    if (beneficiary) {

        beneficiary.textContent =
            scheme.beneficiary ||
            "-";
    }


    if (schemeType) {

        schemeType.textContent =
            scheme.type ||
            "-";
    }


    // =================================================
    // BENEFITS
    // =================================================

    createList(
        "benefitsList",
        scheme.benefits ||
        scheme.benefitsSummary
    );


    // =================================================
    // ELIGIBILITY
    // =================================================

    createList(
        "eligibilityList",
        scheme.eligibility ||
        scheme.eligibilitySummary
    );


    // =================================================
    // DOCUMENTS
    // =================================================

    createList(
        "documentsList",
        scheme.documents
    );


    // =================================================
    // PROCESS
    // =================================================

    createProcessList(
        "processList",
        scheme.process
    );


    // =================================================
    // OFFICIAL WEBSITE
    // =================================================

    setupOfficialLink(
        scheme.official ||
        scheme.official_url ||
        scheme.officialUrl
    );
}


// =====================================================
// CREATE NORMAL LIST
// =====================================================

function createList(elementId, data) {

    const list =
        document.getElementById(elementId);

    if (!list) return;

    list.innerHTML = "";


    if (!data) {

        const li =
            document.createElement("li");

        li.textContent =
            "माहिती उपलब्ध नाही.";

        list.appendChild(li);

        return;
    }


    const items =
        convertToArray(data);


    if (items.length === 0) {

        const li =
            document.createElement("li");

        li.textContent =
            "माहिती उपलब्ध नाही.";

        list.appendChild(li);

        return;
    }


    items.forEach(function (item) {

        if (!item) return;

        const li =
            document.createElement("li");

        li.textContent =
            String(item).trim();

        list.appendChild(li);
    });
}


// =====================================================
// CREATE PROCESS LIST
// =====================================================

function createProcessList(elementId, data) {

    const container =
        document.getElementById(elementId);

    if (!container) return;

    container.innerHTML = "";


    if (!data) {

        container.innerHTML = `
            <div class="process-step">

                <div class="step-number">
                    1
                </div>

                <p>
                    माहिती उपलब्ध नाही.
                </p>

            </div>
        `;

        return;
    }


    const items =
        convertToArray(data);


    if (items.length === 0) {

        container.innerHTML = `
            <div class="process-step">

                <div class="step-number">
                    1
                </div>

                <p>
                    माहिती उपलब्ध नाही.
                </p>

            </div>
        `;

        return;
    }


    items.forEach(function (item, index) {

        if (!item) return;


        const div =
            document.createElement("div");

        div.className =
            "process-step";


        const number =
            document.createElement("div");

        number.className =
            "step-number";

        number.textContent =
            index + 1;


        const text =
            document.createElement("p");

        text.textContent =
            String(item).trim();


        div.appendChild(number);
        div.appendChild(text);

        container.appendChild(div);
    });
}


// =====================================================
// CONVERT DATA TO ARRAY
// =====================================================

function convertToArray(data) {

    if (Array.isArray(data)) {

        return data
            .map(function (item) {

                return String(item).trim();

            })
            .filter(function (item) {

                return item.length > 0;

            });
    }


    if (typeof data === "string") {

        return data
            .split(/\r?\n/)
            .map(function (item) {

                return item.trim();

            })
            .filter(function (item) {

                return item.length > 0;

            });
    }


    return [];
}


// =====================================================
// CATEGORY ICON
// =====================================================

function getCategoryIcon(category) {

    const icons = {

        "शेतकरी": "🌾",

        "विद्यार्थी": "🎓",

        "महिला": "👩",

        "रोजगार": "💼",

        "आरोग्य": "🏥",

        "गृहनिर्माण": "🏠",

        "व्यवसाय": "🏢",

        "सामाजिक": "🤝",

        "दिव्यांग": "♿",

        "ज्येष्ठ नागरिक": "👴"
    };


    return (
        icons[category] ||
        "📋"
    );
}


// =====================================================
// OFFICIAL LINK
// =====================================================

function setupOfficialLink(official) {

    const officialLink =
        document.getElementById(
            "officialLink"
        );

    if (!officialLink) return;


    // Existing click handlers काढण्यासाठी clone
    const newLink =
        officialLink.cloneNode(true);


    officialLink.parentNode.replaceChild(
        newLink,
        officialLink
    );


    if (
        official &&
        String(official).trim() !== "" &&
        String(official).trim() !== "#"
    ) {

        let url =
            String(official).trim();


        // URL मध्ये protocol नसेल तर https:// add
        if (
            !url.startsWith("http://") &&
            !url.startsWith("https://")
        ) {

            url =
                "https://" + url;
        }


        newLink.href =
            url;

        newLink.target =
            "_blank";

        newLink.rel =
            "noopener noreferrer";

        newLink.textContent =
            "अधिकृत वेबसाइट →";


    } else {

        newLink.href =
            "#";

        newLink.textContent =
            "अधिकृत वेबसाइट →";


        newLink.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                alert(
                    "या योजनेसाठी अधिकृत लिंक उपलब्ध नाही."
                );
            }
        );
    }
}


// =====================================================
// ERROR
// =====================================================

function showError(message) {

    const title =
        document.getElementById(
            "schemeTitle"
        );

    if (title) {

        title.textContent =
            "माहिती उपलब्ध नाही";
    }


    const description =
        document.getElementById(
            "schemeShortDescription"
        );

    if (description) {

        description.textContent =
            message;
    }
}


// =====================================================
// MOBILE MENU
// =====================================================

function toggleDetailsMenu() {

    const nav =
        document.getElementById(
            "navMenu"
        );

    if (nav) {

        nav.classList.toggle(
            "show"
        );
    }
}


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadSchemeDetails();


        const links =
            document.querySelectorAll(
                "#navMenu a"
            );


        links.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        const nav =
                            document.getElementById(
                                "navMenu"
                            );

                        if (nav) {

                            nav.classList.remove(
                                "show"
                            );
                        }
                    }
                );
            }
        );
    }
);