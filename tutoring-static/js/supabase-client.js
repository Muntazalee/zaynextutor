// Shared Supabase client + helpers used across all pages
const SUPABASE_URL = "https://pzleipgblrygjjddhanl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6bGVpcGdibHJ5Z2pqZGRoYW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwOTcyNDgsImV4cCI6MjA5OTY3MzI0OH0.y5faMf7j6BWNJCWMmWpdDe68HJXTaqjTSLa7blSz84o";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const FACULTIES = {
  "Faculty of Science": [
    "Physics",
    "Chemistry",
    "Microbiology",
    "Biochemistry",
    "Zoology",
    "Botany",
    "Computer Science",
    "Statistics",
    "Mathematics",
    "Science and Laboratory Technology",
  ],
  "Faculty of Basic Medical Sciences": [
    "Nursing Sciences",
    "Anatomy",
    "Physiology",
    "Pharmacology",
    "Environmental Health",
    "Public Health",
  ],
  "Faculty of Agriculture": [
    "Animal Science",
    "Crop Science",
    "Soil Science",
    "Agric Economics",
    "Agric Extension",
  ],
  "Faculty of Education": [
    "Physics Education",
    "Chemistry Education",
    "Biology Education",
    "Mathematics Education",
    "English Education",
    "Computer Education",
  ],
  "Faculty of Pharmaceutical Sciences": [
    "Pharmacy",
  ],
};

const LEVELS = ["100", "200", "300", "400", "500"];

const LEARNING_FORMATS = [
  "WhatsApp Group",
  "WhatsApp DM",
  "Physical Study Group",
  "Online Session",
  "Other",
];

function populateFacultyOptions(selectEl, selectedValue) {
  Object.keys(FACULTIES).forEach((faculty) => {
    const opt = document.createElement("option");
    opt.value = faculty;
    opt.textContent = faculty;
    if (faculty === selectedValue) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

function populateDepartmentOptionsForFaculty(selectEl, faculty, selectedValue) {
  selectEl.innerHTML = "";
  const depts = FACULTIES[faculty] || [];
  depts.forEach((dept) => {
    const opt = document.createElement("option");
    opt.value = dept;
    opt.textContent = dept;
    if (dept === selectedValue) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

function getFacultyForDepartment(department) {
  for (const [faculty, depts] of Object.entries(FACULTIES)) {
    if (depts.includes(department)) return faculty;
  }
  return null;
}

function populateLevelOptions(selectEl, selectedValue) {
  LEVELS.forEach((lvl) => {
    const opt = document.createElement("option");
    opt.value = lvl;
    opt.textContent = `${lvl} Level`;
    if (lvl === selectedValue) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

function populateFormatCheckboxes(containerEl, name, selectedValues = []) {
  LEARNING_FORMATS.forEach((format, i) => {
    const id = `${name}-${i}`;
    const wrap = document.createElement("label");
    wrap.className = "format-check";
    wrap.innerHTML = `<input type="checkbox" id="${id}" value="${format}" ${selectedValues.includes(format) ? "checked" : ""}><span>${format}</span>`;
    containerEl.appendChild(wrap);
  });
}

function showFlash(message, type) {
  const container = document.getElementById("flash-container");
  if (!container) return;
  const div = document.createElement("div");
  div.className = `flash ${type}`;
  div.textContent = message;
  container.innerHTML = "";
  container.appendChild(div);
}

async function requireAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  return session;
}

async function renderNav() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const authLinks = document.querySelectorAll("[data-auth-only]");
  const guestLinks = document.querySelectorAll("[data-guest-only]");
  const userNameEls = document.querySelectorAll("[data-user-name]");
  const userInitialEls = document.querySelectorAll("[data-user-initial]");

  // Inject icons into every nav link (sidebar + mobile dropdown alike)
  document.querySelectorAll("a[data-nav]").forEach((a) => {
    const href = a.getAttribute("href");
    if (NAV_ICONS[href] && !a.querySelector("svg")) {
      a.innerHTML = `<span class="nav-icon">${NAV_ICONS[href]}</span>${a.textContent}`;
    }
  });
  document.querySelectorAll("a[data-guest-only]").forEach((a) => {
    const href = a.getAttribute("href");
    if (NAV_ICONS[href] && !a.querySelector("svg")) {
      a.innerHTML = `<span class="nav-icon">${NAV_ICONS[href]}</span>${a.textContent}`;
    }
  });

  if (session) {
    authLinks.forEach((el) => (el.style.display = ""));
    guestLinks.forEach((el) => (el.style.display = "none"));

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name")
      .eq("id", session.user.id)
      .single();

    const name = profile?.full_name || session.user.email;
    userNameEls.forEach((el) => (el.textContent = name));
    userInitialEls.forEach((el) => (el.textContent = name[0]?.toUpperCase() || "?"));
  } else {
    authLinks.forEach((el) => (el.style.display = "none"));
    guestLinks.forEach((el) => (el.style.display = ""));
  }

  // Highlight active nav link based on current page
  const current = window.location.pathname.split("/").pop() || "discover.html";
  document.querySelectorAll("a[data-nav]").forEach((a) => {
    if (a.getAttribute("href") === current) a.classList.add("active");
  });
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "discover.html";
}

const NAV_ICONS = {
  "discover.html": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  "my-learning.html": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  "teach.html": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h20v14H2z"/><path d="M8 21h8M12 17v4"/></svg>',
  "profile.html": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
  "login.html": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>',
  "logout": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
};

function initMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  const dropdown = document.getElementById("mobile-menu-dropdown");
  if (!btn || !dropdown) return;

  // Inject icons into whichever nav links this page's dropdown has
  dropdown.querySelectorAll("a[data-nav], a[data-guest-only]").forEach((a) => {
    const href = a.getAttribute("href");
    if (NAV_ICONS[href] && !a.querySelector("svg")) {
      a.innerHTML = `<span class="nav-icon">${NAV_ICONS[href]}</span>${a.textContent}`;
    }
  });

  // Ensure every page's dropdown has a Sign Out option, shown only when logged in
  if (!document.getElementById("mobile-logout-link")) {
    const logoutLink = document.createElement("a");
    logoutLink.href = "#";
    logoutLink.id = "mobile-logout-link";
    logoutLink.setAttribute("data-auth-only", "");
    logoutLink.style.display = "none";
    logoutLink.style.color = "#B3261E";
    logoutLink.innerHTML = `<span class="nav-icon">${NAV_ICONS.logout}</span>Sign Out`;
    dropdown.appendChild(logoutLink);
  } else if (!document.getElementById("mobile-logout-link").querySelector("svg")) {
    const el = document.getElementById("mobile-logout-link");
    el.innerHTML = `<span class="nav-icon">${NAV_ICONS.logout}</span>${el.textContent}`;
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.style.display === "flex";
    dropdown.style.display = isOpen ? "none" : "flex";
    btn.classList.toggle("open", !isOpen);
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.style.display = "none";
      btn.classList.remove("open");
    }
  });

  const mobileLogout = document.getElementById("mobile-logout-link");
  if (mobileLogout) {
    mobileLogout.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}

async function getCurrentProfile() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return null;
  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  return profile ? { ...profile, session } : null;
}
