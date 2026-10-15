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

  var codexBtn = document.getElementById("codexBtn");
  var codexOverlay = document.getElementById("codexOverlay");
  var codexClose = document.getElementById("codexClose");
  var codexTabs = document.getElementById("codexTabs");
  var codexBody = document.getElementById("codexBody");

  var username = "";
  var selectedMode = null;

  yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------- */
  /* Username + screen flow                                                  */
  /* ---------------------------------------------------------------------- */

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
    codexBtn.hidden = target !== modesScreen;
    if (target !== modesScreen) {
      closeCodex();
    }
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

  /* ---------------------------------------------------------------------- */
  /* Itinerary (codex)                                                       */
  /* ---------------------------------------------------------------------- */

  var CODEX = [
    {
      id: "overview",
      label: "Overview",
      render: function () {
        return (
          "<h3>Currency Wars: Zero-Sum Game</h3>" +
          "<p>A permanent, auto-chess / deck-building roguelike side mode in " +
          "Honkai: Star Rail. You assemble a squad of 3 to 10 characters " +
          "(up to 4 On-Field, up to 6 Off-Field) and take them through 3 Planes " +
          "of battle nodes to defeat a final boss.</p>" +
          "<p>Instead of building a team up front, you recruit characters " +
          "during a run by spending <strong>Gold Coins</strong>, and you may " +
          "trial any character even if you do not own them.</p>" +
          "<h4>Core loop</h4>" +
          "<p>Spend coins to purchase characters &rarr; combine / upgrade them " +
          "&rarr; build Bonds &rarr; win battles.</p>" +
          "<h4>Node types</h4>" +
          "<ul>" +
          "<li><strong>Reward</strong> &mdash; easy node, drops coins and cards.</li>" +
          "<li><strong>Battle</strong> &mdash; combat vs normal / elite enemies.</li>" +
          "<li><strong>Supply</strong> &mdash; free character and equipment packs.</li>" +
          "<li><strong>Encounter</strong> &mdash; selectable difficulty, better rewards.</li>" +
          "<li><strong>Boss</strong> &mdash; clears the Plane.</li>" +
          "</ul>" +
          "<h4>Gambit modes</h4>" +
          "<ul>" +
          "<li><strong>Standard Gambit</strong> &mdash; full run; climb ranks, " +
          "earn rewards.</li>" +
          "<li><strong>Overclock Gambit</strong> &mdash; shorter run, faster " +
          "resources, no rank gain.</li>" +
          "</ul>" +
          "<p class='codex-note'>Snapshot based on Version 4.6. Bond rosters, " +
          "costs and effects rotate between updates. See INIT.txt for full " +
          "sources.</p>"
        );
      }
    },
    {
      id: "bonds",
      label: "Bonds",
      render: function () {
        var html =
          "<h3>How Bonds work</h3>" +
          "<p>Every character carries Bond tags. Deploy enough characters that " +
          "share a Bond to activate its effect; more members raise the Bond " +
          "level and strengthen it. Bond types are <strong>Factions</strong> " +
          "(by world / group), <strong>Schools</strong> (by playstyle) and " +
          "<strong>Independent</strong> (single-character).</p>" +
          "<h3>Faction Bonds</h3>";

        var factions = [
          ["Xianzhou", "Summons the Lightning-Lord; when it acts it strikes all enemies.", "Yao Guang, Huohuo, Dan Heng \u2022 Imbibitor Lunae, Fugue, Fu Xuan, Yanqing, Jing Yuan"],
          ["Wolf Hunt", "Summons an evolving Borisin ally that levels up and buffs the team.", "Jiaoqiu, Feixiao, Lingsha, Jingliu, Yanqing, Yunli"],
          ["Night Demigod", "Amphoreus faction buff scaling with member count.", "Mydei, Cipher, Dan Heng \u2022 Permansor Terrae, Cerydra, Castorice, Evernight, Cyrene"],
          ["Day Demigod", "SPD Amplification and access to the Light Speed Propeller.", "Aglaea, Tribbie, Hyacine, Anaxa, Hysilens, Cyrene"],
          ["Belobog", "Summons / empowers allies for strong frontline damage.", "Seele, Natasha, Gepard, Bronya"],
          ["Express Cohort", "Summons the Astral Express / Light Rail for extra damage and support.", "March 7th (Hunt), Imbibitor Lunae, Sunday, Himeko \u2022 Nova, Trailblazer forms, Welt"],
          ["Cosmic Scholar", "Stacks Cake Cats by star level for bonus rewards.", "Asta, Herta, Ruan Mei, Dr. Ratio, The Herta"],
          ["Galactic Voyager", "Voyager faction buff scaling with member count.", "Argenti, Evanescia, Dr. Ratio, Luocha, Sparxie, Welt"],
          ["The Planet of Festivities", "Penacony faction buff; pairs well with Break.", "The Dahlia, Sparkle, Sunday, Robin, Black Swan"],
          ["Stellaron Hunters", "The best-equipped Hunter becomes the Star Hunter; others assist with coordinated attacks.", "Kafka, Mortenax Blade, Silver Wolf LV.999, Firefly"],
          ["Holy Grail of Destiny", "Fate collab: perform Grail Wishes for special equipment and rewards.", "Rin Tohsaka, Gilgamesh, Saber, Archer"],
          ["Galaxy Ranger", "Small Ranger faction buff.", "Rappa, Ashveil, Acheron, Boothill"],
          ["IPC", "Small IPC faction buff.", "Jade, Aventurine, Topaz & Numby"]
        ];

        factions.forEach(function (b) {
          html += entry(b[0], b[1], b[2]);
        });

        html += "<h3>School Bonds</h3>";

        var schools = [
          ["Break", "Super Break DMG vs broken enemies; lowers enemy Toughness.", "Rappa, The Dahlia, Lingsha, Ruan Mei, Fugue, Boothill, Firefly"],
          ["Follow-Up ATK", "Triggers Unified Attack for True DMG from accumulated follow-up damage.", "Feixiao, Cipher, Aventurine, Ashveil, Dr. Ratio, Robin, Topaz & Numby"],
          ["Energy", "Restores Energy; deals damage based on Energy spent at higher levels.", "Huohuo, Aglaea, Gilgamesh, Saber, Sunday, Yunli, Trailblazer forms"],
          ["AoE ATK", "Multi-target damage amplification.", "Herta, Jade, Argenti, Tribbie, Anaxa, The Herta, Jing Yuan"],
          ["Bloodflame", "HP consumed powers the Bloodflame Arena AoE attack.", "Mydei, Hyacine, Mortenax Blade, Jingliu, Castorice, Evernight, Bronya"],
          ["Elation", "Aha Instant / Punchline stacking engine.", "Yao Guang, Evanescia, Silver Wolf LV.999, Sparxie, Elation Trailblazer"],
          ["Debuff", "Layered debuffs that scale through the whole run.", "Jiaoqiu, Cipher, Mortenax Blade, Acheron, Yanqing, Welt"],
          ["Skill Points", "Raises max Skill Points; spending SP can trigger lucky-draw buffs.", "Rin Tohsaka, Imbibitor Lunae, Sparkle, Cerydra, Sparxie, Archer"],
          ["DoT", "Amplifies DoT; Super Excitation triggers extra DoT on enemy turns.", "Asta, Jiaoqiu, Kafka, Hysilens, Black Swan"],
          ["Quantum Resonance", "Quantum buffs; ramps up the DMG enemies take.", "Sparkle, Tribbie, Seele, Fu Xuan"],
          ["Heal", "Healing / sustain synergy.", "Huohuo, Lingsha, Hyacine, Natasha, Luocha, Fu Xuan"],
          ["Shield", "Shield synergy, pairs with counter builds.", "March 7th (Hunt), Aventurine, Dan Heng \u2022 Permansor Terrae, Gepard"]
        ];

        schools.forEach(function (b) {
          html += entry(b[0], b[1], b[2]);
        });

        html +=
          "<h3>Independent Bonds</h3>" +
          "<p>Belong to a single character and are active while that character " +
          "is deployed.</p>" +
          "<ul>" +
          "<li><strong>Navigator</strong> &mdash; Himeko \u2022 Nova copies an Express member's School Bond.</li>" +
          "<li><strong>Deliverer / Savior</strong> &mdash; Phainon's own scaling kit.</li>" +
          "<li><strong>Destiny Diviner</strong> &mdash; Black Swan's divination cards.</li>" +
          "</ul>" +
          "<p class='codex-note'>Bond <strong>Emblems</strong> (equipment) add a " +
          "non-bond character to a Bond, counting toward its level.</p>";

        return html;
      }
    },
    {
      id: "characters",
      label: "Characters",
      render: function () {
        return (
          "<h3>Cost &amp; rarity</h3>" +
          "<p>Each character has a Cost in Gold Coins, colour-coded from weak " +
          "base kit (but high growth) to strong base kit (but less growth).</p>" +
          "<h4>5-cost &mdash; Gold</h4><p class='codex-members'>Topaz &amp; Numby, Jing Yuan, Yunli, Firefly, Cyrene, Bronya, Welt, Archer, Black Swan</p>" +
          "<h4>4-cost &mdash; Purple</h4><p class='codex-members'>Gepard, Luocha, Fu Xuan, Yanqing, Robin, Boothill, The Herta, Castorice, Evernight, Remembrance Trailblazer, Hysilens, Sparxie, Silver Wolf</p>" +
          "<h4>3-cost &mdash; Blue</h4><p class='codex-members'>Saber, Seele, Natasha, Jingliu, Fugue, Dr. Ratio, Acheron, Sunday, Anaxa, Cerydra, Phainon, Himeko \u2022 Nova, Silver Wolf LV.999, Himeko</p>" +
          "<h4>2-cost &mdash; Green</h4><p class='codex-members'>Kafka, Imbibitor Lunae, Lingsha, Argenti, Ruan Mei, Aventurine, Sparkle, Tribbie, Hyacine, Dan Heng \u2022 Permansor Terrae, Ashveil, Mortenax Blade, Evanescia, Gilgamesh, Pela</p>" +
          "<h4>1-cost &mdash; Grey</h4><p class='codex-members'>Herta, Huohuo, Jiaoqiu, Feixiao, Jade, Rappa, The Dahlia, Aglaea, Mydei, Cipher, Yao Guang, Rin Tohsaka, March 7th (Hunt), Asta, Sampo, Qingque, Tingyun, Blade, Moze, Gallagher</p>" +
          "<p class='codex-note'>Rosters and costs rotate between updates &mdash; " +
          "verify in-game. Some units shift cost tiers (e.g. Feixiao moved to " +
          "1-cost; Gallagher, Tingyun and Qingque became Expert Advisors).</p>" +
          "<h3>Mechanics</h3>" +
          "<ul>" +
          "<li><strong>Star Level:</strong> recruit at 1&#9733;; three identical copies merge up. 3&#9733; is usually a character's strongest form.</li>" +
          "<li><strong>Positioning:</strong> On-Field (controlled), Off-Field (auto support) or Both. Wrong placement removes their empowerment.</li>" +
          "<li><strong>Empowerment:</strong> mode-exclusive kit &mdash; e.g. Firefly gains a boss move, Qingque gains temp SP, Herta's off-field follow-up scales with kills.</li>" +
          "<li><strong>Level = team size:</strong> start at Level 3 (3 units), up to 10. Higher level also raises high-cost odds.</li>" +
          "<li><strong>Expert Advisors:</strong> special unlockable units (e.g. Gallagher, Tingyun, Qingque, Himeko) bought / received during a run.</li>" +
          "</ul>"
        );
      }
    },
    {
      id: "investment",
      label: "Investment",
      render: function () {
        return (
          "<h3>Environments vs Strategies</h3>" +
          "<ul>" +
          "<li><strong>Investment Environment</strong> &mdash; chosen once at the start of a run; a run-long effect (economy, emblems, unit access).</li>" +
          "<li><strong>Investment Strategy</strong> &mdash; chosen mid-run at designated nodes; pick 1 of 3 to improve the run.</li>" +
          "</ul>" +
          "<p>Picking <strong>higher-rarity</strong> strategies increases the " +
          "difficulty of the run.</p>" +
          "<h4>Rarity tiers</h4>" +
          "<p>Silver &rarr; Gold &rarr; Prismatic. Some environments force a tier: " +
          "<strong>Silver Age</strong> (all strategies Silver &mdash; stable clears, no " +
          "extra difficulty), <strong>Gold Age</strong>, and <strong>Rainbow " +
          "Age</strong> (all Prismatic &mdash; high risk, high roll).</p>" +
          "<h4>Environment examples</h4>" +
          "<ul>" +
          "<li><strong>Index Funds</strong> &mdash; one per Bond; raises that Bond's shop odds.</li>" +
          "<li><strong>Invitations</strong> &mdash; grant the matching Bond Emblem immediately.</li>" +
          "<li><strong>Economy</strong> &mdash; gold and interest boosters (e.g. Long-Term Gains, Economic Overheat, Destiny's Gift).</li>" +
          "<li><strong>Talent / Shop</strong> &mdash; e.g. Downward Mobility of Talent (shop can sell 2&#9733; units).</li>" +
          "<li><strong>Special Guest Expert</strong> &mdash; unlock an Expert Advisor (e.g. Sampo) for the run.</li>" +
          "</ul>" +
          "<h4>Strategy examples</h4>" +
          "<ul>" +
          "<li><strong>Gold Investment</strong> &mdash; choose one of three Gold strategies, with refreshes.</li>" +
          "<li><strong>Surplus Value</strong> &mdash; gain Gold for remaining Action Value at finalization.</li>" +
          "<li><strong>Struggle Protocol</strong> &mdash; buy EXP with Squad HP instead of Gold; heal after bosses.</li>" +
          "<li><strong>Resolution: Planet of Entertainment</strong> &mdash; hold enough Gold to convert nodes to Reward nodes.</li>" +
          "</ul>" +
          "<h3>Economy (the real investment game)</h3>" +
          "<ul>" +
          "<li><strong>Interest:</strong> +1 Gold per 10 unspent at battle end (up to +5). Bank to ~30 early, then ~50 for max interest.</li>" +
          "<li><strong>Win streaks</strong> pay bonus Gold &mdash; protect them.</li>" +
          "<li><strong>Slow-roll:</strong> only spend Gold above your interest threshold.</li>" +
          "<li><strong>Bridge teams:</strong> cheap early Bonds (DoT / Xianzhou / Express) clear Plane 1 while you bank, then pivot.</li>" +
          "<li><strong>Restart freely:</strong> abandoning a run does not cost rank.</li>" +
          "</ul>"
        );
      }
    },
    {
      id: "equipment",
      label: "Equipment",
      render: function () {
        return (
          "<h3>Equipment</h3>" +
          "<p>Up to 3 pieces per character. Two basic pieces synthesize into " +
          "an advanced piece; advanced pieces can upgrade into privileged " +
          "pieces.</p>" +
          "<h4>Basic equipment (8 types)</h4>" +
          "<ul>" +
          "<li>Roller Skates &mdash; SPD Amplification</li>" +
          "<li>Folding Knife &mdash; On-Field Strength</li>" +
          "<li>Peace Pistol &mdash; Off-Field Strength</li>" +
          "<li>Lucky Star &mdash; Lucky Strike Rate</li>" +
          "<li>Flower of Life &mdash; HP Amplification</li>" +
          "<li>Batch Produced Armor &mdash; DMG Mitigation</li>" +
          "<li>Aether Drill &mdash; Break Efficiency</li>" +
          "<li>Photon Cell &mdash; Initial Energy</li>" +
          "</ul>" +
          "<h4>Advanced equipment examples</h4>" +
          "<ul>" +
          "<li>Anti-Grav Boots (Roller Skates) &mdash; stacking SPD; core for Aglaea.</li>" +
          "<li>High-frequency Chainsaw = Folding Knife + Lucky Star.</li>" +
          "<li>Analgesia Chip = Flower of Life + Batch Produced Armor.</li>" +
          "<li>Wormhole Drill = Aether Drill + Aether Drill (Break Efficiency).</li>" +
          "</ul>" +
          "<h4>Rare</h4>" +
          "<ul>" +
          "<li><strong>Emblems</strong> &mdash; add a character to a Bond.</li>" +
          "<li><strong>Wealth Gem</strong> &mdash; +1 team size and passive Gold.</li>" +
          "</ul>"
        );
      }
    }
  ];

  function entry(name, effect, members) {
    return (
      "<div class='codex-entry'>" +
      "<strong>" + name + "</strong> &mdash; " + effect +
      "<br><span class='codex-members'>Members: " + members + "</span>" +
      "</div>"
    );
  }

  var activeTab = CODEX[0].id;

  function renderTabs() {
    codexTabs.innerHTML = CODEX.map(function (tab) {
      var active = tab.id === activeTab ? " active" : "";
      return (
        '<button type="button" class="codex-tab' + active +
        '" data-tab="' + tab.id + '">' + tab.label + "</button>"
      );
    }).join("");
  }

  function renderBody() {
    for (var i = 0; i < CODEX.length; i++) {
      if (CODEX[i].id === activeTab) {
        codexBody.innerHTML = CODEX[i].render();
        break;
      }
    }
    codexBody.scrollTop = 0;
  }

  function openCodex() {
    codexOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    renderTabs();
    renderBody();
  }

  function closeCodex() {
    codexOverlay.hidden = true;
    document.body.style.overflow = "";
  }

  function handleTabClick(event) {
    var tab = event.target.closest(".codex-tab");
    if (!tab) {
      return;
    }
    activeTab = tab.getAttribute("data-tab");
    renderTabs();
    renderBody();
  }

  /* ---------------------------------------------------------------------- */
  /* Wiring                                                                  */
  /* ---------------------------------------------------------------------- */

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

  codexBtn.addEventListener("click", openCodex);
  codexClose.addEventListener("click", closeCodex);
  codexTabs.addEventListener("click", handleTabClick);
  codexOverlay.addEventListener("click", function (event) {
    if (event.target === codexOverlay) {
      closeCodex();
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !codexOverlay.hidden) {
      closeCodex();
    }
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
