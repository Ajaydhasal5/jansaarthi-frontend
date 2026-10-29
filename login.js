const API_URL = "https://jansaarthi-backend-production-d805.up.railway.app/api/auth/login";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const otpMessage = document.getElementById("otpMessage");

const mobileInput = document.getElementById("mobile");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const otpSection = document.getElementById("otpSection");
const otpInput = document.getElementById("otp");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");

let otpVerified = false;
let otpSent = false;
let otpRequestId = "";
let otpIdentifier = "";

function getOtpErrorMessage(error) {
    let details = "";

    try {
        details = typeof error === "string" ? error : JSON.stringify(error || {});
    } catch (_) {
        details = String(error || "");
    }

    if (/captcha|hcaptcha|invalid-data|request not allowed/i.test(details)) {
        return "CAPTCHA पडताळणी झाली नाही. पुन्हा प्रयत्न करा. त्रुटी कायम राहिल्यास MSG91 OTP Widget मध्ये jansaarthiportal.netlify.app domain आणि CAPTCHA सेटिंग तपासा.";
    }

    return "OTP पाठवता आला नाही. कृपया पुन्हा प्रयत्न करा.";
}

function isCaptchaError(error) {
    try {
        const details = typeof error === "string" ? error : JSON.stringify(error || {});
        return /captcha|hcaptcha|invalid-data|request not allowed/i.test(details);
    } catch (_) {
        return /captcha|hcaptcha|invalid-data|request not allowed/i.test(String(error || ""));
    }
}

function showOtpProviderError(error) {
    console.error("MSG91 OTP Provider Error:", error);
    otpMessage.textContent = getOtpErrorMessage(error);
    otpMessage.style.color = "red";
    sendOtpBtn.disabled = false;
    sendOtpBtn.textContent = otpSent ? "OTP पुन्हा पाठवा" : "OTP पाठवा";
}

window.showOtpProviderError = showOtpProviderError;

function resetCaptchaBeforeOtp() {
    if (window.hcaptcha && typeof window.hcaptcha.reset === "function") {
        try {
            window.hcaptcha.reset();
        } catch (error) {
            // The provider may not have rendered the challenge yet.
            console.debug("hCaptcha reset skipped:", error);
        }
    }
}

function getOtpRequestId(data) {
    const candidates = [
        data && data.reqId,
        data && data.requestId,
        data && data.request_id,
        data && data.data && data.data.reqId,
        data && data.message
    ];

    return candidates.find(function (value) {
        return typeof value === "string" && /^[a-f0-9]{20,}$/i.test(value);
    }) || "";
}


// =====================================================
// SEND OTP
// =====================================================

sendOtpBtn.addEventListener("click", function () {

    const mobile = mobileInput.value.trim();

    if (!/^[0-9]{10}$/.test(mobile)) {

        otpMessage.textContent =
            "कृपया योग्य १० अंकी मोबाईल नंबर टाका.";

        otpMessage.style.color = "red";

        return;
    }

    const identifier = "91" + mobile;

    if (otpSent && identifier === otpIdentifier) {
        if (typeof window.retryOtp !== "function" || !otpRequestId) {
            otpMessage.textContent =
                "OTP पुन्हा पाठवता आला नाही. कृपया page refresh करून पुन्हा प्रयत्न करा.";
            otpMessage.style.color = "red";
            return;
        }

        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = "OTP पुन्हा पाठवत आहे...";
        resetCaptchaBeforeOtp();

        window.retryOtp(
            null,
            function (data) {
                console.log("OTP resent:", data);
                otpMessage.textContent = "OTP पुन्हा पाठवला आहे.";
                otpMessage.style.color = "green";
                sendOtpBtn.disabled = false;
                sendOtpBtn.textContent = "OTP पुन्हा पाठवा";
            },
            function (error) {
                showOtpProviderError(error);
            },
            otpRequestId
        );
        return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "OTP पाठवत आहे...";

    if (typeof window.sendOtp !== "function") {

        console.error(
            "MSG91 sendOtp function उपलब्ध नाही."
        );

        otpMessage.textContent =
            "OTP सेवा सुरू झालेली नाही. कृपया page refresh करून पुन्हा प्रयत्न करा.";

        otpMessage.style.color = "red";

        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = "OTP पाठवा";

        return;
    }


    resetCaptchaBeforeOtp();

    window.sendOtp(

        identifier,

        function (data) {

            console.log(
                "OTP Sent:",
                data
            );

            otpSent = true;
            otpIdentifier = identifier;
            otpRequestId = getOtpRequestId(data);

            otpSection.style.display = "block";

            otpMessage.textContent =
                "OTP तुमच्या मोबाईल नंबरवर पाठवला आहे.";

            otpMessage.style.color = "green";

            sendOtpBtn.textContent =
                "OTP पुन्हा पाठवा";

            sendOtpBtn.disabled = false;
        },


        function (error) {

            console.error(
                "OTP Send Error:",
                error
            );

            showOtpProviderError(error);
        }

    );

});


// =====================================================
// VERIFY OTP
// =====================================================

verifyOtpBtn.addEventListener("click", function () {

    const otp = otpInput.value.trim();

    if (!/^[0-9]{4,6}$/.test(otp)) {

        otpMessage.textContent =
            "कृपया योग्य OTP टाका.";

        otpMessage.style.color = "red";

        return;
    }

    verifyOtpBtn.disabled = true;

    verifyOtpBtn.textContent =
        "Verify होत आहे...";


    if (typeof window.verifyOtp !== "function") {

        console.error(
            "MSG91 verifyOtp function उपलब्ध नाही."
        );

        otpMessage.textContent =
            "OTP सेवा सुरू झालेली नाही. कृपया page refresh करून पुन्हा प्रयत्न करा.";

        otpMessage.style.color = "red";

        verifyOtpBtn.disabled = false;

        verifyOtpBtn.textContent =
            "OTP Verify करा";

        return;
    }


    window.verifyOtp(

        otp,

        async function (data) {

            console.log(
                "OTP Verified:",
                data
            );

            otpVerified = true;
// OTP Verify झाल्यावर mobile save करा
localStorage.setItem(
    "jansaarthi_mobile",
    mobileInput.value.trim()
);
            otpMessage.textContent =
                "✓ मोबाईल नंबर Verify झाला.";

            otpMessage.style.color = "green";

            verifyOtpBtn.textContent =
                "✓ OTP Verified";

            sendOtpBtn.disabled = true;


            // Login backend
            await loginUser();
        },


        function (error) {

            console.error(
                "OTP Verify Error:",
                error
            );

            otpMessage.textContent = isCaptchaError(error)
                ? getOtpErrorMessage(error)
                : "OTP चुकीचा आहे किंवा expired झाला आहे.";

            otpMessage.style.color = "red";

            verifyOtpBtn.disabled = false;

            verifyOtpBtn.textContent =
                "OTP Verify करा";
        },

        otpRequestId

    );

});


// =====================================================
// LOGIN USER
// =====================================================

async function loginUser() {

    const mobile = mobileInput.value.trim();


    // =================================================
    // IMPORTANT
    // जुना mobile delete करू नका.
    // Profile page साठी current mobile आवश्यक आहे.
    // =================================================


    try {

        const response = await fetch(
            API_URL,
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    mobile: mobile
                })

            }
        );


        const data =
            await response.json();


        console.log(
            "Login Response:",
            data
        );


        // =================================================
        // BACKEND ERROR
        // =================================================

        if (!response.ok) {

            showMessage(
                data.message ||
                "प्रवेश करण्यात अडचण आली.",
                "red"
            );

            return;
        }


        // =================================================
        // NEW USER
        // =================================================

        if (data.newUser === true) {

            /*
             * नवीन user साठी
             * current mobile save करा.
             */

            localStorage.setItem(
                "jansaarthi_mobile",
                mobile
            );


            // जुन्या user data ची गरज नाही
            localStorage.removeItem(
                "jansaarthiUser"
            );


            showMessage(
                "मोबाईल Verify झाला! Profile तयार करा...",
                "green"
            );


            setTimeout(
                function () {

                    window.location.href =
                        "profile.html";

                },
                500
            );


            return;
        }


        // =================================================
        // EXISTING USER
        // =================================================

        if (data.user) {

            /*
             * CURRENT user ची पूर्ण माहिती save करा.
             */

            localStorage.setItem(
                "jansaarthiUser",
                JSON.stringify(data.user)
            );


            /*
             * CURRENT mobile सुद्धा save करा.
             *
             * Profile page ला ही value लागते.
             */

            localStorage.setItem(
                "jansaarthi_mobile",
                mobile
            );


            showMessage(
                "प्रवेश यशस्वी झाला!",
                "green"
            );


            setTimeout(
                function () {

                    window.location.href =
                        "dashboard.html";

                },
                1000
            );


            return;
        }


        // =================================================
        // UNKNOWN RESPONSE
        // =================================================

        showMessage(
            "Login response योग्य मिळाला नाही.",
            "red"
        );

    }


    catch (error) {

        console.error(
            "Login Error:",
            error
        );


        showMessage(
            " काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
            "red"
        );

    }

}


// =====================================================
// SHOW LOGIN MESSAGE
// =====================================================

function showMessage(
    message,
    color
) {

    loginMessage.textContent =
        message;

    loginMessage.style.color =
        color;
}
