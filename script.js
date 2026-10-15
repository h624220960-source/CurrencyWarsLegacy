(function () {
  "use strict";

  var STORAGE_KEY = "cwl.username";
  var MAX_USERNAME_LENGTH = 20;

  var yearEl = document.getElementById("year");
  var userBox = document.getElementById("userBox");
  var userGreeting = document.getElementById("userGreeting");
  var changeUserBtn = document.getElementById("changeUser");

  var usernameScreen = document.getElementById("screen-username");
  var modesScreen = document.getElementById("screen-modes");

  var usernameForm = document.getElementById("usernameForm");
  var usernameInput = document.getElementById("usernameInput");
  var usernameError = document.getElementById("usernameError");

  var username = "";
  var selectedMode = null;

  yearEl.textContent = new Date().getFullYear();

  function saveUsername(name) {
    try {
      localStorage.setItem(STORAGE_KEY, name);
    } catch (err) {
      /* storage unavailable (private mode) - session only */
    }
  }

  function loadUsername() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch (err) {
      return "";
    }
  }

  function showScreen(target) {
    usernameScreen.hidden = target !== usernameScreen;
    modesScreen.hidden = target !== modesScreen;
  }

  function setUser(name) {
    username = name;
    userGreeting.textContent = name;
    userBox.hidden = false;
  }

  function gotoModes() {
    setUser(username);
    showScreen(modesScreen);
  }

  function gotoUsername() {
    selectedMode = null;
    userBox.hidden = true;
    usernameInput.value = username;
    clearError();
    showScreen(usernameScreen);
    usernameInput.focus();
  }

  function clearError() {
    usernameError.hidden = true;
    usernameError.textContent = "";
    usernameInput.classList.remove("invalid");
  }

  function showError(message) {
    usernameError.textContent = message;
    usernameError.hidden = false;
    usernameInput.classList.add("invalid");
  }

  function handleUsernameSubmit(event) {
    event.preventDefault();
    var name = usernameInput.value.trim();

    if (name.length === 0) {
      showError("Please enter a username.");
      return;
    }
    if (name.length > MAX_USERNAME_LENGTH) {
      showError("Username must be " + MAX_USERNAME_LENGTH + " characters or fewer.");
      return;
    }

    clearError();
    username = name;
    saveUsername(name);
    gotoModes();
  }

  function handleModeSelect(event) {
    var card = event.currentTarget;
    selectedMode = card.getAttribute("data-mode");

    var cards = modesScreen.querySelectorAll(".mode-card:not(.locked)");
    Array.prototype.forEach.call(cards, function (c) {
      c.classList.remove("selected");
    });
    card.classList.add("selected");

    startMode(selectedMode);
  }

  function startMode(mode) {
    /*
     * Placeholder for the actual game. Each mode will eventually load its own
     * setup screen (Investment Environment / Gambit difficulty, etc.).
     */
    var label = mode === "standard" ? "Standard Gambit" : "Overclock Gambit";
    console.log("Starting mode: " + label + " for user: " + username);
    window.alert(label + " selected. This mode is not implemented yet.");
  }

  usernameForm.addEventListener("submit", handleUsernameSubmit);

  usernameInput.addEventListener("input", function () {
    if (!usernameError.hidden) {
      clearError();
    }
  });

  changeUserBtn.addEventListener("click", gotoUsername);

  var modeCards = modesScreen.querySelectorAll(".mode-card:not(.locked)");
  Array.prototype.forEach.call(modeCards, function (card) {
    card.addEventListener("click", handleModeSelect);
  });

  // Boot: skip the gate if a username was already stored.
  var stored = loadUsername();
  if (stored) {
    username = stored;
    gotoModes();
  } else {
    showScreen(usernameScreen);
  }
})();
