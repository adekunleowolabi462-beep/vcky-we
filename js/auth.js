import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// REGISTRATION
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const status = document.getElementById("registerStatus");

        if (password !== confirmPassword) {
            if (status) status.textContent = "Passwords do not match.";
            return;
        }

        if (password.length < 6) {
            if (status) status.textContent = "Password must contain at least 6 characters.";
            return;
        }

        try {
            if (status) status.textContent = "Creating your account...";

            const result = await createUserWithEmailAndPassword(
                auth, email, password
            );

            await updateProfile(result.user, {
                displayName: fullName
            });

            await setDoc(doc(db, "users", result.user.uid), {
                fullName,
                username,
                email,
                createdAt: serverTimestamp()
            });

            window.location.href = "home.html";

        } catch (error) {
            if (status) status.textContent = "Registration failed: " + error.message;
            else alert(error.message);
        }
    });
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        const status = document.getElementById("loginStatus");
        const button = document.getElementById("loginButton");

        try {
            if (status) status.textContent = "Logging in...";

            if (button) {
                button.disabled = true;
                button.textContent = "Please wait...";
            }

            await signInWithEmailAndPassword(auth, email, password);

            window.location.href = "home.html";

        } catch (error) {
            if (status) {
                status.textContent = "Login failed: " + error.message;
            } else {
                alert("Login failed: " + error.message);
            }

            if (button) {
                button.disabled = false;
                button.textContent = "Login";
            }
        }
    });
}