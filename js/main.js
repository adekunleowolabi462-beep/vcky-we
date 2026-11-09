import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


const cloudName = "gmgyppqi";
const uploadPreset = "vicky_web_uploads";

let currentUser = null;


// CHECK MEMBER LOGIN
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    document.getElementById("welcomeName").textContent =
        "Hello, " + (user.displayName || user.email);

    await loadPosts();
});


// PUBLISH A POST
document.getElementById("publishPost").addEventListener("click", async () => {

    const text = document.getElementById("postText").value.trim();
    const imageFile = document.getElementById("postImage").files[0];
    const status = document.getElementById("postStatus");

    if (!currentUser) {
        status.textContent = "Please log in first.";
        return;
    }

    if (!text && !imageFile) {
        status.textContent = "Write something or select a picture.";
        return;
    }

    if (imageFile) {

        if (!["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)) {
            status.textContent = "Choose a JPG, PNG or WEBP picture.";
            return;
        }

        if (imageFile.size > 5 * 1024 * 1024) {
            status.textContent = "Picture must be smaller than 5MB.";
            return;
        }
    }

    status.textContent = "Publishing your post...";

    try {

        let imageURL = "";

        if (imageFile) {

            const formData = new FormData();

            formData.append("file", imageFile);
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
                throw new Error(result.error?.message || "Image upload failed.");
            }

            imageURL = result.secure_url;
        }

        await addDoc(collection(db, "posts"), {

            userId: currentUser.uid,

            userName: currentUser.displayName || currentUser.email,

            text: text,

            imageURL: imageURL,

            createdAt: serverTimestamp()

        });

        document.getElementById("postText").value = "";
        document.getElementById("postImage").value = "";

        status.textContent = "Your post has been published!";

        await loadPosts();

    } catch (error) {

        status.textContent = "Error: " + error.message;

    }

});


// DISPLAY POSTS
async function loadPosts() {

    const container = document.getElementById("postsContainer");

    if (!container) return;

    try {

        const snapshot = await getDocs(collection(db, "posts"));

        const posts = snapshot.docs.map(document => ({
            id: document.id,
            ...document.data()
        }));

        posts.sort((a, b) => {
            const dateA = a.createdAt?.toMillis?.() || 0;
            const dateB = b.createdAt?.toMillis?.() || 0;
            return dateB - dateA;
        });

        container.replaceChildren();

        posts.forEach(post => {

            const card = document.createElement("article");
            card.className = "post-card";

            const heading = document.createElement("h3");
            heading.textContent = post.userName || "VICKY WEB Member";

            const paragraph = document.createElement("p");
            paragraph.textContent = post.text || "";

            card.appendChild(heading);
            card.appendChild(paragraph);

            if (post.imageURL) {
                const image = document.createElement("img");
                image.src = post.imageURL;
                image.alt = "Member's shared picture";
                image.style.width = "100%";
                image.style.borderRadius = "10px";
                card.appendChild(image);
            }

            container.appendChild(card);

        });

    } catch (error) {

        console.error("Could not load posts:", error);

    }
}


// LOG OUT
document.getElementById("logoutBtn").addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

});