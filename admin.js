/* =========================================================
   ADMIN PANEL - JavaScript
   এই ফাইলে আছে: লগইন, লগআউট, ভিসা লিস্ট লোড, স্ট্যাটাস আপডেট

   *** গুরুত্বপূর্ণ ***
   এই ফাইল আপনার নিজের ব্যাকএন্ড (সার্ভার + ডাটাবেস) এর সাথে
   কানেক্ট করার জন্য বানানো হয়েছে। নিচের CONFIG অংশে আপনার
   আসল API URL দিয়ে দিন। ব্যাকএন্ড ছাড়া এই প্যানেল শুধু UI
   দেখাবে, ডাটাবেসে আসল কোনো পরিবর্তন হবে না।

   সিকিউরিটি নোট: পাসওয়ার্ড যাচাই এবং অ্যাডমিন পরিচয় যাচাই
   সবসময় সার্ভার সাইডে (ব্যাকএন্ডে) হতে হবে। শুধু এই
   ফ্রন্টএন্ড ফাইল দিয়ে আপনার ডাটা সুরক্ষিত থাকবে না।
   ========================================================= */

const CONFIG = {
  // আপনার ব্যাকএন্ড API এর বেস URL এখানে দিন
  // উদাহরণ: "https://api.yoursite.com" বা "http://localhost:5000"
  API_BASE_URL: "https://aus-gov-bd.vercel.app/api",

  // টেস্টিং এর জন্য MOCK_MODE = true রাখলে কোনো ব্যাকএন্ড ছাড়াই
  // ডেমো ডাটা দিয়ে UI টেস্ট করতে পারবেন।
  // আসল ব্যাকএন্ড কানেক্ট করার পর এটা false করে দিন।
  MOCK_MODE: true,
};

/* =========================================================
   *** শুধুমাত্র টেস্টিং/ডেমোর জন্য ***
   এই username/password শুধু MOCK_MODE = true থাকা অবস্থায়
   কাজ করবে। এটা কোনো আসল সিকিউরিটি না — যেকেউ ব্রাউজারের
   "View Page Source" থেকে এটা দেখতে পারবে। ব্যাকএন্ড রেডি
   হওয়ার পর এই অংশটা পুরোপুরি ডিলিট করে দিতে হবে এবং পাসওয়ার্ড
   চেকিং সার্ভারে (হ্যাশ করা অবস্থায়) করতে হবে।

   ⚠️ পরামর্শ: GitHub রিপোতে পুশ করার আগে এই credentials
   বদলে ফেলুন বা রিপো প্রাইভেট রাখুন, যাতে আসল পাসওয়ার্ড
   পাবলিকভাবে কেউ দেখতে না পায়।
   ========================================================= */
const DEMO_CREDENTIALS = {
  username: "808212",
  password: "808212",
};

/* =========================================================
   MOCK ডাটা (শুধুমাত্র MOCK_MODE = true থাকলে ব্যবহার হবে)
   ========================================================= */
let mockVisaData = [
  { id: 1, passportNumber: "AB1234567", applicantName: "করিম রহমান", status: "Pending", updatedAt: "2026-06-18" },
  { id: 2, passportNumber: "CD9876543", applicantName: "সাবিনা ইসলাম", status: "Approved", updatedAt: "2026-06-15" },
  { id: 3, passportNumber: "EF5556667", applicantName: "জাহিদ হাসান", status: "Rejected", updatedAt: "2026-06-10" },
];

/* =========================================================
   ছোট হেল্পার ফাংশন
   ========================================================= */

// localStorage এ admin এর session token রাখা হয়
function getToken() {
  return localStorage.getItem("adminToken");
}

function setToken(token) {
  localStorage.setItem("adminToken", token);
}

function clearToken() {
  localStorage.removeItem("adminToken");
}

// টোস্ট মেসেজ দেখানোর ফাংশন (সফল/এরর নোটিফিকেশন)
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast toast--${type}`;
  toast.hidden = false;
  setTimeout(() => {
    toast.hidden = true;
  }, 3000);
}

// স্ট্যাটাস অনুযায়ী ব্যাজের HTML তৈরি করে
function statusBadgeHtml(status) {
  const cls = status.toLowerCase(); // pending / approved / rejected
  return `<span class="status-badge status-badge--${cls}">${status}</span>`;
}

/* =========================================================
   ১. লগইন
   ========================================================= */

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const loginBtn = document.getElementById("loginBtn");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  loginError.hidden = true;
  loginBtn.disabled = true;
  loginBtn.querySelector(".btn__text").textContent = "লগইন হচ্ছে...";

  try {
    let token;

    if (CONFIG.MOCK_MODE) {
      // ডেমো মোডে নির্দিষ্ট DEMO_CREDENTIALS এর সাথে মিলিয়ে চেক করা হয়
      await new Promise((r) => setTimeout(r, 500)); // লোডিং এর অনুভূতি দেওয়ার জন্য
      if (username !== DEMO_CREDENTIALS.username || password !== DEMO_CREDENTIALS.password) {
        throw new Error("ভুল ইউজারনেম বা পাসওয়ার্ড");
      }
      token = "mock-demo-token";
    } else {
      // ============================================
      // আসল ব্যাকএন্ডে লগইন রিকোয়েস্ট
      // আপনার ব্যাকএন্ডে POST /admin/login এন্ডপয়েন্ট
      // থাকতে হবে যা username/password চেক করে একটি
      // JWT/session token রিটার্ন করবে।
      // ============================================
      const response = await fetch(`${CONFIG.API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("ভুল ইউজারনেম বা পাসওয়ার্ড");
      }

      const data = await response.json();
      token = data.token; // ব্যাকএন্ড যেই key তে token পাঠাবে সেটা মিলিয়ে নিন
    }

    setToken(token);
    document.getElementById("adminNameLabel").textContent = username;
    showDashboard();
  } catch (err) {
    loginError.textContent = err.message || "লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।";
    loginError.hidden = false;
  } finally {
    loginBtn.disabled = false;
    loginBtn.querySelector(".btn__text").textContent = "Login";
  }
});

/* =========================================================
   ২. লগআউট
   ========================================================= */

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearToken();
  document.getElementById("dashboardScreen").hidden = true;
  document.getElementById("loginScreen").hidden = false;
  loginForm.reset();
});

/* =========================================================
   ৩. স্ক্রিন সুইচ করা (লগইন <-> ড্যাশবোর্ড)
   ========================================================= */

function showDashboard() {
  document.getElementById("loginScreen").hidden = true;
  document.getElementById("dashboardScreen").hidden = false;
  loadVisaList();
}

/* =========================================================
   ৪. ভিসা লিস্ট লোড করা এবং টেবিলে দেখানো
   ========================================================= */

let currentVisaList = []; // বর্তমানে টেবিলে যা দেখানো আছে

async function fetchVisaList(passportFilter = "") {
  if (CONFIG.MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    if (!passportFilter) return mockVisaData;
    return mockVisaData.filter((v) =>
      v.passportNumber.toLowerCase().includes(passportFilter.toLowerCase())
    );
  }

  // ============================================
  // আসল ব্যাকএন্ড থেকে ভিসা লিস্ট আনা
  // GET /visa-applications?passport=XXXX
  // ============================================
  const url = passportFilter
    ? `${CONFIG.API_BASE_URL}/visa-applications?passport=${encodeURIComponent(passportFilter)}`
    : `${CONFIG.API_BASE_URL}/visa-applications`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) {
    throw new Error("ডাটা লোড করতে সমস্যা হয়েছে।");
  }

  return response.json();
}

async function loadVisaList(passportFilter = "") {
  const tbody = document.getElementById("visaTableBody");
  tbody.innerHTML = `<tr><td colspan="5" class="data-table__empty">লোড হচ্ছে...</td></tr>`;

  try {
    const list = await fetchVisaList(passportFilter);
    currentVisaList = list;
    renderTable(list);
    renderStats(list);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="data-table__empty">${err.message}</td></tr>`;
  }
}

function renderTable(list) {
  const tbody = document.getElementById("visaTableBody");

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="data-table__empty">কোনো রেকর্ড পাওয়া যায়নি।</td></tr>`;
    return;
  }

  tbody.innerHTML = list
    .map(
      (item) => `
      <tr>
        <td>${item.passportNumber}</td>
        <td>${item.applicantName}</td>
        <td>${statusBadgeHtml(item.status)}</td>
        <td>${item.updatedAt}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn--small btn--success-outline" data-action="approve" data-id="${item.id}">Approve</button>
            <button class="btn btn--small btn--ghost" data-action="pending" data-id="${item.id}">Pending</button>
            <button class="btn btn--small btn--danger-outline" data-action="reject" data-id="${item.id}">Reject</button>
          </div>
        </td>
      </tr>`
    )
    .join("");
}

function renderStats(list) {
  document.getElementById("statTotal").textContent = list.length;
  document.getElementById("statPending").textContent = list.filter((v) => v.status === "Pending").length;
  document.getElementById("statApproved").textContent = list.filter((v) => v.status === "Approved").length;
  document.getElementById("statRejected").textContent = list.filter((v) => v.status === "Rejected").length;
}

/* =========================================================
   ৫. সার্চ এবং রিফ্রেশ বাটন
   ========================================================= */

document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const passport = document.getElementById("searchPassport").value.trim();
  loadVisaList(passport);
});

document.getElementById("showAllBtn").addEventListener("click", () => {
  document.getElementById("searchPassport").value = "";
  loadVisaList();
});

document.getElementById("refreshBtn").addEventListener("click", () => {
  const passport = document.getElementById("searchPassport").value.trim();
  loadVisaList(passport);
});

/* =========================================================
   ৬. স্ট্যাটাস আপডেট (Approve / Pending / Reject বাটনে ক্লিক)
   ========================================================= */

const actionToStatus = {
  approve: "Approved",
  pending: "Pending",
  reject: "Rejected",
};

let pendingUpdate = null; // কনফার্মেশন মোডালে যেই আপডেটটা অপেক্ষা করছে

document.getElementById("visaTableBody").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = btn.dataset.id;
  const newStatus = actionToStatus[btn.dataset.action];
  const item = currentVisaList.find((v) => String(v.id) === String(id));
  if (!item) return;

  pendingUpdate = { id, newStatus, passportNumber: item.passportNumber };

  document.getElementById("confirmModalText").textContent =
    `পাসপোর্ট নম্বর ${item.passportNumber} এর স্ট্যাটাস "${item.status}" থেকে "${newStatus}" করতে চান?`;
  document.getElementById("confirmModal").hidden = false;
});

document.getElementById("confirmCancelBtn").addEventListener("click", () => {
  pendingUpdate = null;
  document.getElementById("confirmModal").hidden = true;
});

document.getElementById("confirmOkBtn").addEventListener("click", async () => {
  if (!pendingUpdate) return;
  document.getElementById("confirmModal").hidden = true;

  try {
    await updateVisaStatus(pendingUpdate.id, pendingUpdate.newStatus);
    showToast(`স্ট্যাটাস সফলভাবে "${pendingUpdate.newStatus}" করা হয়েছে।`, "success");
    loadVisaList(document.getElementById("searchPassport").value.trim());
  } catch (err) {
    showToast(err.message || "আপডেট করতে সমস্যা হয়েছে।", "error");
  } finally {
    pendingUpdate = null;
  }
});

async function updateVisaStatus(id, newStatus) {
  if (CONFIG.MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    const record = mockVisaData.find((v) => v.id === Number(id));
    if (record) {
      record.status = newStatus;
      record.updatedAt = new Date().toISOString().slice(0, 10);
    }
    return;
  }

  // ============================================
  // আসল ব্যাকএন্ডে স্ট্যাটাস আপডেট করার রিকোয়েস্ট
  // PATCH /visa-applications/:id  body: { status: newStatus }
  // ব্যাকএন্ডে গিয়ে এই id দিয়ে ডাটাবেসে UPDATE কুয়েরি
  // চালাতে হবে (passport number দিয়েও করতে পারেন,
  // আপনার ডাটাবেস ডিজাইন অনুযায়ী)।
  // ============================================
  const response = await fetch(`${CONFIG.API_BASE_URL}/visa-applications/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!response.ok) {
    throw new Error("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
  }
}

/* =========================================================
   ৭. পেজ লোড হওয়ার সময় চেক করা - আগে থেকে লগইন আছে কিনা
   ========================================================= */

(function init() {
  const token = getToken();
  if (token) {
    document.getElementById("adminNameLabel").textContent = "Admin";
    showDashboard();
  }
})();
