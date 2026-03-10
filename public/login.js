import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const loginBox = document.getElementById("login-box");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const message = document.getElementById("login-message");

if (
  !(loginBox instanceof HTMLElement) ||
  !(emailInput instanceof HTMLInputElement) ||
  !(passwordInput instanceof HTMLInputElement) ||
  !(loginBtn instanceof HTMLButtonElement) ||
  !(message instanceof HTMLElement)
) {
  console.error("Login elements not found.");
} else {
  const supabaseUrl = loginBox.dataset.supabaseUrl;
  const supabaseAnonKey = loginBox.dataset.supabaseAnonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    message.textContent = "Supabase environment variables are missing.";
    throw new Error("Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY.");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  async function handleLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      message.textContent = "Please enter your email and password.";
      return;
    }

    message.textContent = "Signing in...";

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log("LOGIN RESULT:", data, error);

      if (error) {
        message.textContent = "Login failed: " + error.message;
        return;
      }

      if (!data.session) {
        message.textContent = "Login failed: session not created.";
        return;
      }

      // Give the browser a moment to persist the session before leaving the page
      await new Promise((resolve) => setTimeout(resolve, 500));

      const { data: sessionCheck } = await supabase.auth.getSession();
      console.log("SESSION AFTER LOGIN:", sessionCheck);

      if (!sessionCheck.session) {
        message.textContent = "Login succeeded, but the session was not persisted yet. Try again.";
        return;
      }

      message.textContent = "Login successful. Redirecting...";
      window.location.replace("/portal");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      message.textContent =
        err instanceof Error
          ? "Login failed: " + err.message
          : "Unexpected login error.";
    }
  }

  loginBtn.addEventListener("click", handleLogin);

  emailInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogin();
    }
  });

  passwordInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogin();
    }
  });
}