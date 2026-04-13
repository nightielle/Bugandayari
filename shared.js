"use strict";

// ── KEYS ────────────────────────────────────────────────────
const KEYS = {
  PRICES: "bdyari_prices",
  UPDATED: "bdyari_prices_updated",
  ADMIN_PW: "bdyari_admin_pw",
  ACCOUNTS: "bdyari_accounts",
  SESSION: "bdyari_session",
  WEATHER: "bdyari_weather_cache",
};

// ── PER-USER KEYS ────────────────────────────────────────────
function userKey(base, userId) {
  return base + "_" + userId;
}

// ── ACCOUNTS ─────────────────────────────────────────────────
const Accounts = {
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.ACCOUNTS)) || [];
    } catch {
      return [];
    }
  },
  save(accounts) {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  },
  find(username) {
    return this.getAll().find(
      (a) => a.username.toLowerCase() === username.toLowerCase(),
    );
  },
  findById(id) {
    return this.getAll().find((a) => a.id === id);
  },
  register(username, password) {
    if (!username || username.trim().length < 3)
      return { ok: false, msg: "Kailangan ng 3+ karakter ang username." };
    if (!password || password.length < 6)
      return { ok: false, msg: "Kailangan ng 6+ karakter ang password." };
    if (this.find(username))
      return { ok: false, msg: "Ginagamit na ang username na ito." };
    const accounts = this.getAll();
    const newAccount = {
      id: genId(),
      username: username.trim(),
      password: password,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };
    accounts.push(newAccount);
    this.save(accounts);
    return { ok: true, account: newAccount };
  },
  login(username, password) {
    const acc = this.find(username);
    if (!acc) return { ok: false, msg: "Hindi nahanap ang username." };
    if (acc.password !== password)
      return { ok: false, msg: "Mali ang password." };
    const accounts = this.getAll();
    const i = accounts.findIndex((a) => a.id === acc.id);
    if (i > -1) accounts[i].lastLogin = new Date().toISOString();
    this.save(accounts);
    return { ok: true, account: accounts[i] };
  },
  deleteAccount(userId) {
    const accounts = this.getAll().filter((a) => a.id !== userId);
    this.save(accounts);
    localStorage.removeItem(userKey("bdyari_crops", userId));
    localStorage.removeItem(userKey("bdyari_expenses", userId));
  },
};

// ── SESSION ───────────────────────────────────────────────────
const Session = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.SESSION));
    } catch {
      return null;
    }
  },
  set(account) {
    localStorage.setItem(
      KEYS.SESSION,
      JSON.stringify({
        userId: account.id,
        username: account.username,
        loginAt: new Date().toISOString(),
      }),
    );
  },
  clear() {
    localStorage.removeItem(KEYS.SESSION);
  },
  isLoggedIn() {
    return !!this.get();
  },
};

// ── DEFAULT PRICES ───────────────────────────────────────────
const DEFAULT_PRICES = [
  {
    id: "p1",
    category: "Bigas",
    name: "Bigas — Regular Milled",
    unit: "kilo",
    price: 42,
    trend: "same",
  },
  {
    id: "p2",
    category: "Bigas",
    name: "Bigas — Well Milled",
    unit: "kilo",
    price: 47,
    trend: "up",
  },
  {
    id: "p3",
    category: "Bigas",
    name: "Bigas — Premium",
    unit: "kilo",
    price: 54,
    trend: "up",
  },
  {
    id: "p4",
    category: "Bigas",
    name: "Palay — Dry",
    unit: "kilo",
    price: 19,
    trend: "down",
  },
  {
    id: "p5",
    category: "Bigas",
    name: "Palay — Wet",
    unit: "kilo",
    price: 15,
    trend: "same",
  },
  {
    id: "p6",
    category: "Mais",
    name: "Mais — Yellow (Dry)",
    unit: "kilo",
    price: 22,
    trend: "same",
  },
  {
    id: "p7",
    category: "Mais",
    name: "Mais — White (Dry)",
    unit: "kilo",
    price: 20,
    trend: "down",
  },
  {
    id: "p8",
    category: "Mais",
    name: "Mais — Green/Sweet",
    unit: "piraso",
    price: 18,
    trend: "up",
  },
  {
    id: "p9",
    category: "Gulay",
    name: "Ampalaya",
    unit: "kilo",
    price: 80,
    trend: "up",
  },
  {
    id: "p10",
    category: "Gulay",
    name: "Sitaw",
    unit: "kilo",
    price: 55,
    trend: "same",
  },
  {
    id: "p11",
    category: "Gulay",
    name: "Kamatis",
    unit: "kilo",
    price: 65,
    trend: "down",
  },
  {
    id: "p12",
    category: "Gulay",
    name: "Talong",
    unit: "kilo",
    price: 50,
    trend: "same",
  },
  {
    id: "p13",
    category: "Gulay",
    name: "Okra",
    unit: "kilo",
    price: 45,
    trend: "up",
  },
  {
    id: "p14",
    category: "Gulay",
    name: "Repolyo",
    unit: "kilo",
    price: 35,
    trend: "down",
  },
  {
    id: "p15",
    category: "Gulay",
    name: "Kangkong",
    unit: "bigkis",
    price: 20,
    trend: "same",
  },
  {
    id: "p16",
    category: "Gulay",
    name: "Pechay",
    unit: "kilo",
    price: 40,
    trend: "same",
  },
  {
    id: "p17",
    category: "Gulay",
    name: "Patola",
    unit: "kilo",
    price: 38,
    trend: "up",
  },
  {
    id: "p18",
    category: "Gulay",
    name: "Upo",
    unit: "kilo",
    price: 30,
    trend: "down",
  },
  {
    id: "p19",
    category: "Prutas",
    name: "Saging — Lakatan",
    unit: "kilo",
    price: 70,
    trend: "up",
  },
  {
    id: "p20",
    category: "Prutas",
    name: "Saging — Latundan",
    unit: "kilo",
    price: 55,
    trend: "same",
  },
  {
    id: "p21",
    category: "Prutas",
    name: "Mangga — Hinog",
    unit: "kilo",
    price: 90,
    trend: "up",
  },
  {
    id: "p22",
    category: "Prutas",
    name: "Mangga — Hilaw",
    unit: "kilo",
    price: 40,
    trend: "same",
  },
  {
    id: "p23",
    category: "Prutas",
    name: "Papaya — Hinog",
    unit: "kilo",
    price: 30,
    trend: "down",
  },
  {
    id: "p24",
    category: "Prutas",
    name: "Lansones",
    unit: "kilo",
    price: 120,
    trend: "up",
  },
  {
    id: "p25",
    category: "Prutas",
    name: "Rambutan",
    unit: "kilo",
    price: 80,
    trend: "up",
  },
  {
    id: "p26",
    category: "Ugat",
    name: "Kamote — Orange",
    unit: "kilo",
    price: 35,
    trend: "same",
  },
  {
    id: "p27",
    category: "Ugat",
    name: "Kamote — Purple",
    unit: "kilo",
    price: 40,
    trend: "up",
  },
  {
    id: "p28",
    category: "Ugat",
    name: "Gabi",
    unit: "kilo",
    price: 45,
    trend: "down",
  },
  {
    id: "p29",
    category: "Ugat",
    name: "Ube",
    unit: "kilo",
    price: 80,
    trend: "same",
  },
  {
    id: "p30",
    category: "Ugat",
    name: "Luya",
    unit: "kilo",
    price: 120,
    trend: "up",
  },
  {
    id: "p31",
    category: "Ugat",
    name: "Sibuyas",
    unit: "kilo",
    price: 90,
    trend: "up",
  },
  {
    id: "p32",
    category: "Ugat",
    name: "Bawang",
    unit: "kilo",
    price: 200,
    trend: "down",
  },
];

const CATEGORY_META = {
  Bigas: { icon: "🌾", color: "#c8a45a" },
  Mais: { icon: "🌽", color: "#d4903a" },
  Gulay: { icon: "🥬", color: "#4a8c3f" },
  Prutas: { icon: "🍌", color: "#c0693a" },
  Ugat: { icon: "🥕", color: "#a0522d" },
};

// ── STORE ─────────────────────────────────────────────────────
const Store = {
  getCrops(userId) {
    const uid = userId || Session.get()?.userId;
    if (!uid) return [];
    try {
      return (
        JSON.parse(localStorage.getItem(userKey("bdyari_crops", uid))) || []
      );
    } catch {
      return [];
    }
  },
  saveCrops(crops, userId) {
    const uid = userId || Session.get()?.userId;
    if (!uid) return;
    localStorage.setItem(userKey("bdyari_crops", uid), JSON.stringify(crops));
  },
  clearCrops(userId) {
    const uid = userId || Session.get()?.userId;
    if (!uid) return;
    localStorage.removeItem(userKey("bdyari_crops", uid));
  },
  getPrices() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEYS.PRICES));
      return stored && stored.length ? stored : [...DEFAULT_PRICES];
    } catch {
      return [...DEFAULT_PRICES];
    }
  },
  savePrices(prices) {
    localStorage.setItem(KEYS.PRICES, JSON.stringify(prices));
    localStorage.setItem(KEYS.UPDATED, new Date().toISOString());
  },
  getPricesUpdated() {
    const raw = localStorage.getItem(KEYS.UPDATED);
    if (!raw) return null;
    const d = new Date(raw);
    return d.toLocaleDateString("fil-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },
  getAdminPw() {
    return localStorage.getItem(KEYS.ADMIN_PW) || "admin1234";
  },
  setAdminPw(pw) {
    localStorage.setItem(KEYS.ADMIN_PW, pw);
  },
  getExpenses(userId) {
    const uid = userId || Session.get()?.userId;
    if (!uid) return [];
    try {
      return (
        JSON.parse(localStorage.getItem(userKey("bdyari_expenses", uid))) || []
      );
    } catch {
      return [];
    }
  },
  saveExpenses(list, userId) {
    const uid = userId || Session.get()?.userId;
    if (!uid) return;
    localStorage.setItem(userKey("bdyari_expenses", uid), JSON.stringify(list));
  },
  getExpensesForCrop(cropId, userId) {
    return this.getExpenses(userId).filter((e) => e.cropId === cropId);
  },
  addExpense(entry, userId) {
    const list = this.getExpenses(userId);
    list.push({ ...entry, id: genId(), date: entry.date || todayISO() });
    this.saveExpenses(list, userId);
  },
  deleteExpense(id, userId) {
    this.saveExpenses(
      this.getExpenses(userId).filter((e) => e.id !== id),
      userId,
    );
  },
  getCachedWeather() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEYS.WEATHER));
      if (!raw) return null;
      if (Date.now() - raw.ts > 3600000) return null;
      return raw.data;
    } catch {
      return null;
    }
  },
  setCachedWeather(data) {
    localStorage.setItem(
      KEYS.WEATHER,
      JSON.stringify({ ts: Date.now(), data }),
    );
  },
};

// ── UTILITIES ────────────────────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function escHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso.slice(0, 10) + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("fil-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("fil-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysUntil(iso) {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(iso.slice(0, 10) + "T00:00:00");
  return Math.round((t - today) / 86400000);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
