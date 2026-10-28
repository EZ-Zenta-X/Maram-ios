
"use strict";

/*
 * MARAM — Browser application
 * This file connects the HTML interface to browser-compatible actions.
 * Keep index.html, style.css and main.js in the same folder.
 */

const $ = (id) => document.getElementById(id);

const state = {
    page: "home",
    contacts: loadJSON("maram_contacts.json", []),
    projects: loadJSON("maram_projects.json", []),
    media: [],
    selectedMedia: -1,
    audioFile: null,
    voiceEnabled: true,
    currentVideoURL: null,
    denied: false
};

/* ---------------- STORAGE ---------------- */

/*
 * Browsers do not allow ordinary web pages to write JSON files
 * directly into their folder. This version uses localStorage.
 */

function loadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
        console.warn("Could not load:", key, error);
        return fallback;
    }
}

function saveJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Could not save:", key, error);
        alert("تعذّر حفظ البيانات في المتصفح. جرّب تصدير نسخة احتياطية.");
    }
}

function saveContacts() {
    saveJSON("maram_contacts.json", state.contacts);
}

function saveProjects() {
    saveJSON("maram_projects.json", state.projects);
}

/* ---------------- LOGIN ---------------- */


/* ---------------- LOGIN — FIXED ---------------- */

/* ---------------- LOGIN — FINAL FIX ---------------- */

function showScreen(id) {
    const screens = document.querySelectorAll(
        ".login-screen, .denied-screen, .maram-app"
    );

    const target = document.getElementById(id);

    if (!target) {
        console.error("MARAM screen not found:", id);
        return false;
    }

    screens.forEach((screen) => {
        const isTarget = screen === target;

        screen.hidden = !isTarget;
        screen.style.display = isTarget ? "" : "none";
    });

    target.hidden = false;
    return true;
}

function setupLogin() {
    const form = $("login-form");
    const emailInput = $("login-email");
    const passwordInput = $("login-password");
    const loginError = $("login-error");
    const returnButton = $("return-login-button");

    if (!form || !passwordInput) {
        console.error(
            "MARAM LOGIN ERROR: login-form or login-password is missing."
        );
        return;
    }

    // Email فارغ ومش مطلوب
    form.noValidate = true;

    if (emailInput) {
        emailInput.required = false;
    }

    const ORIGINAL_PASSWORD = "260607";

    // نمنع إضافة event listener أكثر من مرة
    if (form.dataset.loginReady === "true") return;
    form.dataset.loginReady = "true";

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopPropagation();

        const email = emailInput
            ? emailInput.value.trim()
            : "";

        const password = passwordInput.value;

        // ما نقبلوش Email: لازم يبقى فارغ
        if (email === "" && password === ORIGINAL_PASSWORD) {
            state.denied = false;

            if (loginError) {
                loginError.hidden = true;
                loginError.textContent = "";
            }

            const success = showScreen("maram-app");

            if (success) {
                showPage("home");
                console.log("MARAM: LOGIN SUCCESS");
            }

            return;
        }

        // كلمة سر غالطة أو Email موش فارغ
        state.denied = true;

        if (loginError) {
            loginError.textContent = "ACCESS DENIED";
            loginError.hidden = false;
        }

        const success = showScreen("denied-screen");

        if (!success && loginError) {
            // إذا شاشة DENIED موش موجودة، نبيّن الخطأ في شاشة الدخول
            showScreen("login-screen");
            loginError.textContent =
                "ACCESS DENIED — Check the login details.";
            loginError.hidden = false;
        }

        console.warn("MARAM: LOGIN DENIED");
    });

    // زر RETURN يرجّع لشاشة الدخول
    if (returnButton) {
        returnButton.addEventListener("click", function () {
            passwordInput.value = "";

            if (loginError) {
                loginError.hidden = true;
                loginError.textContent = "";
            }

            state.denied = false;
            showScreen("login-screen");
        });
    }
}

/* ---------------- NAVIGATION ---------------- */


function showPage(pageName) {
    const pages = {
        home: "home-page",
        contacts: "contacts-page",
        projects: "projects-page",
        montage: "montage-page"
    };

    if (!pages[pageName]) {
        console.warn("Unknown MARAM page:", pageName);
        return;
    }

    const mainLayout = $("main-layout") ||
        document.querySelector(".main-layout");

    if (mainLayout) {
        mainLayout.hidden = pageName !== "home";
    }

    Object.values(pages).forEach((id) => {
        const element = $(id);
        if (element) {
            element.hidden = true;
        }
    });

    const target = $(pages[pageName]);

    if (target) {
        target.hidden = false;
        state.page = pageName;
    }

    if (pageName === "contacts") renderContacts();
    if (pageName === "projects") renderProjects();

    if (pageName === "home") {
        const background = $("background-video");
        const girl = $("girl-video");

        if (background) background.play().catch(() => {});
        if (girl) girl.play().catch(() => {});
    }
}



function setupNavigation() {
    $("personal-info-button")?.addEventListener("click", () => {
        showPage("contacts");
    });

    $("saved-projects-button")?.addEventListener("click", () => {
        showPage("projects");
    });

    $("click-test-button")?.addEventListener("click", () => {
        alert("MARAM SYSTEM : CONNECTION TEST");
    });

    $("montage-button")?.addEventListener("click", () => {
        showPage("montage");
    });

    document.querySelectorAll("[data-back-home]").forEach((button) => {
        button.addEventListener("click", () => showPage("home"));
    });

    $("montage-back-button")?.addEventListener("click", () => {
        showPage("home");
    });
}


/* ---------------- CHAT ---------------- */

function addChatMessage(sender, message) {
    const output = $("chat-messages");
    if (!output) return;

    const line = document.createElement("div");    
    line.textContent = sender + ": " + message;

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function processMessage(message) {
    const text = message.toLowerCase().trim();

    if (!text) return;

    if (
        text.includes("contact") ||
        text.includes("contacts")
    ) {
        showPage("contacts");
        return "نحلّك صفحة معلومات الأشخاص.";
    }

    if (
        text.includes("project") ||
        text.includes("projects")
    ) {
        showPage("projects");
        return "نحلّك صفحة المشاريع.";
    }

    if (
        text.includes("montage") ||
        text.includes("video")
    ) {
        showPage("montage");
        return "نحلّك استوديو الفيديو.";
    }

    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("salem") ||
        text.includes("سلام")
    ) {
        return "أهلا بيك! أنا Maram.";
    }

    if (
        text.includes("who are you") ||
        text.includes("chkoun enti") ||
        text.includes("شكون انتي")
    ) {
        return "أنا Maram، المساعدة الافتراضية في هذا البرنامج.";
    }

    return "وصلتني رسالتك. الذكاء الاصطناعي الأصلي يلزمو ربط بخدمة AI باش يجاوب على كل الأسئلة.";
}

function setupChat() {
    const form = $("chat-form");
    const input = $("chat-input");

    if (!form || !input) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const message = input.value.trim();
        if (!message) return;

        addChatMessage("YOU", message);
        input.value = "";

        const response = processMessage(message);

        if (response) {
            addChatMessage("MARAM", response);

            if (state.voiceEnabled) {
                speak(response);
            }
        }
    });
}

/* ---------------- VOICE ---------------- */

function speak(message) {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "ar-TN";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
}

function setupVoice() {
    $("voice-toggle-button")?.addEventListener("click", () => {
        state.voiceEnabled = !state.voiceEnabled;

        const button = $("voice-toggle-button");

        if (button) {
            button.textContent = state.voiceEnabled
                ? "Voice Enabled"
                : "Voice Deafen";
        }

        if (!state.voiceEnabled && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    });
}

/* ---------------- CONTACTS ---------------- */

function renderContacts() {
    const container = $("contacts-list");
    if (!container) return;

    container.replaceChildren();

    if (state.contacts.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "ما فما حتى contact محفوظ.";
        container.appendChild(empty);
        return;
    }

    state.contacts.forEach((contact, index) => {
        const card = document.createElement("article");
        card.className = "contact-card";

        const title = document.createElement("h3");
        title.textContent = [
            contact.firstName || "",
            contact.lastName || ""
        ].join(" ").trim() || "Contact";

        card.appendChild(title);

        [
            ["Phone", contact.phone],
            ["Email", contact.email],
            ["Address", contact.address],
            ["Bio", contact.bio]
        ].forEach(([label, value]) => {
            if (!value) return;

            const paragraph = document.createElement("p");
            paragraph.textContent = label + ": " + value;
            card.appendChild(paragraph);
        });

        const edit = document.createElement("button");
        edit.textContent = "EDIT";
        edit.addEventListener("click", () => editContact(index));

        const remove = document.createElement("button");
        remove.textContent = "DELETE";
        remove.addEventListener("click", () => deleteContact(index));

        card.append(edit, remove);
        container.appendChild(card);
    });
}

function addContact() {
    const firstName = prompt("First Name:");
    if (firstName === null) return;

    const lastName = prompt("Last Name:") || "";
    const phone = prompt("Phone:") || "";
    const email = prompt("Email:") || "";
    const address = prompt("Address:") || "";
    const bio = prompt("Bio:") || "";

    state.contacts.push({
        firstName,
        lastName,
        phone,
        email,
        address,
        bio
    });

    saveContacts();
    renderContacts();
}

function editContact(index) {
    const contact = state.contacts[index];
    if (!contact) return;

    const firstName = prompt("First Name:", contact.firstName || "");
    if (firstName === null) return;

    contact.firstName = firstName;
    contact.lastName = prompt("Last Name:", contact.lastName || "") ?? contact.lastName;
    contact.phone = prompt("Phone:", contact.phone || "") ?? contact.phone;
    contact.email = prompt("Email:", contact.email || "") ?? contact.email;
    contact.address = prompt("Address:", contact.address || "") ?? contact.address;
    contact.bio = prompt("Bio:", contact.bio || "") ?? contact.bio;

    saveContacts();
    renderContacts();
}

function deleteContact(index) {
    if (!confirm("متأكّد تحب تمسح الـ contact هذا؟")) return;

    state.contacts.splice(index, 1);
    saveContacts();
    renderContacts();
}

function setupContacts() {
    $("add-contact-button")?.addEventListener("click", addContact);
}

/* ---------------- PROJECTS ---------------- */

function renderProjects() {
    const container = $("projects-list");
    if (!container) return;

    container.replaceChildren();

    if (state.projects.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "ما فما حتى مشروع محفوظ.";
        container.appendChild(empty);
        return;
    }

    state.projects.forEach((project, index) => {
        const card = document.createElement("article");
        card.className = "project-card";

        const title = document.createElement("h3");
        title.textContent = project.name || "Project";

        const description = document.createElement("p");
        description.textContent = project.description || "";

        card.append(title, description);

        const date = document.createElement("p");
        date.textContent = project.createdAt ? "Created: " + project.createdAt : "";

        card.appendChild(date);

        const edit = document.createElement("button");
        edit.textContent = "EDIT";
        edit.addEventListener("click", () => editProject(index));

        const remove = document.createElement("button");
        remove.textContent = "DELETE";
        remove.addEventListener("click", () => deleteProject(index));

        card.append(edit, remove);
        container.appendChild(card);
    });
}

function addProject() {
    const name = prompt("Project name:");
    if (!name) return;

    const description = prompt("Project description:") || "";

    state.projects.push({
        name,
        description,
        createdAt: new Date().toLocaleString()
    });

    saveProjects();
    renderProjects();
}

function editProject(index) {
    const project = state.projects[index];
    if (!project) return;

    const name = prompt("Project name:", project.name || "");
    if (name === null) return;

    project.name = name;
    project.description =
        prompt("Project description:", project.description || "") ??
        project.description;

    saveProjects();
    renderProjects();
}

function deleteProject(index) {
    if (!confirm("متأكّد تحب تمسح المشروع هذا؟")) return;

    state.projects.splice(index, 1);
    saveProjects();
    renderProjects();
}

function setupProjects() {
    $("add-project-button")?.addEventListener("click", addProject);
}

/* ---------------- MONTAGE: MEDIA LIBRARY ---------------- */

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return String(minutes).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
}

function renderMediaList() {
    const list = $("clip-list");
    if (!list) return;

    list.replaceChildren();

    state.media.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = (index + 1) + ". " + item.file.name;

        if (index === state.selectedMedia) {
            li.classList.add("selected");
        }

        li.addEventListener("click", () => selectMedia(index));
        list.appendChild(li);
    });

    const audioLabel = $("audio-label");
    if (audioLabel) {
        audioLabel.textContent = state.audioFile
            ? state.audioFile.name
            : "No audio selected";
    }
}

function addMediaFiles(fileList, type) {
    const files = Array.from(fileList || []);

    files.forEach((file) => {
        const item = {
            file,
            type,
            url: URL.createObjectURL(file),
            trimStart: 0,
            trimEnd: null
        };

        state.media.push(item);
    });

    if (state.media.length > 0 && state.selectedMedia < 0) {
        state.selectedMedia = 0;
    }

    renderMediaList();

    if (state.selectedMedia >= 0) {
        selectMedia(state.selectedMedia);
    }
}

function selectMedia(index) {
    const item = state.media[index];
    if (!item) return;

    state.selectedMedia = index;

    const video = $("preview-video");
    const placeholder = $("preview-placeholder");

    if (item.type === "video" && video) {
        video.src = item.url;
        video.hidden = false;

        if (placeholder) placeholder.hidden = true;

        video.load();

        video.onloadedmetadata = () => {
            const endInput = $("trim-end");
            if (endInput && !item.trimEnd) {
                endInput.value = video.duration.toFixed(2);
                item.trimEnd = video.duration;
            }

            updateVideoTime();
        };
    } else if (item.type === "audio") {
        if (placeholder) {
            placeholder.hidden = false;
            placeholder.textContent = "AUDIO FILE SELECTED";
        }

        if (video) {
            video.pause();
            video.removeAttribute("src");
            video.hidden = true;
        }
    }

    $("trim-start") && ($("trim-start").value = item.trimStart || 0);
    $("trim-end") && ($("trim-end").value = item.trimEnd || 0);

    const clipInfo = $("clip-info");
    if (clipInfo) clipInfo.textContent = item.file.name;

    renderMediaList();
}

function removeSelectedMedia() {
    const index = state.selectedMedia;
    if (index < 0 || !state.media[index]) return;

    URL.revokeObjectURL(state.media[index].url);
    state.media.splice(index, 1);

    state.selectedMedia = state.media.length
        ? Math.min(index, state.media.length - 1)
        : -1;

    renderMediaList();

    if (state.selectedMedia >= 0) {
        selectMedia(state.selectedMedia);
    } else {
        const video = $("preview-video");
        if (video) {
            video.pause();
            video.removeAttribute("src");
            video.hidden = true;
        }

        const placeholder = $("preview-placeholder");
        if (placeholder) {
            placeholder.hidden = false;
            placeholder.textContent = "IMPORT A VIDEO TO START";
        }
    }
}

function moveSelectedMedia(direction) {
    const index = state.selectedMedia;
    const next = index + direction;

    if (index < 0 || next < 0 || next >= state.media.length) return;

    [state.media[index], state.media[next]] =
        [state.media[next], state.media[index]];

    state.selectedMedia = next;
    renderMediaList();
}

function clearAllMedia() {
    state.media.forEach((item) => URL.revokeObjectURL(item.url));

    state.media = [];
    state.selectedMedia = -1;
    state.audioFile = null;

    const video = $("preview-video");
    if (video) {
        video.pause();
        video.removeAttribute("src");
        video.hidden = true;
    }

    const placeholder = $("preview-placeholder");
    if (placeholder) {
        placeholder.hidden = false;
        placeholder.textContent = "IMPORT A VIDEO TO START";
    }

    renderMediaList();
}

/* ---------------- MONTAGE: PLAYBACK ---------------- */

function updateVideoTime() {
    const video = $("preview-video");
    const label = $("video-time");
    const slider = $("seek-slider");

    if (!video) return;

    if (label) {
        label.textContent =
            formatTime(video.currentTime) + " / " + formatTime(video.duration);
    }

    if (slider && Number.isFinite(video.duration) && video.duration > 0) {
        slider.max = video.duration;
        slider.value = video.currentTime;
    }
}

function setupPlayback() {
    const video = $("preview-video");
    if (!video) return;

    video.addEventListener("timeupdate", updateVideoTime);
    video.addEventListener("loadedmetadata", updateVideoTime);

    $("play-button")?.addEventListener("click", () => {
        video.play().catch((error) => {
            console.warn("Playback could not start:", error);
        });
    });

    $("pause-button")?.addEventListener("click", () => {
        video.pause();
    });


    $("seek-backward-button")?.addEventListener("click", () => {
        video.currentTime = Math.max(0, video.currentTime - 1);
    });

    $("seek-forward-button")?.addEventListener("click", () => {
        const duration = Number.isFinite(video.duration)
            ? video.duration
            : video.currentTime + 1;

        video.currentTime = Math.min(duration, video.currentTime + 1);
    });


    $("seek-slider")?.addEventListener("input", (event) => {
        const value = Number(event.target.value);

        if (Number.isFinite(value) && Number.isFinite(video.duration)) {
            video.currentTime = Math.min(video.duration, Math.max(0, value));
        }
    });
}

/* ---------------- MONTAGE: TRIM SETTINGS ---------------- */

function setupTrim() {
    $("apply-trim-button")?.addEventListener("click", () => {
        const item = state.media[state.selectedMedia];
        if (!item) {
            alert("Importe un clip et sélectionnez-le d'abord.");
            return;
        }

        const start = Number($("trim-start")?.value || 0);
        const end = Number($("trim-end")?.value || 0);

        if (start < 0 || end <= start) {
            alert("Vérifiez les temps de début et de fin.");
            return;
        }

        item.trimStart = start;
        item.trimEnd = end;

        const video = $("preview-video");
        if (video && item.type === "video") {
            video.currentTime = Math.min(start, video.duration || start);
        }

        alert(
            "تم تسجيل إعدادات القص للمعاينة. التصدير النهائي يحتاج محرّك فيديو."
        );
    });

    $("reset-trim-button")?.addEventListener("click", () => {
        const item = state.media[state.selectedMedia];
        if (!item) return;

        item.trimStart = 0;
        item.trimEnd = null;

        if ($("trim-start")) $("trim-start").value = 0;
        if ($("trim-end")) {
            $("trim-end").value = $("preview-video")?.duration || 0;
        }

        const video = $("preview-video");
        if (video) video.currentTime = 0;
    });
}

/* ---------------- MONTAGE: IMPORT / EXPORT ---------------- */

function setupMediaImport() {
    $("import-video-button")?.addEventListener("click", () => {
        $("video-file-input")?.click();
    });

    $("import-audio-button")?.addEventListener("click", () => {
        $("audio-file-input")?.click();
    });

    $("video-file-input")?.addEventListener("change", (event) => {
        addMediaFiles(event.target.files, "video");
        event.target.value = "";
    });

    $("audio-file-input")?.addEventListener("change", (event) => {
        const files = Array.from(event.target.files || []);

        if (files.length > 0) {
            state.audioFile = files[0];
            renderMediaList();
        }

        event.target.value = "";
    });

    $("remove-selected-button")?.addEventListener("click", removeSelectedMedia);
    $("move-up-button")?.addEventListener("click", () => moveSelectedMedia(-1));
    $("move-down-button")?.addEventListener("click", () => moveSelectedMedia(1));
    $("clear-media-button")?.addEventListener("click", clearAllMedia);

    $("export-video-button")?.addEventListener("click", () => {
        alert(
            "واجهة التصدير موجودة، أمّا إنتاج MP4 بقصّ ودمج المقاطع والصوت يحتاج FFmpeg أو محرّك فيديو متوافق مع المتصفح."
        );
    });
}

/* ---------------- INITIALIZATION ---------------- */

document.addEventListener("DOMContentLoaded", () => {
    setupLogin();

    setupNavigation();
    setupChat();
    setupVoice();
    setupContacts();
    setupProjects();
    setupPlayback();
    setupTrim();
    setupMediaImport();

    renderContacts();
    renderProjects();
    renderMediaList();

    // حضّر الصفحة الرئيسية، لكن خبي التطبيق وراء شاشة الدخول
    showPage("home");
    showScreen("login-screen");
});