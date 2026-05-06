"use strict";


const SUPA_URL = "https://pfeehlpqxhcvqqeqxgfw.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZWVobHBxeGhjdnFxZXF4Z2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NjIxNTAsImV4cCI6MjA5MzUzODE1MH0.ECWVkgs7QcgNW897aIrvW7fUvKjwlEswQyiq88tMa4M";

const { createClient } = supabase;
const db = createClient(SUPA_URL, SUPA_KEY);

let _currentUserId = null;

function setRlsUser(userId) {
  _currentUserId = userId || null;
}

// ── CATEGORY META (UI only — no DB) ─────────────────────────
const CATEGORY_META = {
  Bigas:  { icon: "🌾", color: "#c8a45a" },
  Mais:   { icon: "🌽", color: "#d4903a" },
  Gulay:  { icon: "🥬", color: "#4a8c3f" },
  Prutas: { icon: "🍌", color: "#c0693a" },
  Ugat:   { icon: "🥕", color: "#a0522d" },
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
    year: "numeric", month: "long", day: "numeric",
  });
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("fil-PH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
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

// ── ERROR HELPER ─────────────────────────────────────────────
function supaErr(error, context) {
  console.error(`[Supabase] ${context}:`, error?.message || error);
  return null;
}

// ── ACCOUNTS ─────────────────────────────────────────────────
const Accounts = {
  async find(username) {
    const { data, error } = await db
      .from("accounts")
      .select("*")
      .ilike("username", username)
      .maybeSingle();
    if (error) return supaErr(error, "Accounts.find");
    return data;
  },

  async findById(id) {
    if (!id) return null;
    const { data, error } = await db
      .from("accounts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return supaErr(error, "Accounts.findById");
    return data;
  },

  async register(username, password) {
    if (!username || username.trim().length < 3)
      return { ok: false, msg: "Kailangan ng 3+ karakter ang username." };
    if (!password || password.length < 6)
      return { ok: false, msg: "Kailangan ng 6+ karakter ang password." };

    const existing = await this.find(username);
    if (existing) return { ok: false, msg: "Ginagamit na ang username na ito." };

    const newAccount = {
      id: genId(),
      username: username.trim(),
      password,           // ⚠️ plain-text — consider Supabase Auth for production
      created_at: new Date().toISOString(),
      last_login: null,
    };

    const { data, error } = await db
      .from("accounts")
      .insert(newAccount)
      .select()
      .single();
    if (error) return { ok: false, msg: error.message };
    return { ok: true, account: data };
  },

  async login(username, password) {
    const acc = await this.find(username);
    if (!acc) return { ok: false, msg: "Hindi nahanap ang username." };
    if (acc.password !== password) return { ok: false, msg: "Mali ang password." };

    await db
      .from("accounts")
      .update({ last_login: new Date().toISOString() })
      .eq("id", acc.id);

    return { ok: true, account: acc };
  },

  async deleteAccount(userId) {
    // Crops and expenses are deleted automatically via ON DELETE CASCADE
    const { error } = await db.from("accounts").delete().eq("id", userId);
    if (error) supaErr(error, "Accounts.deleteAccount");
  },

  async getAll() {
    const { data, error } = await db
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("[Supabase] Accounts.getAll:", error?.message); return []; }
    return data || [];
  },
};

// ── SESSION (still localStorage — it's just a token, not data) ──
const Session = {
  get() {
    try { return JSON.parse(localStorage.getItem("bdyari_session")); }
    catch { return null; }
  },
  set(account) {
    const session = {
      userId: account.id,
      username: account.username,
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem("bdyari_session", JSON.stringify(session));
    setRlsUser(account.id);
  },
  clear() {
    localStorage.removeItem("bdyari_session");
    setRlsUser(null);
  },
  isLoggedIn() { return !!this.get(); },
  // Call on every page load to restore the RLS user from the saved session
  restore() {
    const s = this.get();
    if (s?.userId) setRlsUser(s.userId);
    return s;
  },
};

// ── STORE ─────────────────────────────────────────────────────
const Store = {

  // ── CROPS ──────────────────────────────────────────────────
  async getCrops(userId) {
    const uid = userId || _currentUserId;
    if (!uid) return [];
    const { data, error } = await db
      .from("crops")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (error) return supaErr(error, "getCrops") || [];
    return data || [];
  },

  async saveCrop(crop, userId) {
    const uid = userId || _currentUserId;
    if (!uid) {
      console.error("[saveCrop] No user ID — session may not be restored yet.");
      return null;
    }

    // Build the row, always ensuring created_at has a value (never undefined/null)
    const now = new Date().toISOString();
    const row = {
      id: crop.id || genId(),
      user_id: uid,
      name: crop.name,
      planted_at: crop.planted_at,
      harvest_at: crop.harvest_at,
      status: crop.status,
      notes: crop.notes || null,
      unit: crop.unit || "kilo",
      // created_at: use existing value if editing, otherwise now
      created_at: crop.created_at || now,
    };

    // Only include yield if it has a real value
    if (crop.yield != null && crop.yield !== "") {
      row.yield = parseFloat(crop.yield);
    } else {
      row.yield = null;
    }

    const { data, error } = await db
      .from("crops")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();
    if (error) {
      console.error("[Supabase] saveCrop error:", error.message, row);
      return null;
    }
    return data;
  },

  async deleteCrop(cropId, userId) {
    const uid = userId || _currentUserId;
    if (!uid) return;
    const { error } = await db
      .from("crops")
      .delete()
      .eq("id", cropId)
      .eq("user_id", uid);
    if (error) supaErr(error, "deleteCrop");
  },

  async clearCrops(userId) {
    const uid = userId || _currentUserId;
    if (!uid) return;
    const { error } = await db
      .from("crops")
      .delete()
      .eq("user_id", uid);
    if (error) supaErr(error, "clearCrops");
  },

  async clearExpenses(userId) {
    const uid = userId || _currentUserId;
    if (!uid) return;
    const { error } = await db
      .from("expenses")
      .delete()
      .eq("user_id", uid);
    if (error) supaErr(error, "clearExpenses");
  },

  // ── PRICES ─────────────────────────────────────────────────
  async getPrices() {
    const { data, error } = await db
      .from("prices")
      .select("*")
      .order("category")
      .order("name");
    if (error) return supaErr(error, "getPrices") || [];
    return data || [];
  },

  async savePrices(prices) {
    // Bulk upsert — admin only
    const { error } = await db
      .from("prices")
      .upsert(prices, { onConflict: "id" });
    if (error) supaErr(error, "savePrices");
  },

  async savePrice(price) {
    const { data, error } = await db
      .from("prices")
      .upsert(price, { onConflict: "id" })
      .select()
      .single();
    if (error) return supaErr(error, "savePrice");
    return data;
  },

  async deletePrice(id) {
    const { error } = await db.from("prices").delete().eq("id", id);
    if (error) supaErr(error, "deletePrice");
  },

  getPricesUpdated() {
    const raw = localStorage.getItem("bdyari_prices_updated");
    if (!raw) return null;
    const d = new Date(raw);
    return d.toLocaleDateString("fil-PH", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  },

  // ── EXPENSES ───────────────────────────────────────────────
  async getExpenses(userId) {
    const uid = userId || _currentUserId;
    if (!uid) return [];
    const { data, error } = await db
      .from("expenses")
      .select("*")
      .eq("user_id", uid)
      .order("date", { ascending: false });
    if (error) return supaErr(error, "getExpenses") || [];
    return data || [];
  },

  async getExpensesForCrop(cropId, userId) {
    const uid = userId || _currentUserId;
    if (!uid) return [];
    const { data, error } = await db
      .from("expenses")
      .select("*")
      .eq("crop_id", cropId)
      .eq("user_id", uid)
      .order("date", { ascending: false });
    if (error) return supaErr(error, "getExpensesForCrop") || [];
    return data || [];
  },

  async addExpense(entry, userId) {
    const uid = userId || _currentUserId;
    if (!uid) {
      console.error("[addExpense] No user ID — session may not be restored.");
      return null;
    }
    const row = {
      id: entry.id || genId(),
      user_id: uid,
      crop_id: entry.crop_id,
      type: entry.type,
      amount: entry.amount,
      label: entry.label || null,
      date: entry.date || todayISO(),
    };
    const { data, error } = await db
      .from("expenses")
      .insert(row)
      .select()
      .single();
    if (error) {
      console.error("[Supabase] addExpense error:", error.message, row);
      return null;
    }
    return data;
  },

  async deleteExpense(id, userId) {
    const uid = userId || _currentUserId;
    if (!uid) return;
    const { error } = await db
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", uid);
    if (error) supaErr(error, "deleteExpense");
  },

  // ── WEATHER (cached locally — temp API response) ──
  getCachedWeather() {
    try {
      const raw = JSON.parse(localStorage.getItem("bdyari_weather_cache"));
      if (!raw) return null;
      if (Date.now() - raw.ts > 3600000) return null;
      return raw.data;
    } catch { return null; }
  },

  setCachedWeather(data) {
    localStorage.setItem(
      "bdyari_weather_cache",
      JSON.stringify({ ts: Date.now(), data }),
    );
  },

  // ── ADMIN PASSWORD ──
  getAdminPw() {
    return localStorage.getItem("bdyari_admin_pw") || "admin1234";
  },
  setAdminPw(pw) {
    localStorage.setItem("bdyari_admin_pw", pw);
  },
};
