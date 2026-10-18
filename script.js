/* ===== Data ===== */
const PLANS = {
  arcade: { name: "Arcade", monthly: 9, yearly: 90 },
  advanced: { name: "Advanced", monthly: 12, yearly: 120 },
  pro: { name: "Pro", monthly: 15, yearly: 150 },
};

const ADDONS = {
  online: { name: "Online service", monthly: 1, yearly: 10 },
  storage: { name: "Larger storage", monthly: 2, yearly: 20 },
  profile: { name: "Customizable profile", monthly: 2, yearly: 20 },
};

/* ===== State ===== */
const state = {
  step: 1,
  billing: "monthly", // "monthly" | "yearly"
  plan: null, // key of PLANS
  addons: new Set(), // keys of ADDONS
};

const TOTAL_STEPS = 4;

/* ===== Elements ===== */
const panels = document.querySelectorAll(".panel");
const sidebarSteps = document.querySelectorAll(".sidebar .step");
const nav = document.getElementById("nav");
const nextBtn = document.getElementById("next-button");
const backBtn = document.getElementById("back-button");

const nameInput = document.querySelector('input[name="userName"]');
const emailInput = document.querySelector('input[name="email"]');
const phoneInput = document.querySelector('input[name="phone"]');

const planCards = document.querySelectorAll(".plan_card");
const plansWrap = document.querySelector(".plans");
const planError = document.getElementById("plan-error");
const billingToggle = document.getElementById("billing-toggle");
const billingOptions = document.querySelectorAll(".billing__option");

const addonCards = document.querySelectorAll(".addon_card");

const summaryPlanName = document.getElementById("summary-plan-name");
const summaryPlanPrice = document.getElementById("summary-plan-price");
const summaryAddons = document.getElementById("summary-addons");
const summaryTotalLabel = document.getElementById("summary-total-label");
const summaryTotal = document.getElementById("summary-total");
const changePlanBtn = document.getElementById("change-plan");

/* ===== Helpers ===== */
const suffix = () => (state.billing === "monthly" ? "mo" : "yr");
const price = (item) => item[state.billing];
const money = (amount) => `$${amount}/${suffix()}`;

function renderPrices() {
  planCards.forEach((card) => {
    const plan = PLANS[card.dataset.plan];
    card.querySelector(".plan_card__price").textContent = money(price(plan));
  });
  addonCards.forEach((card) => {
    const addon = ADDONS[card.dataset.addon];
    card.querySelector(".addon_card__price").textContent = `+${money(price(addon))}`;
  });
  plansWrap.classList.toggle("yearly", state.billing === "yearly");
  billingOptions.forEach((opt) =>
    opt.classList.toggle("active", opt.dataset.billing === state.billing)
  );
}

function renderSummary() {
  const plan = PLANS[state.plan];
  const period = state.billing === "monthly" ? "Monthly" : "Yearly";
  summaryPlanName.textContent = `${plan.name} (${period})`;
  summaryPlanPrice.textContent = money(price(plan));

  summaryAddons.innerHTML = "";
  let total = price(plan);

  if (state.addons.size === 0) {
    const li = document.createElement("li");
    li.className = "summary__empty";
    li.textContent = "No add-ons selected";
    summaryAddons.appendChild(li);
  } else {
    state.addons.forEach((key) => {
      const addon = ADDONS[key];
      total += price(addon);
      const li = document.createElement("li");
      const name = document.createElement("span");
      name.textContent = addon.name;
      const cost = document.createElement("span");
      cost.textContent = `+${money(price(addon))}`;
      li.append(name, cost);
      summaryAddons.appendChild(li);
    });
  }

  summaryTotalLabel.textContent = `Total (per ${state.billing === "monthly" ? "month" : "year"})`;
  summaryTotal.textContent = `${money(total)}`;
}

function render() {
  panels.forEach((p) => p.classList.toggle("active", Number(p.dataset.panel) === state.step));

  // Sidebar: on the thank-you screen, keep step 4 highlighted
  const sidebarStep = Math.min(state.step, TOTAL_STEPS);
  sidebarSteps.forEach((s) => s.classList.toggle("active", Number(s.dataset.step) === sidebarStep));

  if (state.step > TOTAL_STEPS) {
    nav.classList.add("hidden");
    return;
  }
  nav.classList.remove("hidden");
  backBtn.classList.toggle("hidden", state.step === 1);

  const isLast = state.step === TOTAL_STEPS;
  nextBtn.textContent = isLast ? "Confirm" : "Next step";
  nextBtn.classList.toggle("confirm", isLast);

  if (isLast) renderSummary();
}

/* ===== Validation ===== */
function setFieldError(input, message) {
  const field = input.closest(".field");
  const error = field.querySelector(".field__error");
  error.textContent = message;
  field.classList.toggle("error", Boolean(message));
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function validateStep1() {
  let valid = true;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();

  if (!name) {
    setFieldError(nameInput, "Enter your name");
    valid = false;
  } else {
    setFieldError(nameInput, "");
  }

  if (!email) {
    setFieldError(emailInput, "Enter email");
    valid = false;
  } else if (!validateEmail(email)) {
    setFieldError(emailInput, "Please enter a valid email address");
    valid = false;
  } else {
    setFieldError(emailInput, "");
  }

  if (!phone) {
    setFieldError(phoneInput, "Enter your mobile number");
    valid = false;
  } else if (!/^\+?[\d\s()-]{7,}$/.test(phone)) {
    setFieldError(phoneInput, "Enter a valid phone number");
    valid = false;
  } else {
    setFieldError(phoneInput, "");
  }

  return valid;
}

function validateStep2() {
  if (!state.plan) {
    planError.textContent = "Please select a plan";
    return false;
  }
  planError.textContent = "";
  return true;
}

function validateCurrentStep() {
  if (state.step === 1) return validateStep1();
  if (state.step === 2) return validateStep2();
  return true;
}

/* ===== Events ===== */
nextBtn.addEventListener("click", () => {
  if (!validateCurrentStep()) return;
  state.step += 1;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

backBtn.addEventListener("click", () => {
  if (state.step > 1) {
    state.step -= 1;
    render();
  }
});

changePlanBtn.addEventListener("click", () => {
  state.step = 2;
  render();
});

// Clear field errors as the user types
[nameInput, emailInput, phoneInput].forEach((input) => {
  input.addEventListener("input", () => {
    if (input.closest(".field").classList.contains("error")) setFieldError(input, "");
  });
});

// Plan selection
planCards.forEach((card) => {
  card.addEventListener("click", () => {
    state.plan = card.dataset.plan;
    planCards.forEach((c) => {
      const selected = c === card;
      c.classList.toggle("selected", selected);
      c.setAttribute("aria-checked", String(selected));
    });
    planError.textContent = "";
  });
});

// Billing toggle
billingToggle.addEventListener("change", () => {
  state.billing = billingToggle.checked ? "yearly" : "monthly";
  renderPrices();
});

billingOptions.forEach((opt) => {
  opt.addEventListener("click", () => {
    billingToggle.checked = opt.dataset.billing === "yearly";
    billingToggle.dispatchEvent(new Event("change"));
  });
});

// Add-on selection (checkbox inside label handles the toggle)
addonCards.forEach((card) => {
  const checkbox = card.querySelector('input[type="checkbox"]');
  checkbox.addEventListener("change", () => {
    const key = card.dataset.addon;
    if (checkbox.checked) state.addons.add(key);
    else state.addons.delete(key);
    card.classList.toggle("selected", checkbox.checked);
  });
});

// Prevent implicit submit on Enter
document.getElementById("multi-step-form").addEventListener("submit", (e) => e.preventDefault());

/* ===== Init ===== */
renderPrices();
render();