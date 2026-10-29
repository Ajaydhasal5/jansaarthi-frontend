const API_URL = "https://jansaarthi-backend-production-d805.up.railway.app/api/schemes";
const UPDATES_API_URL = "https://jansaarthi-backend-production-d805.up.railway.app/api/updates";
const STATS_API_URL = "https://jansaarthi-backend-production-d805.up.railway.app/api/stats";
const CONTACT_API_URL = "https://jansaarthi-backend-production-d805.up.railway.app/api/contacts";

async function loadPortalStats() {
    const schemeCount = document.getElementById("totalSchemeCount");
    const userCount = document.getElementById("totalUserCount");
    const updateCount = document.getElementById("totalUpdateCount");

    try {
        const response = await fetch(STATS_API_URL);
        if (!response.ok) throw new Error("Stats server response failed");

        const stats = await response.json();
        const formatCount = (value) => {
            const count = Number(value);
            return Number.isFinite(count)
                ? `${new Intl.NumberFormat("mr-IN").format(count)}+`
                : "—";
        };

        if (schemeCount) schemeCount.textContent = formatCount(stats.totalSchemes);
        if (userCount) userCount.textContent = formatCount(stats.totalUsers);
        if (updateCount) updateCount.textContent = formatCount(stats.totalUpdates);
    } catch (error) {
        console.error("PORTAL STATS LOAD ERROR:", error);
        [schemeCount, userCount, updateCount].forEach((element) => {
            if (element) element.textContent = "—";
        });
    }
}

function toggleMenu() {
    const navMenu = document.getElementById("navMenu");
    if (navMenu) {
        navMenu.classList.toggle("show");
    }
}

async function loadSchemes() {
    const schemeGrid =
        document.getElementById("schemeGrid");
    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Server response failed");
        }

        const schemes =
            await response.json();

        console.log("Schemes loaded:", schemes);

        const totalCount =
            document.getElementById("totalSchemeCount");

        if (totalCount) {

            totalCount.innerText =
                `${new Intl.NumberFormat("mr-IN").format(schemes.length)}+`;
        }

        if (!schemeGrid) {
            return;
        }

        if (!Array.isArray(schemes) || schemes.length === 0) {

            schemeGrid.innerHTML = `
                <div class="no-schemes">

                    <h3>
                        सध्या कोणतीही योजना उपलब्ध नाही.
                    </h3>

                    <p>
                        नवीन योजना लवकरच उपलब्ध होईल.
                    </p>

                </div>
            `;

            return;
        }
        schemeGrid.innerHTML =
            schemes.map(function (scheme) {

                return `

                    <div
                        class="scheme-card"
                        data-category="${escapeHTML(
                            scheme.category || ""
                        )}"
                    >

                        <div class="tags">

                            <span>
                                ${escapeHTML(
                                    scheme.category ||
                                    "सर्व"
                                )}
                            </span>

                            <span>
                                ${escapeHTML(
                                    scheme.type ||
                                    "सरकारी योजना"
                                )}
                            </span>

                        </div>


                        <h3>
                            ${escapeHTML(
                                scheme.name ||
                                "योजनेचे नाव"
                            )}
                        </h3>


                        <p>
                            ${escapeHTML(
                                scheme.short_description ||
                                "या योजनेची माहिती उपलब्ध आहे."
                            )}
                        </p>


                        <div class="scheme-details">

                            <div>

                                <small>
                                    पात्रता
                                </small>

                                <b>
                                    पहा →
                                </b>

                            </div>


                            <div>

                                <small>
                                    कागदपत्रे
                                </small>

                                <b>
                                    पहा →
                                </b>

                            </div>

                        </div>


                        <button
                            class="details"
                            onclick="showSchemeById(${scheme.id})"
                        >
                            संपूर्ण माहिती →
                        </button>

                    </div>

                `;

            }).join("");

    }

    catch (error) {

        console.error(
            "SCHEME LOAD ERROR:",
            error
        );

        const totalCount =
            document.getElementById("totalSchemeCount");

        if (totalCount) {
            totalCount.innerText = "—";
        }

        if (schemeGrid) {

            schemeGrid.innerHTML = `

                <div class="no-schemes">

                    <h3>
                        ⚠️ योजना माहिती लोड झाली नाही.
                    </h3>

                    <p>
                        Backend server चालू आहे का ते तपासा.
                    </p>

                </div>

            `;
        }
    }
}

async function loadLatestUpdates() {

    const container =
        document.getElementById(
            "updatesContainer"
        );

    if (!container) return;

    try {

        const response =
            await fetch(
                UPDATES_API_URL
            );

        if (!response.ok) {

            throw new Error(
                "Updates server response failed"
            );
        }

        const updates =
            await response.json();

        console.log(
            "Latest Updates loaded:",
            updates
        );


        if (
            !Array.isArray(updates) ||
            updates.length === 0
        ) {

            container.innerHTML = `

                <div class="no-schemes">

                    <h3>
                        सध्या कोणतेही नवीन अपडेट नाही.
                    </h3>

                    <p>
                        नवीन माहिती लवकरच उपलब्ध होईल.
                    </p>

                </div>

            `;

            updateShowMoreButton();

            return;
        }


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
                            href="${escapeHTML(
                                update.link
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="update-btn"
                        >
                            अधिक माहिती →
                        </a>

                    `;
                }


                return `

                    <div class="update-card">


                        <div class="update-icon">
                            🔔
                        </div>


                        <div class="update-content">


                            <span class="update-type">

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
                                    ""
                                )}

                            </p>


                            <small>

                                📅 ${escapeHTML(date)}

                            </small>

                        </div>


                        ${moreButton}


                    </div>

                `;

            }).join("");


        updateShowMoreButton();

    }

    catch (error) {

        console.error(
            "LATEST UPDATES ERROR:",
            error
        );

        container.innerHTML = `

            <div class="no-schemes">

                <h3>
                    ⚠️ Updates लोड झाले नाहीत.
                </h3>

                <p>
                    Backend server चालू आहे का ते तपासा.
                </p>

            </div>

        `;

        updateShowMoreButton();
    }
}

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}

function searchScheme() {

    const input =
        document.getElementById(
            "searchInput"
        );

    if (!input) return;


    const searchText =
        input.value
            .trim()
            .toLowerCase();


    const cards =
        document.querySelectorAll(
            "#schemeGrid .scheme-card"
        );


    const noResults =
        document.getElementById(
            "noResults"
        );


    let found = false;


    cards.forEach(function (card) {

        const category =
            (
                card.dataset.category ||
                ""
            ).toLowerCase();
        const content =
            card.innerText.toLowerCase();
        if (
            searchText === "" ||

            category.includes(
                searchText
            ) ||

            content.includes(
                searchText
            )

        ) {

            card.style.display = "";

            found = true;

        }

        else {

            card.style.display =
                "none";
        }

    });


    if (noResults) {

        noResults.style.display =
            found
                ? "none"
                : "block";
    }
    const schemesSection =
        document.getElementById(
            "schemes"
        );


    if (
        schemesSection &&
        searchText !== ""
    ) {

        schemesSection.scrollIntoView({
            behavior: "smooth"
        });

    }
}

function quickSearch(term) {

    const input =
        document.getElementById(
            "searchInput"
        );

    if (!input) return;


    input.value = term;

    searchScheme();
}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const input =
            document.getElementById(
                "searchInput"
            );


        if (input) {

            input.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        searchScheme();

                    }

                }
            );

        }

    }
);

function checkEligibility() {

    const modal =
        document.getElementById(
            "eligibilityModal"
        );


    if (!modal) {

        console.error(
            "Eligibility modal सापडला नाही."
        );

        return;
    }
    modal.classList.add("show");

    document.body.style.overflow =
        "hidden";
}
function closeEligibility() {

    const modal =
        document.getElementById(
            "eligibilityModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    document.body.style.overflow =
        "";
}

document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "eligibilityModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeEligibility();

        }

    }
);

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "eligibilityForm"
            );


        if (!form) return;


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const ageElement =
                    document.getElementById(
                        "eligibilityAge"
                    );

                const stateElement =
                    document.getElementById(
                        "eligibilityState"
                    );

                const categoryElement =
                    document.getElementById(
                        "eligibilityCategory"
                    );

                const incomeElement =
                    document.getElementById(
                        "eligibilityIncome"
                    );


                const age =
                    ageElement
                        ? ageElement.value
                        : "";


                const state =
                    stateElement
                        ? stateElement.value
                        : "";


                const category =
                    categoryElement
                        ? categoryElement.value
                        : "";


                const income =
                    incomeElement
                        ? incomeElement.value
                        : "";


                console.log(
                    "Eligibility Input:",
                    {
                        age,
                        state,
                        category,
                        income
                    }
                );


                const results =
                    document.getElementById(
                        "eligibilityResults"
                    );


                if (!results) return;


                results.innerHTML = `

                    <div class="no-eligible-result">

                        🔍 तुमच्यासाठी योग्य योजना शोधत आहोत...

                    </div>

                `;


                try {

                    const response =
                        await fetch(
                            API_URL
                        );


                    if (!response.ok) {

                        throw new Error(
                            "Server error"
                        );

                    }


                    const schemes =
                        await response.json();


                    const userCategory =
                        String(
                            category || ""
                        ).toLowerCase();


                    const matchedSchemes =
                        schemes.filter(
                            function (scheme) {

                                const schemeCategory =
                                    String(
                                        scheme.category ||
                                        ""
                                    ).toLowerCase();


                                return (

                                    userCategory === "" ||

                                    schemeCategory.includes(
                                        userCategory
                                    ) ||

                                    schemeCategory.includes(
                                        "सर्व"
                                    ) ||

                                    userCategory ===
                                    "सर्व"

                                );

                            }
                        );


                    if (
                        matchedSchemes.length === 0
                    ) {

                        results.innerHTML = `

                            <div class="no-eligible-result">

                                <h3>
                                    😔 योग्य योजना सापडली नाही
                                </h3>

                                <p>
                                    सध्या तुमच्या माहितीनुसार
                                    कोणतीही योजना उपलब्ध नाही.
                                </p>

                            </div>

                        `;

                        return;
                    }


                    results.innerHTML = `

                        <h3 class="eligibility-result-title">

                            🎯 तुमच्यासाठी उपलब्ध योजना

                        </h3>


                        ${matchedSchemes.map(
                            function (scheme) {

                                return `

                                    <div class="eligibility-result-card">

                                        <h3>

                                            ${escapeHTML(
                                                scheme.name ||
                                                "योजनेचे नाव"
                                            )}

                                        </h3>


                                        <p>

                                            ${escapeHTML(
                                                scheme.short_description ||
                                                "योजनेची माहिती उपलब्ध आहे."
                                            )}

                                        </p>


                                        <a
                                            href="scheme-details.html?id=${encodeURIComponent(
                                                scheme.id
                                            )}"
                                            class="eligibility-view-btn"
                                        >

                                            संपूर्ण माहिती →

                                        </a>

                                    </div>

                                `;

                            }
                        ).join("")}

                    `;

                }

                catch (error) {

                    console.error(
                        "ELIGIBILITY ERROR:",
                        error
                    );


                    results.innerHTML = `

                        <div class="no-eligible-result">

                            ⚠️ माहिती मिळवताना समस्या आली.

                            <br><br>

                            कृपया Backend server चालू आहे
                            का ते तपासा.

                        </div>

                    `;

                }

            }
        );

    }
);

function showSchemeById(id) {

    window.location.href =
        "scheme-details.html?id=" +
        encodeURIComponent(id);
}


function showScheme(schemeName) {

    window.location.href =
        "scheme-details.html?scheme=" +
        encodeURIComponent(
            schemeName
        );
}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const links =
            document.querySelectorAll(
                "#navMenu a"
            );


        links.forEach(function (link) {

            link.addEventListener(
                "click",
                function () {

                    const navMenu =
                        document.getElementById(
                            "navMenu"
                        );


                    if (navMenu) {

                        navMenu.classList.remove(
                            "show"
                        );

                    }

                }
            );

        });

    }
);

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "🚀 JanSaarthi Website Started"
        );


        loadSchemes();
        loadPortalStats();

        loadLatestUpdates();

    }
);

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const contactForm =
            document.getElementById(
                "contactForm"
            );


        if (!contactForm) return;


        contactForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const name =
                    document.getElementById(
                        "cName"
                    ).value.trim();


                const email =
                    document.getElementById(
                        "cEmail"
                    ).value.trim();


                const mobile =
                    document.getElementById(
                        "cMobile"
                    ).value.trim();


                const subject =
                    document.getElementById(
                        "cSubject"
                    ).value;


                const message =
                    document.getElementById(
                        "cMessage"
                    ).value.trim();


                const result =
                    document.getElementById(
                        "contactMessage"
                    );


                if (!result) return;


                if (!name || !message) {

                    result.innerHTML =
                        "⚠️ कृपया नाव आणि संदेश भरा.";

                    return;
                }


                result.innerHTML =
                    "⏳ संदेश पाठवत आहे...";


                try {

                    const response =
                        await fetch(
                            CONTACT_API_URL,
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        name,
                                        email,
                                        mobile,
                                        subject,
                                        message

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.error ||
                            "Message failed"
                        );

                    }


                    result.innerHTML =
                        "✅ तुमचा संदेश यशस्वीरित्या पाठवला गेला!";


                    contactForm.reset();

                }

                catch (error) {

                    console.error(
                        "CONTACT ERROR:",
                        error
                    );


                    result.innerHTML =
                        "❌ संदेश पाठवताना समस्या आली. कृपया पुन्हा प्रयत्न करा.";

                }

            }
        );

    }
);

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const slides =
            document.querySelectorAll(
                ".slide"
            );


        const dots =
            document.querySelectorAll(
                ".slider-dot"
            );


        const prevButton =
            document.querySelector(
                ".slider-prev"
            );


        const nextButton =
            document.querySelector(
                ".slider-next"
            );


        if (!slides.length) return;


        let currentSlide = 0;

        let sliderTimer;


        function showSlide(index) {

            if (
                index >= slides.length
            ) {

                currentSlide = 0;

            }


            if (index < 0) {

                currentSlide =
                    slides.length - 1;

            }


            slides.forEach(
                function (slide) {

                    slide.classList.remove(
                        "active"
                    );

                }
            );


            dots.forEach(
                function (dot) {

                    dot.classList.remove(
                        "active"
                    );

                }
            );


            slides[
                currentSlide
            ].classList.add(
                "active"
            );


            if (
                dots[currentSlide]
            ) {

                dots[
                    currentSlide
                ].classList.add(
                    "active"
                );

            }

        }


        function nextSlide() {

            currentSlide++;

            showSlide(
                currentSlide
            );

            restartSlider();

        }


        function previousSlide() {

            currentSlide--;

            showSlide(
                currentSlide
            );

            restartSlider();

        }
        function startSlider() {

            sliderTimer =
                setInterval(
                    function () {

                        currentSlide++;

                        showSlide(
                            currentSlide
                        );

                    },
                    4000
                );

        }
        function restartSlider() {
            clearInterval(
                sliderTimer
            );

            startSlider();

        }
        if (nextButton) {

            nextButton.addEventListener(
                "click",
                nextSlide
            );

        }
        if (prevButton) {

            prevButton.addEventListener(
                "click",
                previousSlide
            );

        }
        dots.forEach(
            function (dot, index) {

                dot.addEventListener(
                    "click",
                    function () {

                        currentSlide =
                            index;

                        showSlide(
                            currentSlide
                        );

                        restartSlider();

                    }
                );

            }
        );


        showSlide(
            currentSlide
        );


        startSlider();

    }
);

function openJanSaarthiChat() {

    const chatbot =
        document.getElementById(
            "jansaarthiChatbot"
        );

    const input =
        document.getElementById(
            "jansaarthiChatInput"
        );


    if (chatbot) {

        chatbot.style.display =
            "flex";

    }


    if (input) {

        input.focus();

    }

}
function closeJanSaarthiChat() {

    const chatbot =
        document.getElementById(
            "jansaarthiChatbot"
        );


    if (chatbot) {

        chatbot.style.display =
            "none";

    }

}
async function sendJanSaarthiMessage() {

    const input =
        document.getElementById(
            "jansaarthiChatInput"
        );


    const messages =
        document.getElementById(
            "jansaarthiChatMessages"
        );


    if (!input || !messages) return;
    const message =
        input.value.trim();


    if (!message) {
        return;
    }
    const userMessage =
        document.createElement(
            "div"
        );
    userMessage.className =
        "user-message";
    userMessage.textContent =
        message;
    messages.appendChild(
        userMessage
    );

    input.value = "";
    messages.scrollTop =
        messages.scrollHeight;
    const botMessage =
        document.createElement(
            "div"
        );
    botMessage.className =
        "bot-message";
    botMessage.textContent =
        "🤖 जनसारथी AI उत्तर तयार करत आहे...";
    messages.appendChild(
        botMessage
    );
    messages.scrollTop =
        messages.scrollHeight;
    try {

        const response =
            await fetch(
                "https://jansaarthi-backend-production-d805.up.railway.app/api/ai/chat",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            message: message

                        })

                }
            );
        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                "AI response failed"
            );

        }
        botMessage.textContent =
            data.reply ||
            data.message ||
            "माफ करा, सध्या उत्तर मिळाले नाही.";
        messages.scrollTop =
            messages.scrollHeight;

    }

    catch (error) {

        console.error(
            "JANSAARTHI AI CHAT ERROR:",
            error
        );


        botMessage.textContent =
            "❌ AI शी संपर्क होऊ शकला नाही. Backend आणि Gemini API तपासा.";


        messages.scrollTop =
            messages.scrollHeight;

    }

}
function sendSuggestion(question) {
    const input = document.getElementById("jansaarthiChatInput");

    if (!input) return;

    input.value = question;
    sendJanSaarthiMessage();

    const suggestions = document.getElementById("jansaarthiSuggestions");

    if (suggestions) {
        suggestions.style.display = "none";
    }
}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const jansaarthiChatInput =
            document.getElementById(
                "jansaarthiChatInput"
            );


        if (
            jansaarthiChatInput
        ) {

            jansaarthiChatInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        sendJanSaarthiMessage();

                    }

                }
            );

        }

    }
);

let jansaarthiNotifications = [];
const notificationBox =
    document.getElementById(
        "notificationBox"
    );
const notificationList =
    document.getElementById(
        "notificationList"
    );
const notificationCount =
    document.getElementById(
        "notificationCount"
    );


const notificationButton =
    document.getElementById(
        "notificationButton"
    );

function toggleNotifications() {

    if (!notificationBox) return;


    notificationBox.classList.toggle(
        "show"
    );

    if (
        notificationBox.classList.contains(
            "show"
        )
    ) {

        if (notificationCount) {

            notificationCount.textContent =
                "0";

            notificationCount.style.display =
                "none";

        }

    }

}

function renderNotifications() {

    if (!notificationList) return;


    if (
        jansaarthiNotifications.length === 0
    ) {

        notificationList.innerHTML = `

            <p class="no-notifications">

                सध्या कोणतीही नवीन सूचना नाही.

            </p>

        `;

        return;
    }
    notificationList.innerHTML = "";
    jansaarthiNotifications.forEach(
        function (notification) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "notification-item";


            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "notification-item-title";


            title.textContent =
                notification.title ||
                "जनसारथी सूचना";


            const message =
                document.createElement(
                    "div"
                );


            message.className =
                "notification-item-message";


            message.textContent =
                notification.message ||
                "";


            const time =
                document.createElement(
                    "div"
                );


            time.className =
                "notification-item-time";


            if (
                notification.created_at
            ) {

                const date =
                    new Date(
                        notification.created_at
                    );


                time.textContent =
                    date.toLocaleString(
                        "mr-IN"
                    );

            }

            else {

                time.textContent =
                    "आत्ताच";

            }
            item.appendChild(
                title
            );


            item.appendChild(
                message
            );


            item.appendChild(
                time
            );


            notificationList.appendChild(
                item
            );

        }
    );

}

function updateNotificationCount(count) {

    if (!notificationCount) return;


    if (count > 0) {

        notificationCount.textContent =
            count > 99
                ? "99+"
                : count;


        notificationCount.style.display =
            "flex";

    }

    else {

        notificationCount.textContent =
            "0";


        notificationCount.style.display =
            "none";

    }

}

async function loadJanSaarthiNotifications() {

    try {

        const response =
            await fetch(
                "https://jansaarthi-backend-production-d805.up.railway.app/api/notifications"
            );


        if (!response.ok) {

            throw new Error(
                "Notification API failed"
            );

        }


        const data =
            await response.json();


        jansaarthiNotifications =
            Array.isArray(data)
                ? data
                : [];


        renderNotifications();


        updateNotificationCount(
            jansaarthiNotifications.length
        );

    }

    catch (error) {

        console.error(
            "Notification loading error:",
            error
        );

    }

}

function addJanSaarthiNotification(
    notification
) {

    if (!notification) return;


    const alreadyExists =
        jansaarthiNotifications.some(
            function (item) {

                return item.id ===
                    notification.id;

            }
        );


    if (alreadyExists) return;


    jansaarthiNotifications.unshift(
        notification
    );


    renderNotifications();


    if (
        notificationBox &&
        !notificationBox.classList.contains(
            "show"
        )
    ) {

        updateNotificationCount(
            jansaarthiNotifications.length
        );

    }

}

let jansaarthiSocket = null;


if (
    typeof io !== "undefined"
) {

    jansaarthiSocket =
        io(
            "https://jansaarthi-backend-production-d805.up.railway.app"
        );


    jansaarthiSocket.on(
        "connect",
        function () {

            console.log(
                "🔔 JanSaarthi notification server connected"
            );


            try {

                const user =
                    JSON.parse(
                        localStorage.getItem(
                            "jansaarthiUser"
                        )
                    );


                if (
                    user &&
                    user.id
                ) {

                    jansaarthiSocket.emit(
                        "joinUser",
                        user.id
                    );

                }

            }

            catch (error) {

                console.log(
                    "User notification room not joined"
                );

            }

        }
    );


    jansaarthiSocket.on(
        "newNotification",
        function (notification) {

            console.log(
                "🔔 New notification:",
                notification
            );


            addJanSaarthiNotification(
                notification
            );

        }
    );


    jansaarthiSocket.on(
        "disconnect",
        function () {

            console.log(
                "❌ Notification server disconnected"
            );

        }
    );

}

document.addEventListener(
    "click",
    function (event) {

        if (
            notificationBox &&
            notificationButton
        ) {

            if (
                !notificationBox.contains(
                    event.target
                ) &&
                !notificationButton.contains(
                    event.target
                )
            ) {

                notificationBox.classList.remove(
                    "show"
                );

            }

        }

    }
);

function selectSearchSuggestion(term) {

    const input =
        document.getElementById(
            "searchInput"
        );


    const box =
        document.getElementById(
            "searchSuggestions"
        );


    if (!input) return;


    input.value =
        term;


    if (box) {

        box.classList.remove(
            "show"
        );

    }


    searchScheme();

}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const input =
            document.getElementById(
                "searchInput"
            );


        const box =
            document.getElementById(
                "searchSuggestions"
            );


        if (
            !input ||
            !box
        ) return;


        const suggestions =
            box.querySelectorAll(
                ".search-suggestion"
            );


        function positionSearchSuggestions() {

            const searchBar =
                input.closest(
                    ".header-search"
                );


            if (!searchBar) return;


            const rect =
                searchBar.getBoundingClientRect();


            box.style.top =
                `${rect.bottom + 6}px`;


            box.style.left =
                `${rect.left}px`;


            box.style.width =
                `${rect.width}px`;

        }


        function filterSearchSuggestions(
            value
        ) {

            const query =
                value
                    .trim()
                    .toLowerCase();


            let visibleCount = 0;


            suggestions.forEach(
                function (item) {

                    const text =
                        item.textContent
                            .toLowerCase();


                    if (
                        query === "" ||
                        text.includes(query)
                    ) {

                        item.style.display =
                            "flex";

                        visibleCount++;

                    }

                    else {

                        item.style.display =
                            "none";

                    }

                }
            );


            if (
                visibleCount > 0
            ) {

                box.classList.add(
                    "show"
                );


                positionSearchSuggestions();

            }

            else {

                box.classList.remove(
                    "show"
                );

            }

        }


        input.addEventListener(
            "focus",
            function () {

                filterSearchSuggestions(
                    input.value
                );

            }
        );


        input.addEventListener(
            "input",
            function () {

                filterSearchSuggestions(
                    input.value
                );

            }
        );


        document.addEventListener(
            "click",
            function (event) {

                if (
                    !input.contains(
                        event.target
                    ) &&
                    !box.contains(
                        event.target
                    )
                ) {

                    box.classList.remove(
                        "show"
                    );

                }

            }
        );


        window.addEventListener(
            "resize",
            function () {

                if (
                    box.classList.contains(
                        "show"
                    )
                ) {

                    positionSearchSuggestions();

                }

            }
        );

    }
);

function openSchemesPage() {

    window.location.href =
        "scheme.html";

}


function updateShowMoreButton() {

    const container =
        document.getElementById(
            "updatesContainer"
        );


    const button =
        document.getElementById(
            "updatesMoreBtn"
        );


    const wrapper =
        document.querySelector(
            ".updates-more-wrapper"
        );


    if (
        !container ||
        !button ||
        !wrapper
    ) return;


    const updates =
        Array.from(
            container.children
        );


    if (
        updates.length <= 3
    ) {

        wrapper.classList.add(
            "hidden"
        );

        return;

    }


    wrapper.classList.remove(
        "hidden"
    );


    if (
        !container.classList.contains(
            "show-all"
        )
    ) {

        button.innerHTML =
            "Show More ↓";

    }

}

function toggleUpdates() {

    const container =
        document.getElementById(
            "updatesContainer"
        );


    const button =
        document.getElementById(
            "updatesMoreBtn"
        );


    if (
        !container ||
        !button
    ) return;


    container.classList.toggle(
        "show-all"
    );


    if (
        container.classList.contains(
            "show-all"
        )
    ) {

        button.innerHTML =
            "Show Less ↑";

    }

    else {

        button.innerHTML =
            "Show More ↓";


        const latest =
            document.getElementById(
                "latest"
            );


        if (latest) {

            latest.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }

    }

}
document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadJanSaarthiNotifications();

    }
);
document.addEventListener("click", function (e) {

    const card = e.target.closest(".category");

    if (card) {
        e.preventDefault();
        e.stopPropagation();

        const category = card.querySelector("h3")?.textContent.trim();
        const url = new URL("scheme.html", window.location.href);
        if (category) url.searchParams.set("category", category);
        window.location.href = url.toString();
    }

}, true);

function closeLoginPopup() {
    document.getElementById("loginPopup").style.display = "none";
    sessionStorage.setItem("jansaarthiPopupDismissed", "true");
}

function goToLogin() {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
    const user = localStorage.getItem("jansaarthiUser");
    const dismissed = sessionStorage.getItem("jansaarthiPopupDismissed");

    if (!user && !dismissed) {
        document.getElementById("loginPopup").style.display = "flex";
    }
});
