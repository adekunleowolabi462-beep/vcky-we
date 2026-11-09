import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const cloudName = "gmgyppqi";
const uploadPreset = "vicky_web_uploads";

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    document.getElementById("profileName").textContent =
        user.displayName || "VICKY WEB Member";

    document.getElementById("profileEmail").textContent =
        user.email || "";

    try {
        const profileRef = doc(db, "users", user.uid);
        const profileSnapshot = await getDoc(profileRef);

        if (profileSnapshot.exists()) {
            const data = profileSnapshot.data();

            document.getElementById("profileUsername").textContent =
                "@" + (data.username || "member");

            if (data.photoURL) {
                const image = document.getElementById("profileImage");
                image.src = data.photoURL;
                image.style.display = "block";
            }
        }
    } catch (error) {
        console.error(error);
    }
});

document.getElementById("uploadPhotoBtn").addEventListener("click", async () => {

    const file = document.getElementById("photoInput").files[0];
    const status = document.getElementById("uploadStatus");

    if (!currentUser) {
        status.textContent = "Please sign in first.";
        return;
    }

    if (!file) {
        status.textContent = "Please select a picture first.";
        return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        status.textContent = "Choose a JPG, PNG or WEBP picture.";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        status.textContent = "Your picture must be smaller than 5MB.";
        return;
    }

    status.textContent = "Uploading picture...";

    try {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error?.message || "Upload failed.");
        }

        await updateDoc(doc(db, "users", currentUser.uid), {
            photoURL: result.secure_url
        });

        const image = document.getElementById("profileImage");
        image.src = result.secure_url;
        image.style.display = "block";

        status.textContent = "Profile picture uploaded successfully!";

    } catch (error) {
        status.textContent = "Upload failed: " + error.message;
    }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
});