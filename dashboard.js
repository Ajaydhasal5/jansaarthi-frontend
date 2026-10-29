
const API_BASE_URL = "https://jansaarthi-backend-production-d805.up.railway.app";
const API_URL = `${API_BASE_URL}/api/schemes`;

let user = null;

window.allSchemes = [];
window.aiRecommendedSchemes = [];
window.selectedLifeEvent = "";
window.selectedComparisonSchemes = [];

function escapeHtml(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function setText(id, value) {
    const el = document.getElementById(id);

    if (el) {
        el.textContent =
            value !== undefined &&
            value !== null &&
            value !== ""
                ? value
                : "माहिती उपलब्ध नाही";
    }
}

function showElement(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "";
}

function hideElement(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
}

function safeUrl(url) {
    if (!url) return null;

    try {
        const parsed = new URL(url);

        if (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:"
        ) {
            return parsed.href;
        }
    } catch (error) {
        return null;
    }

    return null;
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);

    const text = await response.text();

    let data = {};

    try {
        data = text ? JSON.parse(text) : {};
    } catch (error) {
        console.error(
            "NON JSON SERVER RESPONSE:",
            text
        );

        throw new Error(
            `Server response JSON format मध्ये नाही. Status: ${response.status}`
        );
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `Server error: ${response.status}`
        );
    }

    return data;
}

/* =========================================================
   LOGIN / USER
   ========================================================= */

function loadLoggedInUser() {
    const savedUser =
        localStorage.getItem("jansaarthiUser");

    if (!savedUser) {
        window.location.href = "login.html";
        return false;
    }

    try {
        user = JSON.parse(savedUser);

        if (
            !user ||
            typeof user !== "object"
        ) {
            throw new Error("Invalid user");
        }

        return true;

    } catch (error) {
        console.error(
            "User parse error:",
            error
        );

        localStorage.removeItem(
            "jansaarthiUser"
        );

        window.location.href =
            "login.html";

        return false;
    }
}

/* =========================================================
   PROFILE
   ========================================================= */

function getProfilePayload() {
    return {
        name:
            user?.name || "",

        mobile:
            user?.mobile || "",

        age:
            user?.age || "",

        gender:
            user?.gender || "",

        state:
            user?.state || "",

        district:
            user?.district || "",

        area_type:
            user?.area_type ||
            user?.areaType ||
            "",

        caste:
            user?.caste ||
            user?.category ||
            "",

        category:
            user?.category ||
            user?.caste ||
            "",

        occupation:
            user?.occupation || "",

        income:
            user?.income || ""
    };
}

function displayUserData() {
    if (!user) return;

    const name =
        user.name ||
        user.full_name ||
        user.username ||
        "आपले स्वागत आहे!";

    setText(
        "headerUserName",
        name
    );

    setText(
        "welcomeUserName",
        name
    );

    setText(
        "profileName",
        user.name
    );

    setText(
        "profileMobile",
        user.mobile
    );

    setText(
        "profileAge",
        user.age
    );

    setText(
        "profileGender",
        user.gender
    );

    setText(
        "profileState",
        user.state
    );

    setText(
        "profileDistrict",
        user.district
    );

    setText(
        "profileAreaType",
        user.area_type ||
        user.areaType
    );

    setText(
        "profileCaste",
        user.caste ||
        user.category
    );

    setText(
        "profileOccupation",
        user.occupation
    );

    setText(
        "profileIncome",
        user.income
    );
}

function scrollToProfile() {
    scrollToFeatureSection("profileSection");
}

/* =========================================================
   LOAD ALL SCHEMES
   Used ONLY for Comparison.
   AI Recommendation मध्ये allSchemes fallback नाही.
   ========================================================= */

async function loadSchemes() {
    try {
        const data =
            await fetchJson(API_URL);

        if (Array.isArray(data)) {
            window.allSchemes = data;

        } else if (
            Array.isArray(data.schemes)
        ) {
            window.allSchemes =
                data.schemes;

        } else if (
            Array.isArray(data.data)
        ) {
            window.allSchemes =
                data.data;

        } else {
            window.allSchemes = [];
        }

        console.log(
            "JanSaarthi schemes loaded:",
            window.allSchemes.length
        );

        return window.allSchemes;

    } catch (error) {
        console.error(
            "Scheme loading error:",
            error
        );

        window.allSchemes = [];

        return [];
    }
}

/* =========================================================
   AI RECOMMENDATION RESPONSE NORMALIZER
   ========================================================= */

/*
   Backend / AI response वेगवेगळ्या format मध्ये आली
   तरी recommendations शोधण्यासाठी हा helper आहे.

   IMPORTANT:
   allSchemes इथे कधीही वापरले जात नाही.
*/

function extractRecommendations(data) {
    if (!data) return [];

    const possibleArrays = [
        data.recommendations,
        data.schemes,
        data.recommendedSchemes,
        data.recommended_schemes,
        data.results,

        data.data?.recommendations,
        data.data?.schemes,
        data.data?.recommendedSchemes,
        data.data?.recommended_schemes,
        data.data?.results,

        data.result?.recommendations,
        data.result?.schemes,
        data.result?.recommendedSchemes,
        data.result?.recommended_schemes,
        data.result?.results,

        data.data?.result?.recommendations,
        data.data?.result?.schemes,
        data.data?.result?.recommendedSchemes,
        data.data?.result?.recommended_schemes,

        data.analysis?.recommendations,
        data.analysis?.schemes
    ];

    for (const item of possibleArrays) {
        if (Array.isArray(item)) {
            return item.filter(
                scheme =>
                    scheme &&
                    typeof scheme === "object"
            );
        }
    }

    return [];
}

/* =========================================================
   AI ANALYSIS TEXT
   ========================================================= */

function extractAnalysis(data) {
    if (!data) {
        return "AI प्रोफाइल विश्लेषण पूर्ण झाले.";
    }

    const analysis =
        data.analysis ||
        data.profileAnalysis ||
        data.analysisText ||

        data.data?.analysis ||
        data.data?.profileAnalysis ||
        data.data?.analysisText ||

        data.result?.analysis ||
        data.result?.profileAnalysis ||

        "";

    if (
        typeof analysis === "string" &&
        analysis.trim()
    ) {
        return analysis;
    }

    return "AI प्रोफाइल विश्लेषण पूर्ण झाले.";
}

/* =========================================================
   SCHEME HELPERS
   ========================================================= */

function getSchemeName(scheme) {
    return (
        scheme?.name ||
        scheme?.scheme_name ||
        scheme?.schemeName ||
        scheme?.title ||
        "योजनेचे नाव उपलब्ध नाही"
    );
}

function getSchemeDescription(scheme) {
    return (
        scheme?.description ||
        scheme?.short_description ||
        scheme?.shortDescription ||
        scheme?.details ||
        scheme?.summary ||
        scheme?.about ||
        scheme?.reason ||
        "या योजनेची अधिक माहिती उपलब्ध आहे."
    );
}

function getMatchPercentage(scheme) {
    const value =
        scheme?.matchPercentage ??
        scheme?.match_percentage ??
        scheme?.matchPercent ??
        scheme?.match_percent ??
        scheme?.match ??
        scheme?.percentage ??
        scheme?.matchScore ??
        scheme?.match_score ??
        "";

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }

    const number =
        Number(
            String(value)
                .replace("%", "")
                .trim()
        );

    if (!Number.isNaN(number)) {
        return Math.max(
            0,
            Math.min(
                100,
                Math.round(number * 100) / 100
            )
        );
    }

    return String(value);
}

function getSchemeId(scheme, index = 0) {
    return (
        scheme?.id ??
        scheme?.scheme_id ??
        scheme?.schemeId ??
        scheme?._id ??
        scheme?.uuid ??
        index
    );
}

/*
   Scheme ID ने scheme शोधताना:
   आधी AI recommendations मध्ये शोधतो.
   नंतर allSchemes मध्ये.
*/

function findSchemeById(
    id,
    preferredList = []
) {
    const lists = [
        Array.isArray(preferredList)
            ? preferredList
            : [],

        Array.isArray(window.aiRecommendedSchemes)
            ? window.aiRecommendedSchemes
            : [],

        Array.isArray(window.allSchemes)
            ? window.allSchemes
            : []
    ];

    for (const list of lists) {
        const found = list.find(
            scheme => {
                const schemeId =
                    getSchemeId(scheme);

                return (
                    String(schemeId) ===
                    String(id)
                );
            }
        );

        if (found) return found;
    }

    return null;
}

function getSchemeField(
    scheme,
    fields
) {
    if (!scheme) return "";

    for (const field of fields) {
        const value = scheme[field];

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            return value;
        }
    }

    return "";
}

function formatSchemeValue(value) {
    if (value === null || value === undefined) {
        return "";
    }

    if (Array.isArray(value)) {
        return value.join(", ");
    }

    if (typeof value === "object") {
        try {
            return JSON.stringify(value);
        } catch (error) {
            return "";
        }
    }

    return String(value);
}

/* =========================================================
   AI PROFILE ANALYSIS
   ========================================================= */

async function analyzeProfile() {

    scrollToFeatureSection("profileAnalysisSection");

    const section =
        document.getElementById("profileAnalysisSection");

    const result =
        document.getElementById("profileAnalysisResult");

    if (!section || !result) {

        alert(
            "AI Profile Analysis HTML सापडला नाही."
        );

        return;
    }

    section.style.display = "block";

    result.innerHTML = `
        <div class="loading-box">
            🧠 AI तुमचे प्रोफाइल विश्लेषण करत आहे...
        </div>
    `;

    try {

        const profile =
            getProfilePayload();

        const data =
            await fetchJson(
                `${API_BASE_URL}/api/ai/recommendations`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(profile)
                }
            );

        /* =========================================
           AI RECOMMENDATIONS
           ========================================= */

        const recommendations =
            extractRecommendations(data);

        window.aiRecommendedSchemes =
            recommendations;


        /* =========================================
           AI PROFILE ANALYSIS
           ========================================= */

        const profileAnalysis =
            data?.profileAnalysis || {};

        const summary =
            profileAnalysis.summary ||
            "तुमच्या प्रोफाइलचे उपलब्ध माहितीनुसार विश्लेषण करण्यात आले आहे.";

        const strengths =
            Array.isArray(
                profileAnalysis.strengths
            )
                ? profileAnalysis.strengths
                : [];

        const importantFactors =
            Array.isArray(
                profileAnalysis.importantFactors
            )
                ? profileAnalysis.importantFactors
                : [];


        /* =========================================
           IMPORTANT FACTORS FALLBACK
           ========================================= */

        const finalImportantFactors =
            importantFactors.length > 0
                ? importantFactors
                : [

                    `occupation: ${
                        profile.occupation || "-"
                    }`,

                    `state: ${
                        profile.state || "-"
                    }`,

                    `income: ${
                        profile.income || "-"
                    }`,

                    `category: ${
                        profile.category || "-"
                    }`

                ];


        /* =========================================
           PROFILE ANALYSIS HTML
           ========================================= */

        result.innerHTML = `

            <div class="ai-analysis-box">

                <h3>
                    🧠 AI प्रोफाइल विश्लेषण
                </h3>


                <!-- PROFILE INFORMATION -->

                <div class="profile-summary">

                    <p>
                        <strong>नाव:</strong>
                        ${escapeHtml(
                            profile.name || "User"
                        )}
                    </p>

                    <p>
                        <strong>वय:</strong>
                        ${escapeHtml(
                            String(
                                profile.age || "-"
                            )
                        )}
                    </p>

                    <p>
                        <strong>व्यवसाय:</strong>
                        ${escapeHtml(
                            profile.occupation || "-"
                        )}
                    </p>

                    <p>
                        <strong>उत्पन्न:</strong>
                        ${escapeHtml(
                            profile.income || "-"
                        )}
                    </p>

                    <p>
                        <strong>प्रवर्ग:</strong>
                        ${escapeHtml(
                            profile.category || "-"
                        )}
                    </p>

                    <p>
                        <strong>राज्य:</strong>
                        ${escapeHtml(
                            profile.state || "-"
                        )}
                    </p>

                    <p>
                        <strong>जिल्हा:</strong>
                        ${escapeHtml(
                            profile.district || "-"
                        )}
                    </p>

                </div>


                <!-- AI ANALYSIS -->

                <div class="ai-analysis-section">

                    <h4>
                        🔍 AI Analysis
                    </h4>

                    <p>
                        ${escapeHtml(
                            summary
                        )}
                    </p>

                </div>


                <!-- USEFUL FACTORS -->

                <div class="ai-analysis-section">

                    <h4>
                        💡 तुमच्या प्रोफाइलचे उपयोगी घटक
                    </h4>

                    ${
                        strengths.length > 0

                            ? `

                                <ul>

                                    ${
                                        strengths
                                            .map(
                                                item => `
                                                    <li>
                                                        ${escapeHtml(
                                                            String(item)
                                                        )}
                                                    </li>
                                                `
                                            )
                                            .join("")
                                    }

                                </ul>

                              `

                            : `

                                <p>
                                    तुमच्या प्रोफाइलमधील उपलब्ध
                                    माहितीच्या आधारे संबंधित
                                    सरकारी योजनांची पात्रता
                                    तपासली जात आहे.
                                </p>

                              `
                    }

                </div>


                <!-- IMPORTANT FACTORS -->

                <div class="ai-analysis-section">

                    <h4>
                        📌 महत्त्वाचे घटक
                    </h4>

                    <div class="important-factors">

                        ${
                            finalImportantFactors
                                .map(
                                    item => `
                                        <div class="important-factor">

                                            ${escapeHtml(
                                                String(item)
                                            )}

                                        </div>
                                    `
                                )
                                .join("")
                        }

                    </div>

                </div>


                <!-- RECOMMENDATION COUNT -->

                <div class="analysis-summary">

                    <strong>

                        🎯

                        ${
                            window
                                .aiRecommendedSchemes
                                .length
                        }

                        योजना तुमच्या प्रोफाइलशी
                        संबंधित आढळल्या.

                    </strong>

                </div>


                <!-- DISCLAIMER -->

                <div class="ai-disclaimer">

                    ⚠️ AI द्वारे दिलेली माहिती
                    मार्गदर्शनासाठी आहे.
                    अंतिम पात्रता संबंधित
                    सरकारी विभागाच्या नियमांनुसार
                    तपासावी.

                </div>

            </div>

        `;


        /* =========================================
           RECOMMENDED SCHEMES
           ========================================= */

        const recommendationContainer =
            document.getElementById(
                "recommendedSchemes"
            );

        if (
            recommendationContainer
        ) {

            renderRecommendedSchemes();

        }

    }

    catch (error) {

        console.error(
            "AI Profile Analysis:",
            error
        );

        result.innerHTML = `

            <div class="error-box">

                ❌ AI Profile Analysis
                सध्या उपलब्ध नाही.

                <br><br>

                ${escapeHtml(
                    error.message
                )}

            </div>

        `;

    }

}


/* =========================================================
   AI RECOMMENDED SCHEMES
   ========================================================= */

async function getRecommendedSchemes() {

     scrollToFeatureSection("recommendedSection");
    const section =
        document.getElementById(
            "recommendedSection"
        );

    const container =
        document.getElementById(
            "recommendedSchemes"
        );

    if (
        !section ||
        !container
    ) {

        alert(
            "Recommended Schemes HTML सापडला नाही."
        );

        return;
    }

    section.style.display = "block";

    container.innerHTML = `

        <div class="loading-box">

            🎯 तुमच्यासाठी योग्य योजना
            शोधत आहे...

        </div>

    `;


    try {

        const data =
            await fetchJson(
                `${API_BASE_URL}/api/ai/recommendations`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            getProfilePayload()
                        )
                }
            );


        const recommendations =
            extractRecommendations(data);


        /*
         * IMPORTANT
         *
         * फक्त AI ने दिलेल्या
         * recommendations वापरायच्या.
         *
         * allSchemes fallback नाही.
         */

        window.aiRecommendedSchemes =
            recommendations;


        renderRecommendedSchemes();

    }

    catch (error) {

        console.error(
            "Recommendation error:",
            error
        );

        container.innerHTML = `

            <div class="error-box">

                ❌ योजना मिळवताना
                समस्या आली.

                <br><br>

                ${escapeHtml(
                    error.message
                )}

            </div>

        `;

    }

}


/* =========================================================
   RENDER AI RECOMMENDED SCHEMES
   ========================================================= */

function renderRecommendedSchemes() {

    const container =
        document.getElementById(
            "recommendedSchemes"
        );

    if (!container) return;


    const schemes =
        Array.isArray(
            window.aiRecommendedSchemes
        )
            ? window.aiRecommendedSchemes
            : [];


    /* =========================================
       NO SCHEMES
       ========================================= */

    if (
        schemes.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-box">

                सध्या तुमच्या प्रोफाइलसाठी
                कोणतीही योग्य योजना सापडली नाही.

            </div>

        `;

        return;
    }


    /* =========================================
       SCHEME CARDS
       ========================================= */

    container.innerHTML =
        schemes
            .map(
                (scheme, index) => {

                    const id =
                        getSchemeId(
                            scheme,
                            index
                        );


                    const name =
                        getSchemeName(
                            scheme
                        );


                    const description =
                        getSchemeDescription(
                            scheme
                        );


                    const match =
                        getMatchPercentage(
                            scheme
                        );


                    const benefits =
                        formatSchemeValue(
                            getSchemeField(
                                scheme,
                                [
                                    "benefits",
                                    "benefit",
                                    "advantages",
                                    "scheme_benefits",
                                    "benefitsSummary"
                                ]
                            )
                        );


                    const eligibility =
                        formatSchemeValue(
                            getSchemeField(
                                scheme,
                                [
                                    "eligibility",
                                    "eligibility_criteria",
                                    "criteria",
                                    "eligibilitySummary"
                                ]
                            )
                        );


                    const matchReason =
                        formatSchemeValue(
                            getSchemeField(
                                scheme,
                                [
                                    "matchReason",
                                    "match_reason",
                                    "reason"
                                ]
                            )
                        );


                    return `

                        <div class="scheme-card">


                            <div
                                class="scheme-card-header"
                            >

                                <h3>

                                    ${escapeHtml(
                                        name
                                    )}

                                </h3>


                                ${
                                    match !== ""

                                        ? `

                                            <div
                                                class="match-badge"
                                            >

                                                🎯
                                                ${escapeHtml(
                                                    match
                                                )}%
                                                Match

                                            </div>

                                          `

                                        : ""
                                }

                            </div>


                            ${
                                description

                                    ? `

                                        <p>

                                            ${escapeHtml(
                                                description
                                            )}

                                        </p>

                                      `

                                    : ""
                            }


                            ${
                                matchReason

                                    ? `

                                        <div
                                            class="scheme-mini-info"
                                        >

                                            <strong>
                                                🤖 तुमच्यासाठी का योग्य?
                                            </strong>

                                            <br>

                                            ${escapeHtml(
                                                matchReason
                                            )}

                                        </div>

                                      `

                                    : ""
                            }


                            ${
                                benefits

                                    ? `

                                        <div
                                            class="scheme-mini-info"
                                        >

                                            <strong>
                                                💰 फायदे:
                                            </strong>

                                            ${escapeHtml(
                                                benefits
                                            )}

                                        </div>

                                      `

                                    : ""
                            }


                            ${
                                eligibility

                                    ? `

                                        <div
                                            class="scheme-mini-info"
                                        >

                                            <strong>
                                                👤 संभाव्य पात्रता:
                                            </strong>

                                            ${escapeHtml(
                                                eligibility
                                            )}

                                        </div>

                                      `

                                    : ""
                            }
<button
    type="button"
    class="recommended-more-btn"
    onclick="openRecommendedScheme(${index})"
>
    <span>अधिक माहिती</span>
    <span class="more-arrow">→</span>
</button>

                        </div>

                    `;

                }
            )
            .join("");

}
/* =========================================================
   RECOMMENDED SCHEME DETAILS
   ========================================================= */

function openRecommendedScheme(index) {
    const schemes =
        window.aiRecommendedSchemes || [];

    // Button recommendation array चा index पाठवतो.
    // आधी ID शोधल्यास index एखाद्या दुसऱ्या योजनेच्या ID शी जुळू शकतो.
    const numericIndex = Number(index);
    let scheme =
        Number.isInteger(numericIndex) &&
        numericIndex >= 0 &&
        numericIndex < schemes.length
            ? schemes[numericIndex]
            : null;

    // जुन्या callers कडून ID आल्यास fallback.
    if (!scheme) {
        scheme = findSchemeById(index, schemes);
    }

    if (!scheme) {
        alert(
            "योजनेची माहिती सापडली नाही."
        );

        return;
    }
    localStorage.setItem(
    "selectedScheme",
    JSON.stringify(scheme)
);

const schemeId =
    scheme.id ??
    scheme.scheme_id ??
    scheme.schemeId ??
    scheme._id ??
    scheme.uuid;

if (schemeId === undefined || schemeId === null || schemeId === "") {
    alert("या शिफारस केलेल्या योजनेचा ID उपलब्ध नाही.");
    return;
}

window.location.href =
    "scheme-details.html?id=" +
    encodeURIComponent(schemeId);
return;

    const name =
        getSchemeName(
            scheme
        );

    const description =
        getSchemeDescription(
            scheme
        );

    const match =
        getMatchPercentage(
            scheme
        );

    const benefits =
        formatSchemeValue(
            getSchemeField(
                scheme,
                [
                                    "benefits",
                                    "benefit",
                                    "advantages",
                                    "scheme_benefits",
                                    "benefitsSummary"
                ]
            )
        );

    const eligibility =
        formatSchemeValue(
            getSchemeField(
                scheme,
               [
    "eligibility",
    "eligibility_criteria",
    "criteria",
    "eligibilitySummary"
]
            )
        );

    const documents =
        formatSchemeValue(
            getSchemeField(
                scheme,
                [
                    "documents",
                    "required_documents",
                    "requiredDocuments",
                    "document"
                ]
            )
        );

    const process =
        formatSchemeValue(
            getSchemeField(
                scheme,
                [
                    "process",
                    "application_process",
                    "applicationProcess",
                    "how_to_apply"
                ]
            )
        );

    const department =
        formatSchemeValue(
            getSchemeField(
                scheme,
                [
                    "department",
                    "ministry",
                    "department_name"
                ]
            )
        );

    const beneficiary =
        formatSchemeValue(
            getSchemeField(
                scheme,
                [
                    "beneficiary",
                    "beneficiaries",
                    "target_group"
                ]
            )
        );

    const category =
        formatSchemeValue(
            getSchemeField(
                scheme,
                [
                    "category",
                    "scheme_category"
                ]
            )
        );

    const amount =
        formatSchemeValue(
            getSchemeField(
                scheme,
                [
                    "amount",
                    "benefit_amount",
                    "financial_benefit"
                ]
            )
        );

    const officialUrl =
        safeUrl(
            getSchemeField(
                scheme,
                [
                    "official_url",
                    "official",
                    "officialUrl",
                    "application_link",
                    "applicationLink",
                    "apply_link",
                    "applyLink",
                    "url"
                ]
            )
        );

    /*
       Existing modal असल्यास वापरा.
    */

    const existingModal =
        document.getElementById(
            "schemeDetailsModal"
        );

    if (existingModal) {
        const content =
            existingModal.querySelector(
                ".scheme-details-content"
            );

        if (content) {
            content.innerHTML = `

                <h2>
                    ${escapeHtml(name)}
                </h2>

                ${
                    match !== ""
                        ? `
                        <div
                            class="match-badge"
                        >
                            🎯
                            ${escapeHtml(
                                match
                            )}%
                            Match
                        </div>
                        `
                        : ""
                }

                <p>
                    ${escapeHtml(
                        description
                    )}
                </p>

                ${
                    category
                        ? `
                        <p>
                            <strong>
                                📂 प्रकार:
                            </strong>
                            ${escapeHtml(
                                category
                            )}
                        </p>
                        `
                        : ""
                }

                ${
                    department
                        ? `
                        <p>
                            <strong>
                                🏛️ विभाग:
                            </strong>
                            ${escapeHtml(
                                department
                            )}
                        </p>
                        `
                        : ""
                }

                ${
                    beneficiary
                        ? `
                        <p>
                            <strong>
                                👥 लाभार्थी:
                            </strong>
                            ${escapeHtml(
                                beneficiary
                            )}
                        </p>
                        `
                        : ""
                }

                ${
                    amount
                        ? `
                        <p>
                            <strong>
                                💰 लाभाची रक्कम:
                            </strong>
                            ${escapeHtml(
                                amount
                            )}
                        </p>
                        `
                        : ""
                }

                ${
                    benefits
                        ? `
                        <p>
                            <strong>
                                💰 फायदे:
                            </strong>
                            ${escapeHtml(
                                benefits
                            )}
                        </p>
                        `
                        : ""
                }

                ${
                    eligibility
                        ? `
                        <p>
                            <strong>
                                👤 पात्रता:
                            </strong>
                            ${escapeHtml(
                                eligibility
                            )}
                        </p>
                        `
                        : ""
                }

                ${
                    documents
                        ? `
                        <p>
                            <strong>
                                📄 आवश्यक कागदपत्रे:
                            </strong>
                            ${escapeHtml(
                                documents
                            )}
                        </p>
                        `
                        : ""
                }

                ${
                    process
                        ? `
                        <p>
                            <strong>
                                📝 अर्ज प्रक्रिया:
                            </strong>
                            ${escapeHtml(
                                process
                            )}
                        </p>
                        `
                        : ""
                }

                ${
                    officialUrl
                        ? `
                        <p>
                            <strong>
                                🌐 अर्ज / अधिकृत संकेतस्थळ:
                            </strong>
                        </p>

                        <a
                            href="${escapeHtml(
                                officialUrl
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            अधिकृत सरकारी संकेतस्थळ →
                        </a>
                        `
                        : ""
                }

            `;
        }

        existingModal.style.display =
            "flex";

        return;
    }

    /*
       Modal नसेल तर readable alert.
    */

    let message =
        `${name}\n\n`;

    if (match !== "") {
        message +=
            `🎯 Match: ${match}%\n\n`;
    }

    message +=
        `${description}\n\n`;

    if (category) {
        message +=
            `📂 प्रकार: ${category}\n\n`;
    }

    if (department) {
        message +=
            `🏛️ विभाग: ${department}\n\n`;
    }

    if (beneficiary) {
        message +=
            `👥 लाभार्थी: ${beneficiary}\n\n`;
    }

    if (amount) {
        message +=
            `💰 लाभाची रक्कम: ${amount}\n\n`;
    }

    if (benefits) {
        message +=
            `💰 फायदे:\n${benefits}\n\n`;
    }

    if (eligibility) {
        message +=
            `👤 पात्रता:\n${eligibility}\n\n`;
    }

    if (documents) {
        message +=
            `📄 कागदपत्रे:\n${documents}\n\n`;
    }

    if (process) {
        message +=
            `📝 प्रक्रिया:\n${process}\n\n`;
    }

    if (officialUrl) {
        message +=
            `🌐 Official Website:\n${officialUrl}`;
    }

    alert(message);
}

// ==========================================
// SCHEME COMPARISON
// ONLY AI RECOMMENDED SCHEMES
// ==========================================

let selectedComparisonSchemes = [];


// ==========================================
// OPEN COMPARISON
// ==========================================

function openSchemeComparison() {

    scrollToFeatureSection("comparisonSection");

    const section = document.getElementById("comparisonSection");
    const content = document.getElementById("comparisonContent");

    if (!section || !content) {
        console.error("Comparison section not found");
        return;
    }

    const schemes = Array.isArray(window.aiRecommendedSchemes)
        ? window.aiRecommendedSchemes
        : [];

    if (schemes.length < 2) {

        section.style.display = "block";

        content.innerHTML = `
            <h3>⚖️ योजना तुलना</h3>

            <p>
                तुलना करण्यासाठी आधी किमान 2 AI Recommended
                Schemes शोधा.
            </p>
        `;

        section.scrollIntoView({
            behavior: "smooth"
        });

        return;
    }

    selectedComparisonSchemes = [];

    section.style.display = "block";

    renderComparisonPicker();

    section.scrollIntoView({
        behavior: "smooth"
    });
}


// ==========================================
// SHOW AI RECOMMENDED SCHEMES
// ==========================================

function renderComparisonPicker() {

    const content = document.getElementById("comparisonContent");

    if (!content) return;

    const schemes = window.aiRecommendedSchemes || [];

    content.innerHTML = `

        <h3>⚖️ दोन योजना निवडा</h3>

        <p>
            फक्त AI Recommended Schemes मधून 2 योजना निवडा.
        </p>

        <div class="comparison-options">

            ${schemes.map((scheme, index) => {

                const selected =
                    selectedComparisonSchemes.some(
                        s => String(s.id) === String(scheme.id)
                    );

                return `
                    <button
                        type="button"
                        class="comparison-option-btn ${selected ? "selected" : ""}"
                        onclick="selectSchemeForComparison(${index})"
                    >
                        ${selected ? "✓" : "⚖️"}
                        ${escapeComparisonHTML(scheme.name || "योजना")}
                        — ${scheme.matchScore || 0}%
                    </button>
                `;

            }).join("")}

        </div>

        <div style="margin-top:20px;">
            <strong>
                ${selectedComparisonSchemes.length} / 2 योजना निवडल्या
            </strong>
        </div>

        ${
            selectedComparisonSchemes.length === 2
                ? `
                    <button
                        type="button"
                        class="feature-btn"
                        onclick="compareSelectedSchemes()"
                        style="margin-top:15px;"
                    >
                        🤖 AI तुलना करा
                    </button>
                `
                : ""
        }

    `;
}


// ==========================================
// SELECT SCHEME
// ==========================================

function selectSchemeForComparison(index) {

    const schemes = window.aiRecommendedSchemes || [];
    const scheme = schemes[index];

    if (!scheme) return;

    const existing =
        selectedComparisonSchemes.findIndex(
            s => String(s.id) === String(scheme.id)
        );

    if (existing !== -1) {

        selectedComparisonSchemes.splice(existing, 1);

        renderComparisonPicker();

        return;
    }

    if (selectedComparisonSchemes.length >= 2) {

        alert("फक्त 2 योजना निवडा.");

        return;
    }

    selectedComparisonSchemes.push(scheme);

    renderComparisonPicker();
}


// ==========================================
// AI COMPARISON API
// ==========================================

async function compareSelectedSchemes() {

    if (selectedComparisonSchemes.length !== 2) {

        alert("कृपया नेमक्या 2 योजना निवडा.");

        return;
    }

    const content =
        document.getElementById("comparisonContent");

    if (!content) return;

    content.innerHTML = `
        <div class="comparison-loading">
            🤖 AI योजनांची तुलना करत आहे...
            <br>
            <small>कृपया थोडा वेळ थांबा.</small>
        </div>
    `;

    try {

        const savedUser =
            localStorage.getItem("jansaarthiUser");

        const currentUser =
            savedUser
                ? JSON.parse(savedUser)
                : {};

        const response = await fetch(
            "https://jansaarthi-backend-production-d805.up.railway.app/api/ai/compare-schemes",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },
body: JSON.stringify({
    schemes: selectedComparisonSchemes.map(scheme => ({
        id: scheme.id,
        name: scheme.name,
        category: scheme.category,
        department: scheme.department,
        state: scheme.state,
        beneficiary: scheme.beneficiary,
        type: scheme.type,
        short_description: scheme.short_description || scheme.description || "",
        about: scheme.about || "",
        benefits: scheme.benefits || "",
        eligibility: scheme.eligibility || scheme.eligibilitySummary || "",
        documents: scheme.documents || "",
        process: scheme.process || scheme.applicationProcess || "",
        official: scheme.official || ""
    })),
    user: currentUser
})
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                data.message ||
                "AI comparison failed"
            );
        }

        renderAIComparisonResult(data);

    } catch (error) {

        console.error(
            "Scheme Comparison Error:",
            error
        );

        content.innerHTML = `
            <div class="comparison-error">

                ❌ AI comparison करण्यात अडचण आली.

                <br><br>

                कृपया पुन्हा प्रयत्न करा. काही वेळानेही अडचण राहिल्यास मदत केंद्राशी संपर्क साधा.

                <br><br>

                <button
                    type="button"
                    class="feature-btn"
                    onclick="openSchemeComparison()"
                >
                    🔄 पुन्हा प्रयत्न करा
                </button>

            </div>
        `;
    }
}


// ==========================================
// RENDER RESULT
// ==========================================
function renderAIComparisonResult(data) {

    const content =
        document.getElementById("comparisonContent");

    if (!content) return;

    const comparison =
        Array.isArray(data.comparison)
            ? data.comparison
            : [];

    let html = `
        <div class="ai-comparison-result">

            <h3>⚖️ AI Scheme Comparison</h3>

            <div class="comparison-table-wrapper">

                <table class="ai-comparison-table">

                    <thead>
                        <tr>
                            <th>योजना</th>
                            <th>AI Match</th>
                            <th>संभाव्य पात्रता</th>
                            <th>User Relevance</th>
                        </tr>
                    </thead>

                    <tbody>
    `;

    comparison.forEach(scheme => {

        html += `
            <tr>

                <td>
                    <strong>
                        ${escapeComparisonHTML(
                            scheme.name ||
                            "माहिती उपलब्ध नाही"
                        )}
                    </strong>
                </td>

                <td>
                    ${scheme.matchScore ?? "-"}%
                </td>

                <td>
                    ${escapeComparisonHTML(
                        scheme.eligibility ||
                        scheme.eligibilitySummary ||
                        "माहिती उपलब्ध नाही"
                    )}
                </td>

                <td>
                    ${escapeComparisonHTML(
                        scheme.userRelevance ||
                        scheme.relevance ||
                        scheme.matchReason ||
                        "माहिती उपलब्ध नाही"
                    )}
                </td>

            </tr>
        `;

    });

    html += `
                    </tbody>

                </table>

            </div>
    `;


    // AI Recommendation

    if (data.bestScheme) {

        html += `
            <div class="best-scheme-card">

                <h3>🏆 AI Recommendation</h3>

                <strong>
                    ${escapeComparisonHTML(
                        data.bestScheme.name ||
                        "सर्वात योग्य योजना"
                    )}
                </strong>

                <p>
                    ${escapeComparisonHTML(
                        data.bestScheme.reason ||
                        ""
                    )}
                </p>

            </div>
        `;
    }


    // Overall Analysis

    if (data.overallAnalysis) {

        html += `
            <div class="overall-analysis">

                <h3>📊 AI Overall Analysis</h3>

                <p>
                    ${escapeComparisonHTML(
                        data.overallAnalysis
                    )}
                </p>

            </div>
        `;
    }


    // Disclaimer

    html += `
        <div class="comparison-note">

            ⚠️ अंतिम पात्रता संबंधित विभागाच्या
            नियमांनुसार तपासली जाईल.

        </div>

        <button
            type="button"
            class="feature-btn"
            onclick="openSchemeComparison()"
            style="margin-top:20px;"
        >
            🔄 पुन्हा योजना निवडा
        </button>

        </div>
    `;

    content.innerHTML = html;

    content.scrollIntoView({
        behavior: "smooth"
    });
}

// ==========================================
// HTML ESCAPE
// ==========================================

function escapeComparisonHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   AI RECOMMENDED SCHEMES ONLY
   Used by Document Checker / Benefit Optimizer
   ========================================================= */

async function ensureAIRecommendations() {

    if (
        Array.isArray(
            window.aiRecommendedSchemes
        ) &&
        window.aiRecommendedSchemes.length
    ) {
        return window.aiRecommendedSchemes;
    }

    try {
        const data =
            await fetchJson(
                `${API_BASE_URL}/api/ai/recommendations`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            getProfilePayload()
                        )
                }
            );

        const recommendations =
            extractRecommendations(data);

        window.aiRecommendedSchemes =
            recommendations;

        return recommendations;

    } catch (error) {
        console.error(
            "AI Recommendation loading:",
            error
        );

        window.aiRecommendedSchemes = [];

        return [];
    }
}

/* =========================================================
   DOCUMENT CHECKER
   ========================================================= */

async function openDocumentChecker() {

    scrollToFeatureSection("documentCheckerSection");

    const section =
        document.getElementById(
            "documentCheckerSection"
        );

    const content =
        document.getElementById(
            "documentCheckerContent"
        );

    if (!section || !content) {
        alert(
            "Document Checker HTML सापडला नाही."
        );

        return;
    }

    section.style.display =
        "block";

    content.innerHTML = `
        <div class="loading-box">
            🤖 तुमच्यासाठी AI ने निवडलेल्या योजना शोधत आहे...
        </div>
    `;

    /*
       IMPORTANT:
       इथे allSchemes वापरणार नाही.
       आधी AI recommendations मिळवतो.
    */

    const schemes =
        await ensureAIRecommendations();

    if (!schemes.length) {
        content.innerHTML = `

            <div class="empty-box">

                आधी तुमचे Profile Analysis करा.
                त्यानंतर AI तुमच्यासाठी योग्य योजना
                निवडेल आणि त्या योजनांसाठी
                Document Checker उपलब्ध होईल.

            </div>
        `;

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        return;
    }

    content.innerHTML = `

        <div
            class="document-checker-box"
        >

            <h3>
                📄 Document Checker
            </h3>

            <p>
                AI ने तुमच्या प्रोफाइलसाठी
                सुचवलेल्या योजनेनुसार तुमचे
                कागदपत्र योग्य आहे का ते तपासा.
            </p>

            <label>
                योजना निवडा
            </label>

            <select
                id="documentScheme"
            >

                <option value="">
                    -- योजना निवडा --
                </option>

                ${
                    schemes.map(
                        (scheme, index) => {

                            const id =
                                getSchemeId(
                                    scheme,
                                    index
                                );

                            return `
                                <option
                                    value="${escapeHtml(String(id))}"
                                >
                                    ${escapeHtml(
                                        getSchemeName(
                                            scheme
                                        )
                                    )}
                                </option>
                            `;
                        }
                    ).join("")
                }

            </select>

            <label>
                कागदपत्र Upload करा
            </label>

            <input
                type="file"
                id="documentFile"
                accept=".pdf,.jpg,.jpeg,.png"
            >

            <button
                type="button"
                onclick="runDocumentChecker()"
            >
                📄 Check Document
            </button>

            <div
                id="documentCheckerResult"
            ></div>

        </div>
    `;

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

async function runDocumentChecker() {
    const schemeSelect =
        document.getElementById(
            "documentScheme"
        );

    const fileInput =
        document.getElementById(
            "documentFile"
        );

    const result =
        document.getElementById(
            "documentCheckerResult"
        );

    if (
        !schemeSelect ||
        !fileInput ||
        !result
    ) {
        return;
    }

    const schemeId =
        schemeSelect.value;

    const file =
        fileInput.files[0];

    if (!schemeId) {
        alert(
            "कृपया योजना निवडा."
        );

        return;
    }

    if (!file) {
        alert(
            "कृपया कागदपत्र upload करा."
        );

        return;
    }

    const maxSize =
        10 * 1024 * 1024;

    if (file.size > maxSize) {
        alert(
            "कागदपत्राची कमाल size 10 MB आहे."
        );

        return;
    }

    result.innerHTML = `
        <div class="loading-box">
            🤖 AI कागदपत्र तपासत आहे...
        </div>
    `;

    try {

        const base64 =
            await fileToBase64(
                file
            );

        /*
           IMPORTANT:
           Selected scheme AI recommendations मधूनच.
        */

        const selectedScheme =
            findSchemeById(
                schemeId,
                window.aiRecommendedSchemes
            );

        if (!selectedScheme) {
            throw new Error(
                "AI ने सुचवलेली निवडलेली योजना सापडली नाही."
            );
        }

        const data =
            await fetchJson(
                `${API_BASE_URL}/api/ai/document-checker`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            scheme:
                                selectedScheme,

                            file: {

                                name:
                                    file.name,

                                type:
                                    file.type,

                                size:
                                    file.size,

                                base64:
                                    base64
                            },

                            user:
                                getProfilePayload()
                        })
                }
            );

        renderDocumentCheckerResult(
            data.data || data
        );

    } catch (error) {
        console.error(
            "Document checker error:",
            error
        );

        result.innerHTML = `

            <div class="error-box">

                ❌ Document Checker
                मध्ये समस्या आली.

                <br><br>

                ${escapeHtml(
                    error.message
                )}

            </div>
        `;
    }
}

function fileToBase64(file) {
    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload = () => {

                const result =
                    reader.result;

                const base64 =
                    String(
                        result
                    ).split(",")[1] ||
                    "";

                resolve(base64);
            };

            reader.onerror =
                reject;

            reader.readAsDataURL(
                file
            );
        }
    );
}

function renderDocumentCheckerResult(
    data
) {
    const result =
        document.getElementById(
            "documentCheckerResult"
        );

    if (!result) return;

    const status =
        data?.status ||
        data?.result ||
        data?.message ||
        "AI तपासणी पूर्ण झाली.";

    const details =
        data?.details ||
        data?.analysis ||
        data?.reason ||
        "";

    const issues =
        Array.isArray(
            data?.issues
        )
            ? data.issues
            : [];

    const suggestions =
        Array.isArray(
            data?.suggestions
        )
            ? data.suggestions
            : [];

    result.innerHTML = `

        <div
            class="document-result-card"
        >

            <h3>
                📄 तपासणी Result
            </h3>

            <h4>
                ${escapeHtml(
                    status
                )}
            </h4>

            ${
                details
                    ? `
                    <p>
                        ${escapeHtml(
                            typeof details === "string"
                                ? details
                                : JSON.stringify(details)
                        )}
                    </p>
                    `
                    : ""
            }

            ${
                issues.length
                    ? `
                    <div>

                        <strong>
                            ⚠️ समस्या:
                        </strong>

                        <ul>

                            ${
                                issues.map(
                                    item =>
                                        `<li>
                                            ${escapeHtml(
                                                typeof item === "string"
                                                    ? item
                                                    : JSON.stringify(item)
                                            )}
                                        </li>`
                                ).join("")
                            }

                        </ul>

                    </div>
                    `
                    : ""
            }

            ${
                suggestions.length
                    ? `
                    <div>

                        <strong>
                            💡 सूचना:
                        </strong>

                        <ul>

                            ${
                                suggestions.map(
                                    item =>
                                        `<li>
                                            ${escapeHtml(
                                                typeof item === "string"
                                                    ? item
                                                    : JSON.stringify(item)
                                            )}
                                        </li>`
                                ).join("")
                            }

                        </ul>

                    </div>
                    `
                    : ""
            }

        </div>
    `;
}

/* =========================================================
   BENEFIT OPTIMIZER
   ========================================================= */
/* =========================================================
   AI BENEFIT OPTIMIZER
   ========================================================= */

async function openBenefitOptimizer() {

     scrollToFeatureSection("benefitOptimizerSection");
    const section =
        document.getElementById("benefitOptimizerSection");

    if (!section) {
        alert("Benefit Optimizer HTML सापडला नाही.");
        return;
    }

    section.style.display = "block";

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    const container =
        document.getElementById("benefitOptimizerContent") ||
        document.getElementById("benefitOptimizerResult");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="loading-box">
            🧠 AI तुमच्यासाठी Benefit Optimizer तयार करत आहे...
        </div>
    `;

    try {

        const schemes =
            await ensureAIRecommendations();

        if (
            !Array.isArray(schemes) ||
            schemes.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-box">
                    आधी AI Profile Analysis करा.
                    त्यानंतर तुमच्यासाठी योग्य योजना
                    निवडून Benefit Optimizer वापरा.
                </div>
            `;

            return;
        }

        container.innerHTML = `

            <div class="benefit-optimizer-box">

                <h3>
                    🧠 AI Benefit Optimizer
                </h3>

                <p>
                    तुमच्या निवडलेल्या योजनेतून
                    जास्तीत जास्त लाभ मिळवण्यासाठी
                    AI मार्गदर्शन
                </p>

                <div class="benefit-select-box">

                    <label>
                        योजना निवडा
                    </label>

                    <select id="benefitOptimizerScheme">

                        <option value="">
                            -- योजना निवडा --
                        </option>

                        ${
                            schemes
                                .map(
                                    (scheme, index) => {

                                        const id =
                                            getSchemeId(
                                                scheme,
                                                index
                                            );

                                        const name =
                                            getSchemeName(
                                                scheme
                                            );

                                        return `
                                            <option
                                                value="${escapeHtml(
                                                    String(id)
                                                )}"
                                            >
                                                ${escapeHtml(
                                                    name
                                                )}
                                            </option>
                                        `;

                                    }
                                )
                                .join("")
                        }

                    </select>

                </div>

                <button
                    type="button"
                    onclick="runBenefitOptimizer()"
                >
                    🧠 AI Benefit Optimize करा
                </button>

                <div
                    id="benefitOptimizerResult"
                    style="margin-top:20px;"
                ></div>

            </div>

        `;

    }

    catch (error) {

        console.error(
            "Benefit Optimizer:",
            error
        );

        container.innerHTML = `
            <div class="error-box">
                ❌ काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.
                <br><br>
                <button type="button" class="feature-btn" onclick="runBenefitOptimizer()">
                    🔄 पुन्हा प्रयत्न करा
                </button>
            </div>
        `;

    }

}


/* =========================================================
   RUN BENEFIT OPTIMIZER
   ========================================================= */

async function runBenefitOptimizer() {

    const select =
        document.getElementById(
            "benefitOptimizerScheme"
        );

    const result =
        document.getElementById(
            "benefitOptimizerResult"
        );

    if (!select || !result) {

        alert(
            "Benefit Optimizer चे HTML सापडले नाही."
        );

        return;
    }

    const selectedId =
        select.value;

    if (!selectedId) {

        alert(
            "कृपया योजना निवडा."
        );

        return;
    }

    const schemes =
        await ensureAIRecommendations();

    const selectedScheme =
        schemes.find(
            (scheme, index) =>
                String(
                    getSchemeId(
                        scheme,
                        index
                    )
                ) === String(selectedId)
        );

    if (!selectedScheme) {

        result.innerHTML = `
            <div class="error-box">
                ❌ निवडलेली योजना सापडली नाही.
            </div>
        `;

        return;
    }

    result.innerHTML = `
        <div class="loading-box">
            🧠 AI तुमच्या योजनेचा Benefit Optimizer तयार करत आहे...
        </div>
    `;

    try {

        const data =
            await fetchJson(
                `${API_BASE_URL}/api/ai/benefit-optimizer`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        scheme:
                            selectedScheme,

                        user:
                            getProfilePayload()

                    })
                }
            );

        renderBenefitOptimizerResult(
            data,
            selectedScheme
        );

    }

    catch (error) {

        console.error(
            "Benefit Optimizer Error:",
            error
        );

        result.innerHTML = `
            <div class="error-box">

                ❌ काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.
                <br><br>
                <button type="button" class="feature-btn" onclick="runBenefitOptimizer()">
                    🔄 पुन्हा प्रयत्न करा
                </button>

            </div>
        `;

    }

}


/* =========================================================
   OPTIMIZE SCHEME BENEFIT
   ========================================================= */

async function optimizeSchemeBenefit() {

    await runBenefitOptimizer();

}


/* =========================================================
   RENDER BENEFIT OPTIMIZER
   ========================================================= */

function renderBenefitOptimizerResult(
    data,
    selectedScheme
) {

    const result =
        document.getElementById(
            "benefitOptimizerResult"
        );

    if (!result) return;


    const schemeName =
        getSchemeName(
            selectedScheme
        );


    const benefitPotential =
        data?.benefitPotential ||
        data?.benefit_potential ||
        data?.potential ||
        "उच्च";


    const benefits =
        data?.benefits ||
        data?.possibleBenefits ||
        data?.potentialBenefits ||
        data?.benefitDetails ||
        data?.result?.benefits ||
        data?.data?.benefits ||
        "";


    const whySuitable =
        data?.whySuitable ||
        data?.why_suitable ||
        data?.reason ||
        data?.matchReason ||
        data?.result?.whySuitable ||
        data?.data?.whySuitable ||
        "";


    const maximizeBenefit =
        data?.maximizeBenefit ||
        data?.howToMaximize ||
        data?.maximumBenefit ||
        data?.result?.maximizeBenefit ||
        data?.data?.maximizeBenefit ||
        "";


    const requiredActions =
        data?.requiredActions ||
        data?.actions ||
        data?.necessaryActions ||
        data?.result?.requiredActions ||
        data?.data?.requiredActions ||
        [];


    const documents =
        data?.documents ||
        data?.requiredDocuments ||
        data?.result?.documents ||
        data?.data?.documents ||
        [];


    const importantNotes =
        data?.importantNotes ||
        data?.importantInstructions ||
        data?.notes ||
        data?.result?.importantNotes ||
        data?.data?.importantNotes ||
        [];


    const practicalTips =
        data?.practicalTips ||
        data?.tips ||
        data?.practical_tips ||
        data?.result?.practicalTips ||
        data?.data?.practicalTips ||
        "";


    function renderList(value) {

        if (!value) {
            return "";
        }

        if (Array.isArray(value)) {

            return `
                <ul>
                    ${
                        value
                            .map(
                                item => `
                                    <li>
                                        ${escapeHtml(
                                            String(item)
                                        )}
                                    </li>
                                `
                            )
                            .join("")
                    }
                </ul>
            `;

        }

        return `
            <p>
                ${escapeHtml(
                    String(value)
                )}
            </p>
        `;

    }


    result.innerHTML = `

        <div class="benefit-optimizer-result">

            <!-- HEADER -->

            <div class="benefit-header">

                <h3>
                    🧠 AI Benefit Optimizer
                </h3>

                <p>
                    तुमच्या निवडलेल्या योजनेतून
                    जास्तीत जास्त लाभ मिळवण्यासाठी
                    AI मार्गदर्शन
                </p>

            </div>


            <!-- SCHEME -->

            <div class="benefit-section">

                <h4>
                    📋 ${escapeHtml(
                        schemeName
                    )}
                </h4>

                <div class="benefit-potential">

                    <strong>
                        Benefit Potential:
                    </strong>

                    <span>
                        ${escapeHtml(
                            String(
                                benefitPotential
                            )
                        )}
                    </span>

                </div>

            </div>


            <!-- POSSIBLE BENEFITS -->

            <div class="benefit-section">

                <h4>
                    💰 संभाव्य फायदे
                </h4>

                ${
                    benefits
                        ? renderList(
                            benefits
                        )
                        : `
                            <p>
                                ${escapeHtml(
                                    formatSchemeValue(
                                        getSchemeField(
                                            selectedScheme,
                                            [
                                                "benefits",
                                                "benefit",
                                                "advantages"
                                            ]
                                        )
                                    )
                                )}
                            </p>
                          `
                }

            </div>


            <!-- WHY SUITABLE -->

            <div class="benefit-section">

                <h4>
                    👤 तुमच्यासाठी का योग्य?
                </h4>

                ${
                    whySuitable
                        ? `
                            <p>
                                ${escapeHtml(
                                    String(
                                        whySuitable
                                    )
                                )}
                            </p>
                          `
                        : `
                            <p>
                                ही योजना तुमच्या
                                प्रोफाइलमधील उपलब्ध
                                माहितीनुसार संबंधित
                                असल्याने AI ने
                                तिची शिफारस केली आहे.
                            </p>
                          `
                }

            </div>


            <!-- MAXIMIZE BENEFIT -->

            <div class="benefit-section">

                <h4>
                    📈 लाभ जास्तीत जास्त कसा मिळवावा?
                </h4>

                ${
                    maximizeBenefit
                        ? renderList(
                            maximizeBenefit
                        )
                        : `
                            <p>
                                योजनेच्या अधिकृत
                                नियमांनुसार पात्रता,
                                नोंदणी आणि आवश्यक
                                कागदपत्रे पूर्ण ठेवा.
                            </p>
                          `
                }

            </div>


            <!-- REQUIRED ACTIONS -->

            <div class="benefit-section">

                <h4>
                    ✅ आवश्यक कृती
                </h4>

                ${
                    requiredActions.length ||
                    typeof requiredActions === "string"
                        ? renderList(
                            requiredActions
                        )
                        : `
                            <p>
                                संबंधित विभागाच्या
                                अधिकृत पोर्टलवर
                                अर्जाची स्थिती तपासा
                                आणि आवश्यक प्रक्रिया
                                पूर्ण करा.
                            </p>
                          `
                }

            </div>


            <!-- DOCUMENTS -->

            <div class="benefit-section">

                <h4>
                    📄 आवश्यक कागदपत्रे
                </h4>

                ${
                    documents.length ||
                    typeof documents === "string"
                        ? renderList(
                            documents
                        )
                        : `
                            <p>
                                योजनेनुसार आवश्यक
                                कागदपत्रे अधिकृत
                                पोर्टलवर तपासा.
                            </p>
                          `
                }

            </div>


            <!-- IMPORTANT NOTES -->

            <div class="benefit-section important-notes">

                <h4>
                    ⚠️ महत्त्वाच्या सूचना
                </h4>

                ${
                    importantNotes.length ||
                    typeof importantNotes === "string"
                        ? renderList(
                            importantNotes
                        )
                        : `
                            <p>
                                अंतिम पात्रता संबंधित
                                विभाग तपासेल.
                            </p>
                          `
                }

            </div>


            <!-- PRACTICAL TIPS -->

            <div class="benefit-section practical-tips">

                <h4>
                    💡 Practical Tips
                </h4>

                ${
                    practicalTips
                        ? renderList(
                            practicalTips
                        )
                        : `
                            <p>
                                अर्ज करण्यापूर्वी
                                योजनेची अधिकृत माहिती,
                                पात्रता आणि कागदपत्रे
                                तपासा.
                            </p>
                          `
                }

            </div>


            <!-- DISCLAIMER -->

            <div class="ai-disclaimer">

                ⚠️ अंतिम पात्रता आणि लाभ
                संबंधित सरकारी विभागाच्या
                नियमांनुसार निश्चित होतील.

            </div>

        </div>

    `;

}
/* =========================================================
   AI LIFE SCHEME
   ========================================================= */

function openLifeScheme() {
    scrollToFeatureSection("lifeSchemeSection");
    const section =
        document.getElementById(
            "lifeSchemeSection"
        );

    if (!section) {
        alert(
            "AI Life Scheme HTML सापडला नाही."
        );

        return;
    }

    section.style.display =
        "block";

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function selectLifeEvent(
    eventName
) {
    window.selectedLifeEvent =
        eventName;

    document
        .querySelectorAll(
            ".life-event-btn"
        )
        .forEach(
            btn =>
                btn.classList.remove(
                    "selected"
                )
        );

    /*
       Inline onclick मधून event मिळाला तर.
       जुना flow preserve.
    */

    const currentEvent =
        window.event;

    if (
        currentEvent &&
        currentEvent.currentTarget
    ) {
        currentEvent.currentTarget.classList.add(
            "selected"
        );
    } else {
        /*
           जर browser ने event दिला नाही
           तरी योग्य button शोधण्याचा प्रयत्न.
        */

        document
            .querySelectorAll(
                ".life-event-btn"
            )
            .forEach(
                btn => {

                    const onclick =
                        btn.getAttribute(
                            "onclick"
                        ) || "";

                    if (
                        onclick.includes(
                            String(eventName)
                        )
                    ) {
                        btn.classList.add(
                            "selected"
                        );
                    }
                }
            );
    }

    runLifeScheme();
}

async function runLifeScheme() {
    const eventName =
        window.selectedLifeEvent;

    const loading =
        document.getElementById(
            "lifeSchemeLoading"
        );

    const result =
        document.getElementById(
            "lifeSchemeResult"
        );

    if (
        !eventName ||
        !result
    ) {
        return;
    }

    if (loading) {
        loading.style.display =
            "block";
    }

    result.innerHTML = "";

    try {
        console.log(
            "AI Life Scheme Request:",
            {
                event:
                    eventName,

                user:
                    getProfilePayload()
            }
        );

        const data =
            await fetchJson(
                `${API_BASE_URL}/api/ai/life-scheme`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            event:
                                eventName,

                            user:
                                getProfilePayload()

                        })
                }
            );

        if (loading) {
            loading.style.display =
                "none";
        }

        renderLifeSchemeResult(
            data.data || data
        );

    } catch (error) {

        if (loading) {
            loading.style.display =
                "none";
        }

        console.error(
            "Life Scheme:",
            error
        );

        result.innerHTML = `

            <div class="error-box">

                ❌ AI Life Scheme
                मध्ये समस्या आली.

                <br><br>

                ${escapeHtml(
                    error.message
                )}

            </div>
        `;
    }
}

function renderLifeSchemeResult(
    data
) {
    const result =
        document.getElementById(
            "lifeSchemeResult"
        );

    if (!result) return;

    const recommendations =
        data?.recommendations ||
        data?.schemes ||
        data?.data?.recommendations ||
        data?.data?.schemes ||
        [];

    if (
        !Array.isArray(
            recommendations
        ) ||
        recommendations.length === 0
    ) {
        result.innerHTML = `

            <div class="empty-box">

                सध्या या परिस्थितीसाठी
                योजना सापडल्या नाहीत.

            </div>
        `;

        return;
    }

    result.innerHTML = `

        <div
            class="life-result-list"
        >

            ${
                recommendations.map(
                    (scheme, index) => {

                        const name =
                            getSchemeName(
                                scheme
                            );

                        const description =
                            scheme.description ||
                            scheme.details ||
                            scheme.reason ||
                            scheme.about ||
                            "";

                        const benefits =
                            formatSchemeValue(
                                scheme.benefits ||
                                ""
                            );

                        const eligibility =
                            formatSchemeValue(
                                scheme.eligibility ||
                                ""
                            );

                        const documents =
                            formatSchemeValue(
                                scheme.documents ||
                                ""
                            );

                        const process =
                            formatSchemeValue(
                                scheme.process ||
                                ""
                            );

                        const url =
                            safeUrl(
                                scheme.official_url ||
                                scheme.official ||
                                scheme.application_link ||
                                scheme.apply_link ||
                                scheme.url
                            );

                        return `

                            <div
                                class="life-scheme-card"
                            >

                                <h3>
                                    ${escapeHtml(
                                        name
                                    )}
                                </h3>

                                ${
                                    description
                                        ? `
                                        <p>
                                            ${escapeHtml(
                                                description
                                            )}
                                        </p>
                                        `
                                        : ""
                                }

                                ${
                                    benefits
                                        ? `
                                        <p>
                                            <strong>
                                                💰 फायदे:
                                            </strong>

                                            ${escapeHtml(
                                                benefits
                                            )}
                                        </p>
                                        `
                                        : ""
                                }

                                ${
                                    eligibility
                                        ? `
                                        <p>
                                            <strong>
                                                👤 पात्रता:
                                            </strong>

                                            ${escapeHtml(
                                                eligibility
                                            )}
                                        </p>
                                        `
                                        : ""
                                }

                                ${
                                    documents
                                        ? `
                                        <p>
                                            <strong>
                                                📄 कागदपत्रे:
                                            </strong>

                                            ${escapeHtml(
                                                documents
                                            )}
                                        </p>
                                        `
                                        : ""
                                }

                                ${
                                    process
                                        ? `
                                        <p>
                                            <strong>
                                                📝 प्रक्रिया:
                                            </strong>

                                            ${escapeHtml(
                                                process
                                            )}
                                        </p>
                                        `
                                        : ""
                                }

                                ${
                                    url
                                        ? `
                                        <a
                                            href="${escapeHtml(
                                                url
                                            )}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            🌐 Official Website →
                                        </a>
                                        `
                                        : ""
                                }

                            </div>

                        `;
                    }
                ).join("")
            }

        </div>
    `;
}
/* =========================================================
   APPLICATION TRACKER
   ========================================================= */
function openApplicationTracker() {

    const section =
        document.getElementById(
            "applicationTrackerSection"
        );

    if (!section) {

        console.error(
            "applicationTrackerSection सापडला नाही."
        );

        return;
    }


    section.style.display =
        "block";


    loadTrackerSchemes();

    renderMyApplications();


    setTimeout(function () {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 100);

}

async function loadTrackerSchemes() {

    const select =
        document.getElementById("trackerScheme");

    if (!select) return;

    let schemes =
        Array.isArray(window.aiRecommendedSchemes)
            ? window.aiRecommendedSchemes
            : [];

console.log("TRACKER AI SCHEMES:", schemes);
    /* =========================================
       जर Analysis आधी केले नसेल
       तर AI recommendations load करा
       ========================================= */

    if (!schemes.length) {

        try {

            schemes =
                await ensureAIRecommendations();

        } catch (error) {

            console.error(
                "Tracker AI schemes error:",
                error
            );

            schemes = [];

        }

    }


    /* =========================================
       DROPDOWN RESET
       ========================================= */

    select.innerHTML = `
        <option value="">
            -- योजना निवडा --
        </option>
    `;


    /* =========================================
       NO SCHEMES
       ========================================= */

    if (!schemes.length) {

        select.innerHTML += `
            <option value="" disabled>
                कोणतीही AI योजना उपलब्ध नाही
            </option>
        `;

        return;
    }


    /* =========================================
       AI ANALYSIS / RECOMMENDED SCHEMES
       ========================================= */

    schemes.forEach(function (scheme, index) {

        const id =
            getSchemeId(
                scheme,
                index
            );

        const name =
            getSchemeName(
                scheme
            );


        if (
            id === undefined ||
            id === null ||
            id === ""
        ) {
            return;
        }


        const option =
            document.createElement("option");


        option.value =
            String(id);


        option.textContent =
            name ||
            "सरकारी योजना";


        select.appendChild(
            option
        );

    });

}

async function trackApplication() { 
 
    const schemeSelect = 
        document.getElementById("trackerScheme"); 
 
    const applicationInput = 
        document.getElementById("applicationNumber"); 
 
    const result = 
        document.getElementById( 
            "applicationTrackerResult" 
        ); 
 
    if ( 
        !schemeSelect || 
        !applicationInput || 
        !result 
    ) { 
        alert("Application Tracker HTML सापडला नाही."); 
        return; 
    } 
 
    const schemeId = 
        schemeSelect.value; 
 
    const schemeName = 
        schemeSelect.options[ 
            schemeSelect.selectedIndex 
        ]?.text || ""; 
 
    const applicationNumber = 
        applicationInput.value.trim(); 
 
    if (!schemeId) { 
 
        alert("कृपया योजना निवडा."); 
        return; 
 
    } 
 
    if (!applicationNumber) { 
 
        alert("कृपया अर्ज क्रमांक टाका."); 
        return; 
 
    } 


    // ==========================================
    // OFFICIAL WEBSITE URL
    // ==========================================

    let officialUrl = "";

    try {

        const allSchemes =
            await fetch(
                `${API_BASE_URL}/api/schemes`
            ).then(function (response) {

                if (!response.ok) {
                    throw new Error(
                        "Schemes API failed"
                    );
                }

                return response.json();

            });


        const selectedScheme =
            allSchemes.find(function (scheme) {

                return String(scheme.id) ===
                    String(schemeId);

            });


        // आपल्या database मधील exact field
        officialUrl =
            selectedScheme?.official || "";

    } catch (error) {

        console.error(
            "Official URL loading error:",
            error
        );

    }


    // ==========================================
    // SAVE APPLICATION
    // ==========================================

    saveApplication(
        schemeId,
        schemeName,
        applicationNumber,
        officialUrl
    );


    // ==========================================
    // RESULT
    // ==========================================

    result.innerHTML = ` 
 
        <div class="result-card"> 
 
            <h3>✅ अर्जाची माहिती जतन झाली</h3> 
 
            <p> 
                <strong>योजना:</strong> 
                ${escapeHtml(schemeName)} 
            </p> 
 
            <p> 
                <strong>अर्ज क्रमांक:</strong> 
                ${escapeHtml(applicationNumber)} 
            </p> 
 
            <p> 
                ℹ️ वास्तविक अर्जाची स्थिती 
                संबंधित सरकारी अधिकृत संकेतस्थळावर 
                तपासा. 
            </p> 
 
            <button 
                type="button" 
                class="feature-btn" 
                onclick="openOfficialSchemeWebsite()" 
            > 
                🌐 Official Website वर जा 
            </button> 
 
        </div> 
 
    `; 
 
    renderMyApplications(); 
}


/* =========================================================
   SAVE APPLICATION
   ========================================================= */
function saveApplication(
    schemeId,
    schemeName,
    applicationNumber,
    officialUrl = ""
) {

    let applications = [];

    try {

        applications =
            JSON.parse(
                localStorage.getItem(
                    "jansaarthiApplications"
                )
            ) || [];

    } catch (error) {

        applications = [];

    }


    const alreadyExists =
        applications.some(function (application) {

            return (
                String(application.schemeId) ===
                    String(schemeId) &&
                String(application.applicationNumber) ===
                    String(applicationNumber)
            );

        });


    if (!alreadyExists) {

        applications.push({

            schemeId:
                schemeId,

            schemeName:
                schemeName,

            applicationNumber:
                applicationNumber,

            officialUrl:
                officialUrl,

            savedAt:
                new Date().toISOString()

        });


        localStorage.setItem(
            "jansaarthiApplications",
            JSON.stringify(applications)
        );

    }
}

/* =========================================================
   MY APPLICATIONS
   ========================================================= */

function renderMyApplications() {

    const container =
        document.getElementById(
            "myApplications"
        );

    if (!container) return;

    let applications = [];

    try {

        applications =
            JSON.parse(
                localStorage.getItem(
                    "jansaarthiApplications"
                )
            ) || [];

    } catch (error) {

        applications = [];

    }

    if (!applications.length) {

        container.innerHTML = `

            <div class="result-card">

                <h3>📋 माझे अर्ज</h3>

                <p>
                    अजून कोणताही अर्ज जतन केलेला नाही.
                </p>

            </div>

        `;

        return;
    }

    container.innerHTML = `

        <div class="result-card">

            <h3>📋 माझे अर्ज</h3>

            ${applications.map(function (
                application,
                index
            ) {

                return `

                    <div
                        class="application-item"
                        style="
                            padding:15px;
                            margin-top:12px;
                            border:1px solid #dbe5ea;
                            border-radius:12px;
                        "
                    >

                        <strong>
                            ${escapeHtml(
                                application.schemeName
                            )}
                        </strong>

                        <p>
                            अर्ज क्रमांक:
                            ${escapeHtml(
                                application.applicationNumber
                            )}
                        </p>

                        <button
                            type="button"
                            class="feature-btn"
                            onclick="openOfficialSchemeWebsiteByIndex(${index})"
                        >
                            🌐 Official Website
                        </button>

                        <button
                            type="button"
                            onclick="deleteApplication(${index})"
                        >
                            🗑️ हटवा
                        </button>

                    </div>

                `;

            }).join("")}

        </div>

    `;
}


/* =========================================================
   DELETE APPLICATION
   ========================================================= */

function deleteApplication(index) {

    let applications = [];

    try {

        applications =
            JSON.parse(
                localStorage.getItem(
                    "jansaarthiApplications"
                )
            ) || [];

    } catch (error) {

        applications = [];

    }

    applications.splice(index, 1);

    localStorage.setItem(
        "jansaarthiApplications",
        JSON.stringify(applications)
    );

    renderMyApplications();
}


/* =========================================================
   OPEN OFFICIAL WEBSITE
   ========================================================= */
function openOfficialSchemeWebsite() {

    const schemeSelect =
        document.getElementById("trackerScheme");

    if (!schemeSelect) {
        alert("Application Tracker सापडला नाही.");
        return;
    }

    const schemeId =
        schemeSelect.value;

    if (!schemeId) {
        alert("कृपया योजना निवडा.");
        return;
    }

    fetch(`${API_BASE_URL}/api/schemes`)
        .then(function (response) {

            if (!response.ok) {
                throw new Error("Schemes API failed");
            }

            return response.json();

        })
        .then(function (schemes) {

            const scheme =
                schemes.find(function (item) {

                    return String(item.id) ===
                        String(schemeId);

                });

            if (!scheme) {

                alert(
                    "या योजनेची माहिती सापडली नाही."
                );

                return;
            }

            const officialUrl =
                scheme.official || "";

            if (!officialUrl) {

                alert(
                    "या योजनेची Official Website उपलब्ध नाही."
                );

                return;
            }

            window.open(
                officialUrl,
                "_blank",
                "noopener,noreferrer"
            );

        })
        .catch(function (error) {

            console.error(
                "Official Website Error:",
                error
            );

            alert(
                "Official Website उघडताना समस्या आली."
            );

        });
}
/* =========================================================
   SAVED APPLICATION OFFICIAL WEBSITE
   ========================================================= */
function openOfficialSchemeWebsiteByIndex(index) {

    let applications = [];

    try {

        applications =
            JSON.parse(
                localStorage.getItem(
                    "jansaarthiApplications"
                )
            ) || [];

    } catch (error) {

        applications = [];

    }

    const application =
        applications[index];

    if (!application) {

        alert("अर्जाची माहिती सापडली नाही.");

        return;
    }

    const schemeId =
        application.schemeId;

    if (!schemeId) {

        alert("योजनेचा ID सापडला नाही.");

        return;
    }

    fetch(`${API_BASE_URL}/api/schemes`)
        .then(function (response) {

            if (!response.ok) {
                throw new Error("Schemes API failed");
            }

            return response.json();

        })
        .then(function (schemes) {

            const scheme =
                schemes.find(function (item) {

                    return String(item.id) ===
                        String(schemeId);

                });

            if (!scheme) {

                alert(
                    "या योजनेची माहिती सापडली नाही."
                );

                return;
            }

            const officialUrl =
                scheme.official || "";

            if (!officialUrl) {

                alert(
                    "या योजनेची Official Website उपलब्ध नाही."
                );

                return;
            }

            window.open(
                officialUrl,
                "_blank",
                "noopener,noreferrer"
            );

        })
        .catch(function (error) {

            console.error(
                "Official Website Error:",
                error
            );

            alert(
                "Official Website उघडताना समस्या आली."
            );

        });
}

/* =========================================================
   FIND OFFICIAL WEBSITE
   ========================================================= */

function openSchemeOfficialWebsite(schemeId) {

    const schemes =
        Array.isArray(window.aiRecommendedSchemes)
            ? window.aiRecommendedSchemes
            : [];

    const scheme =
        schemes.find(function (item) {

            const id =
                item?.id ??
                item?.scheme_id ??
                item?.schemeId ??
                item?._id ??
                item?.uuid;

            return String(id) === String(schemeId);

        });

    if (!scheme) {

        alert(
            "या योजनेची अधिकृत वेबसाइट माहिती सापडली नाही."
        );

        return;
    }

    const officialUrl =
        scheme?.official_url ??
        scheme?.officialUrl ??
        scheme?.application_url ??
        scheme?.applicationUrl ??
        scheme?.apply_url ??
        scheme?.applyUrl;

    if (!officialUrl) {

        alert(
            "या योजनेची अधिकृत वेबसाइट उपलब्ध नाही."
        );

        return;
    }

    window.open(
        officialUrl,
        "_blank",
        "noopener,noreferrer"
    );
}
/* =========================================================
   FAKE SCHEME DETECTOR
   TEXT + URL + SCREENSHOT
   ========================================================= */

function openFakeSchemeDetector() {
    const section =
        document.getElementById(
            "fakeSchemeSection"
        );

    if (!section) {
        alert(
            "Fake Scheme Detector HTML सापडला नाही."
        );

        return;
    }

    section.style.display =
        "block";

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

/* =========================================================
   FAKE SCHEME SCREENSHOT
   ========================================================= */

async function checkFakeScheme() {
    const textInput =
        document.getElementById(
            "fakeSchemeText"
        );

    const urlInput =
        document.getElementById(
            "fakeSchemeUrl"
        );

    const result =
        document.getElementById(
            "fakeSchemeResult"
        );

    if (!result) return;

    const text =
        textInput?.value?.trim() ||
        "";

    const url =
        urlInput?.value?.trim() ||
        "";

    /*
       Existing HTML मध्ये screenshot input
       नसेल तर dynamically add केला जाईल.
    */

    let screenshotInput =
        document.getElementById(
            "fakeSchemeScreenshot"
        );

    if (!screenshotInput) {

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "fake-screenshot-upload";

        wrapper.innerHTML = `

            <label>
                📸 Screenshot Upload करा
            </label>

            <input
                type="file"
                id="fakeSchemeScreenshot"
                accept="image/png,image/jpeg,image/jpg"
            >

            <small>
                WhatsApp / SMS / Social Media
                वर आलेल्या scheme message चा
                screenshot upload करा.
                कमाल size 10 MB.
            </small>

        `;

        const parent =
            textInput?.parentElement ||
            urlInput?.parentElement ||
            result.parentElement;

        if (parent) {

            parent.insertBefore(
                wrapper,
                result
            );
        }

        screenshotInput =
            document.getElementById(
                "fakeSchemeScreenshot"
            );
    }

    const screenshot =
        screenshotInput
            ?.files?.[0];

    if (
        !text &&
        !url &&
        !screenshot
    ) {
        alert(
            "कृपया Message Text, URL किंवा Screenshot पैकी किमान एक द्या."
        );

        return;
    }

    if (screenshot) {

        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg"
        ];

        if (
            !allowedTypes.includes(
                screenshot.type
            )
        ) {
            alert(
                "फक्त JPG किंवा PNG screenshot upload करा."
            );

            return;
        }

        const maxSize =
            10 * 1024 * 1024;

        if (
            screenshot.size >
            maxSize
        ) {
            alert(
                "Screenshot ची कमाल size 10 MB आहे."
            );

            return;
        }
    }

    result.innerHTML = `

        <div class="loading-box">

            <div>
                🤖 AI message/screenshot
                तपासत आहे...
            </div>

            <small>
                योजनेचे नाव, दावा, link
                आणि उपलब्ध असल्यास official
                government information तपासली जात आहे.
            </small>

        </div>
    `;

    try {

        let screenshotData =
            null;

        if (screenshot) {

            const base64 =
                await fileToBase64(
                    screenshot
                );

            screenshotData = {

                name:
                    screenshot.name,

                type:
                    screenshot.type,

                size:
                    screenshot.size,

                base64:
                    base64
            };
        }

        const data =
            await fetchJson(
                `${API_BASE_URL}/api/ai/fake-scheme-detector`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            text:
                                text,

                            url:
                                url,

                            screenshot:
                                screenshotData,

                            user: {

                                name:
                                    user?.name ||
                                    "",

                                state:
                                    user?.state ||
                                    "",

                                district:
                                    user?.district ||
                                    ""
                            }

                        })
                }
            );

        renderFakeSchemeResult(
            data.data || data
        );

    } catch (error) {

        console.error(
            "Fake Scheme Detector:",
            error
        );

        result.innerHTML = `

            <div class="error-box">

                ❌ Fake Scheme Detector
                मध्ये समस्या आली.

                <br><br>

                ${escapeHtml(
                    error.message
                )}

            </div>
        `;
    }
}

function renderFakeSchemeResult(
    data
) {
    const result =
        document.getElementById(
            "fakeSchemeResult"
        );

    if (!result) return;

    const status =
        data?.status ||
        data?.verdict ||
        data?.result ||
        "तपासणी पूर्ण झाली.";

    const analysis =
        data?.analysis ||
        data?.reason ||
        data?.details ||
        data?.message ||
        "";

    const schemeName =
        data?.schemeName ||
        data?.scheme_name ||
        "";

    const officialSource =
        safeUrl(
            data?.officialSource ||
            data?.official_source ||
            data?.officialUrl ||
            data?.official_url
        );

    const risk =
        data?.riskLevel ||
        data?.risk_level ||
        "";

    const warningSigns =
        Array.isArray(
            data?.warningSigns
        )
            ? data.warningSigns
            : [];

    result.innerHTML = `

        <div
            class="fake-result-card"
        >

            <h3>
                🛡️ AI Verification Result
            </h3>

            ${
                schemeName
                    ? `
                    <div
                        class="fake-result-row"
                    >
                        <strong>
                            योजना:
                        </strong>

                        ${escapeHtml(
                            schemeName
                        )}
                    </div>
                    `
                    : ""
            }

            <div
                class="fake-verdict"
            >
                ${escapeHtml(
                    status
                )}
            </div>

            ${
                risk
                    ? `
                    <div
                        class="fake-risk"
                    >
                        Risk Level:
                        ${escapeHtml(
                            risk
                        )}
                    </div>
                    `
                    : ""
            }

            ${
                analysis
                    ? `
                    <div
                        class="fake-analysis"
                    >

                        <strong>
                            AI Analysis:
                        </strong>

                        <p>
                            ${escapeHtml(
                                typeof analysis === "string"
                                    ? analysis
                                    : JSON.stringify(analysis)
                            )}
                        </p>

                    </div>
                    `
                    : ""
            }

            ${
                warningSigns.length
                    ? `
                    <div
                        class="fake-warning-signs"
                    >

                        <strong>
                            ⚠️ Warning Signs:
                        </strong>

                        <ul>

                            ${
                                warningSigns.map(
                                    item =>
                                        `<li>
                                            ${escapeHtml(
                                                typeof item === "string"
                                                    ? item
                                                    : JSON.stringify(item)
                                            )}
                                        </li>`
                                ).join("")
                            }

                        </ul>

                    </div>
                    `
                    : ""
            }

            ${
                officialSource
                    ? `
                    <div
                        class="official-source"
                    >

                        <strong>
                            Official Source:
                        </strong>

                        <br>

                        <a
                            href="${escapeHtml(
                                officialSource
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            🌐 Official Government Source →
                        </a>

                    </div>
                    `
                    : ""
            }

            <div
                class="fake-disclaimer"
            >

                ⚠️ AI analysis मार्गदर्शनासाठी आहे.
                अंतिम खात्रीसाठी संबंधित अधिकृत
                सरकारी विभागाची website/notification
                तपासा.

            </div>

        </div>
    `;
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function toggleNotifications() {
    const panel =
        document.getElementById(
            "notificationPanel"
        );

    if (!panel) return;

    const isHidden =
        panel.style.display === "none" ||
        panel.style.display === "";

    panel.style.display =
        isHidden
            ? "block"
            : "none";

    if (isHidden) {
        loadActualNotifications();
    }
}

async function loadActualNotifications() {
    const list =
        document.getElementById(
            "notificationList"
        );

    const count =
        document.getElementById(
            "notificationCount"
        );

    if (!list) return;

    try {

        const data =
            await fetchJson(
                `${API_BASE_URL}/api/notifications`
            );

        const notifications =
            data.notifications ||
            data.data ||
            data ||
            [];

        if (
            !Array.isArray(
                notifications
            ) ||
            notifications.length === 0
        ) {

            if (count) {
                count.textContent = "0";
            }

            list.innerHTML = `

                <div
                    class="empty-notification"
                >
                    सध्या कोणतीही नवीन
                    सूचना नाही.
                </div>

            `;

            return;
        }

        if (count) {
            count.textContent =
                notifications.length;
        }

        list.innerHTML =
            notifications
                .map(
                    notification => {

                        const title =
                            notification.title ||
                            notification.heading ||
                            "नवीन सूचना";

                        const message =
                            notification.message ||
                            notification.description ||
                            "";

                        return `

                            <div
                                class="notification-item"
                            >

                                <strong>
                                    ${escapeHtml(
                                        title
                                    )}
                                </strong>

                                <p>
                                    ${escapeHtml(
                                        message
                                    )}
                                </p>

                            </div>
                        `;
                    }
                )
                .join("");

    } catch (error) {

        console.error(
            "Notification error:",
            error
        );

        if (count) {
            count.textContent = "0";
        }

        list.innerHTML = `

            <div
                class="empty-notification"
            >
                सध्या कोणतीही नवीन
                सूचना नाही.
            </div>

        `;
    }
}

/* =========================================================
   LOGOUT
   ========================================================= */

function showLogoutModal() {
    const modal =
        document.getElementById(
            "logoutModal"
        );

    if (modal) {
        modal.style.display =
            "flex";
    }
}

function closeLogoutModal() {
    const modal =
        document.getElementById(
            "logoutModal"
        );

    if (modal) {
        modal.style.display =
            "none";
    }
}

function logoutUser() {

    localStorage.removeItem(
        "jansaarthiUser"
    );

    localStorage.removeItem(
        "jansaarthi_mobile"
    );

    window.location.href =
        "login.html";
}

function logout() {
    showLogoutModal();
}

function confirmLogout() {
    logoutUser();
}

/* =========================================================
   CHATBOT
   ========================================================= */
function openChatbot() {

    const chatbot =
        document.getElementById("chatbot");

    if (!chatbot) return;

    chatbot.style.display = "block";
}


function closeChatbot() {
    const chatbot =
        document.getElementById(
            "chatbot"
        );

    if (chatbot) {
        chatbot.style.display =
            "none";
    }
}

function addChatMessage(
    message,
    sender = "bot"
) {
    const container =
        document.getElementById(
            "chatMessages"
        );

    if (!container) return;

    const div =
        document.createElement(
            "div"
        );

    div.className =
        sender === "user"
            ? "chat-message user-message"
            : "chat-message bot-message";

    div.textContent =
        message;

    container.appendChild(
        div
    );

    container.scrollTop =
        container.scrollHeight;
}

async function sendChatMessage() {
    const input =
        document.getElementById(
            "chatInput"
        );

    if (!input) return;

    const message =
        input.value.trim();

    if (!message) return;

    addChatMessage(
        message,
        "user"
    );

    input.value = "";

    addChatMessage(
        "🤖 थोडा वेळ... मी माहिती तपासत आहे.",
        "bot"
    );

    try {

        const data =
            await fetchJson(
                `${API_BASE_URL}/api/ai/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            message,

                            user:
                                getProfilePayload()

                        })
                }
            );

        const reply =
            data.reply ||
            data.message ||
            data.response ||
            data.data?.reply ||
            "माफ करा, सध्या उत्तर उपलब्ध नाही.";

        const messages =
            document.getElementById(
                "chatMessages"
            );

        if (
            messages &&
            messages.lastElementChild
        ) {
            messages.lastElementChild.remove();
        }

        addChatMessage(
            reply,
            "bot"
        );

    } catch (error) {

        const messages =
            document.getElementById(
                "chatMessages"
            );

        if (
            messages &&
            messages.lastElementChild
        ) {
            messages.lastElementChild.remove();
        }

        addChatMessage(
            "सध्या AI Chatbot उपलब्ध नाही.",
            "bot"
        );

        console.error(
            "Chatbot error:",
            error
        );
    }
}

function sendChatSuggestion(
    text
) {
    const input =
        document.getElementById(
            "chatInput"
        );

    if (!input) return;

    input.value =
        text;

    sendChatMessage();
}

/* =========================================================
   VOICE INPUT
   ========================================================= */

function startVoiceInput() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert(
            "तुमच्या browser मध्ये voice input support उपलब्ध नाही."
        );

        return;
    }

    const recognition =
        new SpeechRecognition();

    recognition.lang =
        "mr-IN";

    recognition.interimResults =
        false;

    recognition.continuous =
        false;

    recognition.onstart = () => {

        const button =
            document.getElementById(
                "voiceButton"
            );

        if (button) {

            button.textContent =
                "🎙️ ऐकत आहे...";
        }
    };

    recognition.onresult =
        event => {

            const text =
                event.results[0][0]
                    .transcript;

            const input =
                document.getElementById(
                    "chatInput"
                );

            if (input) {

                input.value =
                    text;
            }
        };

    recognition.onerror =
        error => {

            console.error(
                "Voice error:",
                error
            );
        };

    recognition.onend = () => {

        const button =
            document.getElementById(
                "voiceButton"
            );

        if (button) {

            button.textContent =
                "🎤";
        }
    };

    recognition.start();
}

/* =========================================================
   CLOSE NOTIFICATION OUTSIDE
   ========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const panel =
            document.getElementById(
                "notificationPanel"
            );

        const button =
            document.querySelector(
                ".notification-btn"
            );

        if (!panel || !button) return;

        if (
            panel.style.display !==
                "none" &&
            panel.style.display !==
                "" &&
            !panel.contains(
                event.target
            ) &&
            !button.contains(
                event.target
            )
        ) {

            panel.style.display =
                "none";
        }
    }
);

/* =========================================================
   KEYBOARD CHAT
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        const input =
            document.getElementById(
                "chatInput"
            );

        if (
            input &&
            document.activeElement ===
                input &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            sendChatMessage();
        }
    }
);

/* =========================================================
   PAGE LOAD
   ========================================================= */

function initializeDashboard() {

    if (
        !loadLoggedInUser()
    ) {
        return;
    }

    displayUserData();

    /*
       All schemes background मध्ये load.
       हे मुख्यतः Comparison साठी.
       Recommendation मध्ये याचा fallback होत नाही.
    */

    loadSchemes();

    loadActualNotifications();

    console.log(
        "JanSaarthi Dashboard initialized successfully."
    );
}

/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.toggleNotifications =
    toggleNotifications;

window.scrollToProfile =
    scrollToProfile;

window.analyzeProfile =
    analyzeProfile;

window.getRecommendedSchemes =
    getRecommendedSchemes;

window.openRecommendedScheme =
    openRecommendedScheme;

window.openSchemeComparison =
    openSchemeComparison;

window.selectSchemeForComparison =
    selectSchemeForComparison;

window.compareSelectedSchemes =
    compareSelectedSchemes;

window.openDocumentChecker =
    openDocumentChecker;

window.runDocumentChecker =
    runDocumentChecker;

window.openBenefitOptimizer =
    openBenefitOptimizer;

window.runBenefitOptimizer =
    runBenefitOptimizer;

window.optimizeSchemeBenefit =
    optimizeSchemeBenefit;

window.openLifeScheme =
    openLifeScheme;

window.selectLifeEvent =
    selectLifeEvent;

window.runLifeScheme =
    runLifeScheme;

window.openFakeSchemeDetector =
    openFakeSchemeDetector;
window.openApplicationTracker = 
    openApplicationTracker;
window.checkFakeScheme =
    checkFakeScheme;

window.showLogoutModal =
    showLogoutModal;

window.closeLogoutModal =
    closeLogoutModal;

window.logoutUser =
    logoutUser;

window.logout =
    logout;

window.confirmLogout =
    confirmLogout;

window.openChatbot =
    openChatbot;

window.closeChatbot =
    closeChatbot;

window.sendChatMessage =
    sendChatMessage;

window.sendChatSuggestion =
    sendChatSuggestion;

window.startVoiceInput =
    startVoiceInput;

/* =========================================================
   START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard
    );

} else {

    initializeDashboard();
}
function scrollToFeatureSection(sectionId) {

    const section =
        document.getElementById(sectionId);

    if (!section) return;

    section.style.display = "block";

    setTimeout(function () {
        const dashboardHeader =
            document.querySelector(".dashboard-header");

        const featureNav =
            document.querySelector(".dashboard-feature-nav");

        const stickyOffset =
            (dashboardHeader?.offsetHeight || 0) +
            (featureNav?.offsetHeight || 0) +
            12;

        const targetTop =
            section.getBoundingClientRect().top +
            window.scrollY -
            stickyOffset;

        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth"
        });

    }, 100);
}

