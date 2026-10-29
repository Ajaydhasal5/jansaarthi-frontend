const API_URL = "https://jansaarthi-backend-production-d805.up.railway.app/api/profile/create";

const profileForm =
    document.getElementById("profileForm");

const profileMessage =
    document.getElementById("profileMessage");

const submitBtn =
    document.getElementById("submitBtn");


// =====================================================
// MOBILE NUMBER
// =====================================================

// Login मधून current mobile मिळेल
const mobile =
    localStorage.getItem("jansaarthi_mobile");


if (!mobile) {

    alert(
        "कृपया आधी Mobile OTP ने Login करा."
    );

    window.location.href =
        "login.html";

}


// =====================================================
// PROFILE SUBMIT
// =====================================================

profileForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // =================================================
        // GET FORM VALUES
        // =================================================

        const name =
            document
                .getElementById("name")
                .value
                .trim();


        const age =
            document
                .getElementById("age")
                .value;


        const gender =
            document
                .getElementById("gender")
                .value;


        const state =
            document
                .getElementById("state")
                .value;


        const district =
            document
                .getElementById("district")
                .value;


        const area_type =
            document.querySelector(
                'input[name="area_type"]:checked'
            )?.value || "";


        const caste =
            document
                .getElementById("caste")
                .value;


        const occupation =
            document
                .getElementById("occupation")
                .value;


        const income =
            document
                .getElementById("income")
                .value;


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !name ||
            !age ||
            !gender ||
            !state ||
            !district ||
            !area_type ||
            !caste ||
            !occupation ||
            !income
        ) {

            profileMessage.textContent =
                "कृपया सर्व आवश्यक माहिती भरा.";

            profileMessage.style.color =
                "red";

            return;

        }


        // =================================================
        // AGE VALIDATION
        // =================================================

        const numericAge =
            Number(age);


        if (
            !Number.isInteger(numericAge) ||
            numericAge < 1 ||
            numericAge > 120
        ) {

            profileMessage.textContent =
                "कृपया योग्य वय भरा.";

            profileMessage.style.color =
                "red";

            return;

        }


        // =================================================
        // PROFILE DATA
        // =================================================

        const profileData = {

            mobile: mobile,

            name: name,

            age: numericAge,

            gender: gender,

            state: state,

            district: district,

            area_type: area_type,

            caste: caste,

            occupation: occupation,

            income: income

        };


        console.log(
            "PROFILE DATA:",
            profileData
        );


        // =================================================
        // BUTTON LOADING
        // =================================================

        submitBtn.disabled = true;

        submitBtn.textContent =
            "Profile तयार होत आहे...";

        profileMessage.textContent =
            "";


        // =================================================
        // API REQUEST
        // =================================================

        try {

            const response =
                await fetch(
                    API_URL,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                profileData
                            )

                    }
                );


            const text =
                await response.text();


            console.log(
                "Backend Status:",
                response.status
            );


            console.log(
                "Backend Response:",
                text
            );


            // =================================================
            // BACKEND ERROR
            // =================================================

            if (!response.ok) {

                let errorMessage =
                    "Profile save झाला नाही.";

                try {

                    const errorData =
                        JSON.parse(text);

                    errorMessage =
                        errorData.error ||
                        errorData.message ||
                        errorMessage;

                } catch (error) {

                    console.error(
                        "Backend Error Response:",
                        text
                    );

                }


                profileMessage.textContent =
                    errorMessage;

                profileMessage.style.color =
                    "red";

                return;

            }


            // =================================================
            // JSON RESPONSE
            // =================================================

            let data;

            try {

                data =
                    JSON.parse(text);

            } catch (error) {

                console.error(
                    "Invalid JSON Response:",
                    text
                );

                profileMessage.textContent =
                    "Backend कडून योग्य response मिळाला नाही.";

                profileMessage.style.color =
                    "red";

                return;

            }


            // =================================================
            // USER CHECK
            // =================================================

            if (!data.user) {

                console.error(
                    "Backend response मध्ये user data नाही:",
                    data
                );

                profileMessage.textContent =
                    "Profile तयार झाले पण user data मिळाले नाही.";

                profileMessage.style.color =
                    "red";

                return;

            }


            // =================================================
            // SAVE USER
            // =================================================

            // Dashboard आणि बाकी pages साठी
            // एकच localStorage key वापरतो.

            localStorage.setItem(
                "jansaarthiUser",
                JSON.stringify(
                    data.user
                )
            );


            // Mobile सुद्धा कायम ठेवतो.
            // Profile page पुन्हा Login वर redirect होऊ नये.

            localStorage.setItem(
                "jansaarthi_mobile",
                mobile
            );


            console.log(
                "USER SAVED:",
                data.user
            );


            console.log(
                "MOBILE SAVED:",
                mobile
            );


            // =================================================
            // SUCCESS
            // =================================================

            profileMessage.textContent =
                "✓ Profile यशस्वीरित्या तयार झाले!";

            profileMessage.style.color =
                "green";


            // =================================================
            // GO TO DASHBOARD
            // =================================================

            setTimeout(
                function () {

                    window.location.href =
                        "dashboard.html";

                },
                1200
            );


        } catch (error) {

            console.error(
                "PROFILE ERROR:",
                error
            );


            profileMessage.textContent =
                "Server शी संपर्क होऊ शकला नाही.";

            profileMessage.style.color =
                "red";


        } finally {

            submitBtn.disabled = false;

            submitBtn.textContent =
                "Profile तयार करा →";

        }

    }
);