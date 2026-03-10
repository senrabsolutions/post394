import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const portalBox = document.getElementById("portal-box");
const message = document.getElementById("portal-message");
const content = document.getElementById("portal-content");
const nameEl = document.getElementById("portal-name");
const roleEl = document.getElementById("portal-role");
const linksEl = document.getElementById("portal-links");
const summaryEl = document.getElementById("portal-summary");
const logoutBtn = document.getElementById("logout-btn");

if (
  !(portalBox instanceof HTMLElement) ||
  !(message instanceof HTMLElement) ||
  !(content instanceof HTMLElement) ||
  !(nameEl instanceof HTMLElement) ||
  !(roleEl instanceof HTMLElement) ||
  !(linksEl instanceof HTMLElement) ||
  !(summaryEl instanceof HTMLElement)
) {
  console.error("Portal elements not found.");
} else {
  const supabaseUrl = portalBox.dataset.supabaseUrl;
  const supabaseAnonKey = portalBox.dataset.supabaseAnonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    message.textContent = "Supabase environment variables are missing.";
    throw new Error("Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  async function loadPortal() {
    try {
      message.textContent = "Checking login...";

      // Try the persisted session first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("PORTAL SESSION:", sessionData, sessionError);

      let user = sessionData?.session?.user ?? null;

      // Fallback to getUser if needed
      if (!user) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        console.log("PORTAL USER:", userData, userError);
        user = userData?.user ?? null;
      }

      if (!user) {
        window.location.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role, is_active")
        .eq("id", user.id)
        .single();

      console.log("PORTAL PROFILE:", profile, profileError);

      if (profileError) {
        message.textContent = "Profile lookup failed: " + profileError.message;
        return;
      }

      if (!profile) {
        message.textContent = "No profile record was found for this user.";
        return;
      }

      if (!profile.is_active) {
        message.textContent = "This account exists but is not active.";
        return;
      }

      nameEl.textContent = profile.full_name || "";
      roleEl.textContent = profile.role || "";

      const links = [];
      const summary = [];

      links.push('<li><a href="/portal">Dashboard</a></li>');

      if (profile.role === "media_admin" || profile.role === "super_admin") {
        links.push('<li><a href="/portal/media">Media Dashboard</a></li>');
        summary.push("<li>Media and announcements access</li>");
      }

      if (
        profile.role === "commander" ||
        profile.role === "vice1" ||
        profile.role === "vice2" ||
        profile.role === "super_admin"
      ) {
        summary.push("<li>Leadership review access</li>");
      }

      if (profile.role === "super_admin") {
        links.push('<li><a href="/portal/admin">Super Admin</a></li>');
        summary.push("<li>User administration access</li>");
      }

      linksEl.innerHTML = links.join("");
      summaryEl.innerHTML = summary.join("");

      message.style.display = "none";
      content.style.display = "block";
    } catch (err) {
      console.error("PORTAL LOAD ERROR:", err);
      message.textContent =
        err instanceof Error
          ? "Portal error: " + err.message
          : "Unexpected portal error.";
    }
  }

  if (logoutBtn instanceof HTMLButtonElement) {
    logoutBtn.addEventListener("click", async function () {
      try {
        await supabase.auth.signOut();
        window.location.replace("/login");
      } catch (err) {
        console.error("LOGOUT ERROR:", err);
        message.style.display = "block";
        message.textContent = "Unable to log out right now.";
      }
    });
  }

  loadPortal();
}