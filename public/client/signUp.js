const signupForm = document.getElementById("signupForm");
const fullname = document.getElementById("fullname");
const email = document.getElementById("email");
const password = document.getElementById("password");
const formMessage = document.getElementById("formMessage");
const createAccountBtn = document.getElementById("createAccountBtn");

const passwordToggle = document.getElementById("passwordToggle");
const passwordIcon = document.getElementById("passwordIcon");

const showMessage = (message, type) => {
    formMessage.textContent = message;
    formMessage.className = "form-message " + type;
};


passwordToggle.addEventListener("click", () => {
    if (password.type === "password") {
        password.type = "text";
        passwordIcon.className = "bi bi-eye";
        passwordToggle.setAttribute("aria-label", "Hide password");
        passwordToggle.setAttribute("aria-pressed", "true");
    } else {
        password.type = "password";
        passwordIcon.className = "bi bi-eye-slash";
        passwordToggle.setAttribute("aria-label", "Show password");
        passwordToggle.setAttribute("aria-pressed", "false");
    }
});



