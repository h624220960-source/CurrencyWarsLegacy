(function () {
  "use strict";

  var CW = window.CW;
  if (!CW) {
    return;
  }
  var DATA = CW.data;

  /* ---------------------------------------------------------------------- */
  /* Element / role data                                                     */
  /* ---------------------------------------------------------------------- */

  /* Approximate elements (best-effort; several post-4.4 units are uncertain). */
  var ELEMENTS = {
    Physical: { color: "#c9c9c9", icon: "\u2694" },
    Fire: { color: "#ff6b4a", icon: "\uD83D\uDD25" },
    Ice: { color: "#7fd4ff", icon: "\u2744" },
    Lightning: { color: "#b98cff", icon: "\u26A1" },
    Wind: { color: "#5fd3a0", icon: "\uD83C\uDF43" },
    Quantum: { color: "#6a7cff", icon: "\u25C8" },
    Imaginary: { color: "#ffd75e", icon: "\u2726" }
  };

  var ELEMENT = {
    "Topaz & Numby": "Fire", "Jing Yuan": "Lightning", "Yunli": "Physical",
    "Firefly": "Fire", "Cyrene": "Imaginary", "Bronya": "Wind", "Welt": "Imaginary",
    "Archer": "Quantum", "Black Swan": "Wind",
    "Gepard": "Ice", "Luocha": "Imaginary", "Fu Xuan": "Quantum", "Yanqing": "Ice",
    "Robin": "Physical", "Boothill": "Physical", "The Herta": "Ice",
    "Castorice": "Quantum", "Evernight": "Ice", "Remembrance Trailblazer": "Ice",
    "Hysilens": "Wind", "Sparxie": "Quantum", "Silver Wolf": "Quantum",
    "Saber": "Physical", "Seele": "Quantum", "Natasha": "Physical", "Jingliu": "Ice",
    "Fugue": "Fire", "Dr. Ratio": "Imaginary", "Acheron": "Lightning", "Sunday": "Imaginary",
    "Anaxa": "Wind", "Cerydra": "Imaginary", "Phainon": "Imaginary", "Himeko \u2022 Nova": "Fire",
    "Silver Wolf LV.999": "Quantum", "Himeko": "Fire",
    "Kafka": "Lightning", "Dan Heng \u2022 Imbibitor Lunae": "Imaginary", "Lingsha": "Fire",
    "Argenti": "Physical", "Ruan Mei": "Ice", "Aventurine": "Imaginary", "Sparkle": "Quantum",
    "Tribbie": "Quantum", "Hyacine": "Imaginary", "Dan Heng \u2022 Permansor Terrae": "Imaginary",
    "Ashveil": "Wind", "Mortenax Blade": "Wind", "Evanescia": "Wind", "Gilgamesh": "Imaginary",
    "Pela": "Ice",
    "Herta": "Ice", "Huohuo": "Wind", "Jiaoqiu": "Fire", "Feixiao": "Wind", "Jade": "Quantum",
    "Rappa": "Imaginary", "The Dahlia": "Fire", "Aglaea": "Lightning", "Mydei": "Fire",
    "Cipher": "Quantum", "Yao Guang": "Lightning", "Rin Tohsaka": "Fire",
    "The Hunt March 7th": "Imaginary", "Asta": "Fire", "Sampo": "Wind", "Qingque": "Quantum",
    "Tingyun": "Lightning", "Blade": "Wind", "Moze": "Lightning", "Gallagher": "Fire"
  };

  var HEALERS = ["Natasha", "Luocha", "Huohuo", "Lingsha", "Hyacine", "Gallagher"];
  var SHIELDERS = ["Gepard", "Aventurine", "Fu Xuan", "The Hunt March 7th", "Dan Heng \u2022 Permansor Terrae"];
  var SUPPORTERS = ["Bronya", "Robin", "Ruan Mei", "Sunday", "Sparkle", "Tingyun", "Asta", "Pela",
    "Welt", "Fugue", "Tribbie", "Silver Wolf", "Jiaoqiu", "Sampo", "Qingque", "Moze", "Cerydra", "Anaxa"];

  var ENEMY_ARCHETYPES = {
    grunt: { name: "Market Grunt", element: "Physical", hp: 1000, atk: 105, spd: 100, tough: 60, weak: ["Fire"] },
    bruiser: { name: "Debt Enforcer", element: "Ice", hp: 1900, atk: 140, spd: 88, tough: 90, weak: ["Fire", "Lightning"] },
    sniper: { name: "Contract Sniper", element: "Lightning", hp: 1150, atk: 165, spd: 118, tough: 60, weak: ["Quantum"] },
    medic: { name: "Support Analyst", element: "Imaginary", hp: 1050, atk: 95, spd: 96, tough: 60, weak: ["Wind"], role: "heal" },
    boss: { name: "A8 Liquidator", element: "Quantum", hp: 4400, atk: 205, spd: 108, tough: 120, weak: ["Imaginary", "Fire"], boss: true }
  };

  var ENCOUNTERS = [
    { id: "skirmish", name: "Skirmish", desc: "2 grunts", units: ["grunt", "grunt"] },
    { id: "squad", name: "Competitor Squad", desc: "Bruiser + 2", units: ["bruiser", "grunt", "sniper"] },
    { id: "elite", name: "Elite Contract", desc: "4 units", units: ["bruiser", "medic", "sniper", "grunt"] },
    { id: "boss", name: "Wealth Creator", desc: "Boss + 2 adds", units: ["boss", "grunt", "grunt"] }
  ];

  /* ---------------------------------------------------------------------- */
  /* Helpers                                                                 */
  /* ---------------------------------------------------------------------- */

  function costOf(name) {
    var roster = DATA.COST_ROSTER;
    for (var cost = 5; cost >= 1; cost--) {
      if (roster[cost] && roster[cost].indexOf(name) !== -1) {
        return cost;
      }
    }
    return 1;
  }

  function elementOf(name) {
    return ELEMENT[name] || "Physical";
  }

  function roleOf(name) {
    if (HEALERS.indexOf(name) !== -1) return "heal";
    if (SHIELDERS.indexOf(name) !== -1) return "shield";
    if (SUPPORTERS.indexOf(name) !== -1) return "support";
    return "attack";
  }

  function playerStats(name) {
    var cost = costOf(name);
    var role = roleOf(name);
    var hp = 1000 + cost * 300;
    var atk = 95 + cost * 28;
    var spd = 95 + cost * 2;
    hp += role === "heal" ? 400 : 0;
    atk += role === "heal" ? -25 : 0;
    hp += role === "shield" ? 800 : 0;
    atk += role === "support" ? -15 : 0;
    spd += role === "support" ? 8 : 0;
    return { hp: hp, atk: atk, spd: spd, role: role, element: elementOf(name) };
  }

  function randInt(n) {
    return Math.floor(Math.random() * n);
  }

  function pick(list) {
    return list[randInt(list.length)];
  }

  /* ---------------------------------------------------------------------- */
  /* DOM references                                                          */
  /* ---------------------------------------------------------------------- */

  var setupScreen = document.getElementById("screen-setup");
  var battleScreen = document.getElementById("screen-battle");
  var modesScreen = document.getElementById("screen-modes");

  var rosterList = document.getElementById("rosterList");
  var rosterSearch = document.getElementById("rosterSearch");
  var onFieldSlots = document.getElementById("onFieldSlots");
  var offFieldSlots = document.getElementById("offFieldSlots");
  var onFieldCount = document.getElementById("onFieldCount");
  var offFieldCount = document.getElementById("offFieldCount");
  var encounterPicker = document.getElementById("encounterPicker");
  var beginBattleBtn = document.getElementById("beginBattle");
  var quickFillBtn = document.getElementById("quickFill");
  var setupBackBtn = document.getElementById("setupBack");

  var battlefield = document.getElementById("battlefield");
  var playerOnField = document.getElementById("playerOnField");
  var playerOffField = document.getElementById("playerOffField");
  var enemyField = document.getElementById("enemyField");
  var battleLog = document.getElementById("battleLog");
  var battleEncounterEl = document.getElementById("battleEncounter");
  var battleRoundEl = document.getElementById("battleRound");
  var autoToggle = document.getElementById("autoToggle");
  var speedToggle = document.getElementById("speedToggle");
  var battleBackBtn = document.getElementById("battleBack");
  var battleResult = document.getElementById("battleResult");
  var battleResultTitle = document.getElementById("battleResultTitle");
  var battleResultSub = document.getElementById("battleResultSub");
  var battleAgainBtn = document.getElementById("battleAgain");
  var battleExitBtn = document.getElementById("battleExit");

  /* ---------------------------------------------------------------------- */
  /* Setup state                                                             */
  /* ---------------------------------------------------------------------- */

  var MAX_ON = 4;
  var MAX_OFF = 6;

  var selection = { on: [], off: [] };
  var chosenEncounter = ENCOUNTERS[0].id;
  var searchTerm = "";

  function buildRoster() {
    var html = "";
    for (var cost = 5; cost >= 1; cost--) {
      var names = DATA.COST_ROSTER[cost] || [];
      var rows = "";
      names.forEach(function (name) {
        if (searchTerm && name.toLowerCase().indexOf(searchTerm) === -1) {
          return;
        }
        var el = elementOf(name);
        var selected = selection.on.indexOf(name) !== -1 || selection.off.indexOf(name) !== -1;
        rows +=
          "<div class='roster-row" + (selected ? " selected" : "") + "' data-name='" + name + "'>" +
          "<span class='el-dot' style='background:" + ELEMENTS[el].color + "' title='" + el + "'></span>" +
          "<span class='roster-name'>" + name + "</span>" +
          "<span class='cost-badge cost-" + cost + "'>" + DATA.COST_LABEL[cost] + "</span>" +
          "<button type='button' class='mini-btn' data-add='on' data-name='" + name + "'>+F</button>" +
          "<button type='button' class='mini-btn' data-add='off' data-name='" + name + "'>+B</button>" +
          "</div>";
      });
      if (rows) {
        html += "<div class='roster-group'><div class='roster-group-head'>" +
          DATA.COST_LABEL[cost] + "</div>" + rows + "</div>";
      }
    }
    rosterList.innerHTML = html || "<p class='muted'>No matches.</p>";
  }

  function buildChips() {
    function chip(name) {
      var el = elementOf(name);
      return "<span class='chip'><span class='el-dot' style='background:" + ELEMENTS[el].color + "'></span>" +
        name + "<button type='button' class='chip-x' data-remove='" + name + "'>&times;</button></span>";
    }
    onFieldSlots.innerHTML = selection.on.length ? selection.on.map(chip).join("") : "<span class='muted'>empty</span>";
    offFieldSlots.innerHTML = selection.off.length ? selection.off.map(chip).join("") : "<span class='muted'>empty</span>";
    onFieldCount.textContent = selection.on.length + "/" + MAX_ON;
    offFieldCount.textContent = selection.off.length + "/" + MAX_OFF;
    beginBattleBtn.disabled = selection.on.length === 0;
  }

  function buildEncounters() {
    encounterPicker.innerHTML = ENCOUNTERS.map(function (e) {
      return "<button type='button' class='enc-card" + (e.id === chosenEncounter ? " active" : "") +
        "' data-enc='" + e.id + "'><strong>" + e.name + "</strong><span class='muted'>" + e.desc + "</span></button>";
    }).join("");
  }

  function addUnit(name, field) {
    if (selection.on.indexOf(name) !== -1 || selection.off.indexOf(name) !== -1) {
      return;
    }
    if (field === "on" && selection.on.length < MAX_ON) {
      selection.on.push(name);
    } else if (field === "off" && selection.off.length < MAX_OFF) {
      selection.off.push(name);
    } else if (selection.on.length < MAX_ON) {
      selection.on.push(name);
    } else if (selection.off.length < MAX_OFF) {
      selection.off.push(name);
    }
    refreshSetup();
  }

  function removeUnit(name) {
    selection.on = selection.on.filter(function (n) { return n !== name; });
    selection.off = selection.off.filter(function (n) { return n !== name; });
    refreshSetup();
  }

  function refreshSetup() {
    buildRoster();
    buildChips();
  }

  function quickFill() {
    selection = { on: [], off: [] };
    var pool = [];
    for (var cost = 5; cost >= 1; cost--) {
      pool = pool.concat(DATA.COST_ROSTER[cost] || []);
    }
    pool.sort(function () { return Math.random() - 0.5; });
    var take = pool.slice(0, MAX_ON + 3);
    selection.on = take.slice(0, MAX_ON);
    selection.off = take.slice(MAX_ON, MAX_ON + 3);
    refreshSetup();
  }

  function openSetup() {
    refreshSetup();
    buildEncounters();
    CW.showScreen(setupScreen);
  }

  /* ---------------------------------------------------------------------- */
  /* Battle engine                                                           */
  /* ---------------------------------------------------------------------- */

  var state = {
    units: [],
    round: 0,
    running: false,
    auto: false,
    speed: 1,
    awaiting: null,
    encounter: null,
    uid: 0
  };

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, Math.max(0, ms / state.speed));
    });
  }

  function makeUnit(spec) {
    var u = {
      id: "u" + state.uid++,
      name: spec.name,
      side: spec.side,
      field: spec.field || "on",
      element: spec.element,
      role: spec.role || "attack",
      maxHp: spec.hp,
      hp: spec.hp,
      atk: spec.atk,
      spd: spec.spd,
      shield: 0,
      buff: 1,
      buffTurns: 0,
      alive: true,
      maxToughness: spec.tough || 0,
      toughness: spec.tough || 0,
      weak: spec.weak || [],
      broken: false,
      stunTurns: 0,
      el: null
    };
    return u;
  }

  function playerUnits() {
    var out = [];
    selection.on.forEach(function (name) {
      var s = playerStats(name);
      out.push(makeUnit({ name: name, side: "player", field: "on", element: s.element, role: s.role, hp: s.hp, atk: s.atk, spd: s.spd }));
    });
    selection.off.forEach(function (name) {
      var s = playerStats(name);
      out.push(makeUnit({ name: name, side: "player", field: "off", element: s.element, role: s.role, hp: Math.round(s.hp * 0.8), atk: s.atk, spd: s.spd }));
    });
    return out;
  }

  function enemyUnits(encounter) {
    var out = [];
    encounter.units.forEach(function (key) {
      var a = ENEMY_ARCHETYPES[key];
      out.push(makeUnit({ name: a.name, side: "enemy", field: "on", element: a.element, role: a.role || "attack", hp: a.hp, atk: a.atk, spd: a.spd, tough: a.tough, weak: a.weak }));
    });
    return out;
  }

  function unitEl(unit) {
    var wrap = document.createElement("div");
    wrap.className = "unit " + (unit.side === "enemy" ? "enemy" : "player") + (unit.field === "off" ? " off" : "");
    wrap.dataset.id = unit.id;

    var color = ELEMENTS[unit.element].color;
    var html =
      "<div class='unit-circle' style='--el:" + color + "'>" +
      "<span class='unit-el'>" + ELEMENTS[unit.element].icon + "</span>" +
      "</div>" +
      "<div class='unit-name'>" + unit.name + "</div>" +
      "<div class='unit-bars'>" +
      (unit.maxToughness ? "<div class='tough-bar'><div class='tough-fill'></div></div>" : "") +
      "<div class='hp-bar'><div class='hp-fill'></div></div>" +
      "</div>";

    wrap.innerHTML = html;
    unit.el = wrap;
    unit.hpFill = wrap.querySelector(".hp-fill");
    unit.toughFill = wrap.querySelector(".tough-fill");
    return wrap;
  }

  function updateBars(unit) {
    if (unit.hpFill) {
      unit.hpFill.style.width = Math.max(0, (unit.hp / unit.maxHp) * 100) + "%";
    }
    if (unit.toughFill) {
      unit.toughFill.style.width = Math.max(0, (unit.toughness / unit.maxToughness) * 100) + "%";
      unit.toughFill.classList.toggle("broken", unit.broken);
    }
    if (unit.el) {
      unit.el.classList.toggle("shielded", unit.shield > 0);
    }
  }

  function renderField() {
    playerOnField.innerHTML = "";
    playerOffField.innerHTML = "";
    enemyField.innerHTML = "";
    state.units.forEach(function (u) {
      var el = unitEl(u);
      if (u.side === "enemy") {
        enemyField.appendChild(el);
      } else if (u.field === "off") {
        playerOffField.appendChild(el);
      } else {
        playerOnField.appendChild(el);
      }
      updateBars(u);
    });
  }

  function unitCenter(unit) {
    var r = unit.el.getBoundingClientRect();
    var b = battlefield.getBoundingClientRect();
    return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
  }

  function projectile(from, to, color) {
    var a = unitCenter(from);
    var z = unitCenter(to);
    var el = document.createElement("div");
    el.className = "fx-projectile";
    el.style.left = a.x + "px";
    el.style.top = a.y + "px";
    el.style.background = color;
    battlefield.appendChild(el);
    requestAnimationFrame(function () {
      el.style.transform = "translate(" + (z.x - a.x) + "px," + (z.y - a.y) + "px)";
      el.style.opacity = "0.15";
    });
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300 / state.speed);
  }

  function floatText(unit, text, cls) {
    var c = unitCenter(unit);
    var el = document.createElement("div");
    el.className = "fx-text " + (cls || "");
    el.textContent = text;
    el.style.left = c.x + "px";
    el.style.top = c.y + "px";
    battlefield.appendChild(el);
    requestAnimationFrame(function () {
      el.style.transform = "translateY(-42px)";
      el.style.opacity = "0";
    });
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 850 / state.speed);
  }

  function hitFlash(unit) {
    unit.el.classList.add("hit");
    setTimeout(function () {
      unit.el.classList.remove("hit");
    }, 200 / state.speed);
  }

  function log(text) {
    var line = document.createElement("div");
    line.className = "log-line";
    line.textContent = text;
    battleLog.appendChild(line);
    while (battleLog.childNodes.length > 9) {
      battleLog.removeChild(battleLog.firstChild);
    }
    battleLog.scrollTop = battleLog.scrollHeight;
  }

  function aliveUnits(side) {
    return state.units.filter(function (u) {
      return u.alive && (side === undefined || u.side === side);
    });
  }

  function lowestHp(list) {
    var best = null;
    list.forEach(function (u) {
      if (!best || u.hp < best.hp) best = u;
    });
    return best;
  }

  function chooseEnemyTarget() {
    return lowestHp(aliveUnits("enemy"));
  }

  function choosePlayerTarget() {
    var onField = aliveUnits("player").filter(function (u) { return u.field === "on"; });
    return lowestHp(onField.length ? onField : aliveUnits("player"));
  }

  function chooseAllyFor(unit) {
    var allies = aliveUnits(unit.side);
    var hurt = allies.filter(function (u) { return u.hp < u.maxHp; });
    return lowestHp(hurt.length ? hurt : allies);
  }

  function applyDamage(target, dmg) {
    if (target.shield > 0) {
      var absorbed = Math.min(target.shield, dmg);
      target.shield -= absorbed;
      dmg -= absorbed;
    }
    target.hp -= dmg;
    if (target.hp <= 0) {
      target.hp = 0;
      target.alive = false;
      target.el.classList.add("dead");
      log(target.name + " is defeated!");
    }
    updateBars(target);
  }

  function breakUnit(unit) {
    unit.broken = true;
    unit.stunTurns = 1;
    log("Weakness Break! " + unit.name + " is delayed.");
    var c = unitCenter(unit);
    var burst = document.createElement("div");
    burst.className = "fx-break";
    burst.style.left = c.x + "px";
    burst.style.top = c.y + "px";
    battlefield.appendChild(burst);
    setTimeout(function () {
      if (burst.parentNode) burst.parentNode.removeChild(burst);
    }, 500 / state.speed);
    updateBars(unit);
  }

  async function attackAction(attacker, target) {
    if (!target || !target.alive) return;
    await sleep(140);
    projectile(attacker, target, ELEMENTS[attacker.element].color);

    var mult = 0.9 + Math.random() * 0.2;
    var dmg = attacker.atk * attacker.buff * mult;
    var weak = target.weak && target.weak.indexOf(attacker.element) !== -1;
    if (weak) dmg *= 1.5;
    if (target.broken) dmg *= 1.2;
    dmg = Math.round(dmg);

    hitFlash(target);
    applyDamage(target, dmg);
    floatText(target, "-" + dmg, weak ? "weak" : "dmg");
    log(attacker.name + " hits " + target.name + " for " + dmg + (weak ? " (weakness!)" : "") + ".");

    if (weak && target.maxToughness && target.alive) {
      target.toughness -= 30;
      if (target.toughness <= 0 && !target.broken) {
        target.toughness = 0;
        breakUnit(target);
      } else {
        updateBars(target);
      }
    }
    await sleep(220);
  }

  async function healAction(unit) {
    var ally = chooseAllyFor(unit);
    if (!ally || ally.hp >= ally.maxHp) {
      var foe = chooseEnemyTarget();
      if (foe) {
        await attackAction(unit, foe);
      }
      return;
    }
    await sleep(140);
    var amount = Math.round(unit.atk * 1.4);
    ally.hp = Math.min(ally.maxHp, ally.hp + amount);
    updateBars(ally);
    floatText(ally, "+" + amount, "heal");
    log(unit.name + " heals " + ally.name + " for " + amount + ".");
    await sleep(200);
  }

  async function shieldAction(unit) {
    var ally = chooseAllyFor(unit) || unit;
    await sleep(140);
    var amount = Math.round(unit.atk * 2);
    ally.shield += amount;
    updateBars(ally);
    floatText(ally, "+" + amount + " shield", "shield");
    log(unit.name + " shields " + ally.name + " for " + amount + ".");
    await sleep(200);
  }

  async function supportAction(unit) {
    var allies = aliveUnits(unit.side);
    var ally = allies.length ? pick(allies) : unit;
    await sleep(140);
    ally.buff = 1.3;
    ally.buffTurns = 3;
    floatText(ally, "ATK+", "buff");
    log(unit.name + " empowers " + ally.name + " (ATK +30%).");
    await sleep(180);
  }

  function tickBuffs(unit) {
    if (unit.buffTurns > 0) {
      unit.buffTurns--;
      if (unit.buffTurns === 0) {
        unit.buff = 1;
      }
    }
  }

  function waitForTarget(valid) {
    return new Promise(function (resolve) {
      state.awaiting = { valid: valid, resolve: resolve };
      aliveUnits().forEach(function (u) {
        if (valid(u)) u.el.classList.add("targetable");
      });
    });
  }

  function clearTargeting() {
    state.units.forEach(function (u) {
      if (u.el) u.el.classList.remove("targetable");
    });
  }

  async function playerAct(unit) {
    var attackerOnField = unit.field === "on" && unit.role === "attack";
    if (attackerOnField && !state.auto && aliveUnits("enemy").length) {
      var target = await waitForTarget(function (u) {
        return u.side === "enemy" && u.alive;
      });
      clearTargeting();
      state.awaiting = null;
      if (target) {
        await attackAction(unit, target);
      }
      return;
    }
    await autoAction(unit);
  }

  async function autoAction(unit) {
    if (unit.role === "heal") return healAction(unit);
    if (unit.role === "shield") return shieldAction(unit);
    if (unit.role === "support" || unit.field === "off") return supportAction(unit);
    var target = chooseEnemyTarget();
    if (target) await attackAction(unit, target);
  }

  async function enemyAct(unit) {
    if (unit.role === "heal") {
      var ally = chooseAllyFor(unit);
      if (ally && ally.hp < ally.maxHp) {
        await healAction(unit);
        return;
      }
    }
    var target = choosePlayerTarget();
    if (target) await attackAction(unit, target);
  }

  function checkEnd() {
    if (!aliveUnits("enemy").length) {
      endBattle(true);
      return true;
    }
    if (!aliveUnits("player").length) {
      endBattle(false);
      return true;
    }
    return false;
  }

  function endBattle(victory) {
    state.running = false;
    clearTargeting();
    battleResultTitle.textContent = victory ? "Victory" : "Defeat";
    battleResultSub.textContent = victory
      ? "The competitor squad is wiped out."
      : "Your team has fallen. Review and try again.";
    battleResult.hidden = false;
  }

  async function runBattle() {
    state.running = true;
    while (state.running) {
      var order = aliveUnits().slice().sort(function (a, b) {
        return b.spd - a.spd;
      });
      state.round++;
      battleRoundEl.textContent = "Round " + state.round;
      for (var i = 0; i < order.length; i++) {
        if (!state.running) return;
        var unit = order[i];
        if (!unit.alive) continue;

        if (unit.stunTurns > 0) {
          unit.stunTurns--;
          log(unit.name + " is delayed and skips a turn.");
          if (unit.broken && unit.stunTurns === 0) {
            unit.broken = false;
            unit.toughness = unit.maxToughness;
            updateBars(unit);
          }
          await sleep(300);
          continue;
        }

        if (unit.side === "enemy") {
          await enemyAct(unit);
        } else {
          await playerAct(unit);
        }
        tickBuffs(unit);
        if (checkEnd()) return;
      }
      await sleep(200);
    }
  }

  function startBattle(encounterId) {
    var encounter = ENCOUNTERS.filter(function (e) { return e.id === encounterId; })[0] || ENCOUNTERS[0];
    state.units = playerUnits().concat(enemyUnits(encounter));
    state.round = 0;
    state.running = false;
    state.auto = false;
    state.speed = 1;
    state.awaiting = null;
    state.encounter = encounter;
    state.uid = 0;

    autoToggle.textContent = "Auto: Off";
    speedToggle.textContent = "Speed: 1x";
    battleEncounterEl.textContent = encounter.name;
    battleRoundEl.textContent = "Round 1";
    battleLog.innerHTML = "";
    battleResult.hidden = true;

    renderField();
    CW.showScreen(battleScreen);
    log("Battle start: " + selection.on.length + " on-field, " + selection.off.length + " off-field vs " + encounter.name + ".");

    runBattle();
  }

  /* ---------------------------------------------------------------------- */
  /* Wiring                                                                  */
  /* ---------------------------------------------------------------------- */

  function stopBattle() {
    state.running = false;
    clearTargeting();
    if (state.awaiting) {
      var resolve = state.awaiting.resolve;
      state.awaiting = null;
      resolve(null);
    }
  }

  function wire() {
    rosterList.addEventListener("click", function (event) {
      var addBtn = event.target.closest(".mini-btn");
      if (addBtn) {
        addUnit(addBtn.getAttribute("data-name"), addBtn.getAttribute("data-add"));
        return;
      }
      var row = event.target.closest(".roster-row");
      if (row) {
        addUnit(row.getAttribute("data-name"), "on");
      }
    });

    rosterSearch.addEventListener("input", function () {
      searchTerm = rosterSearch.value.trim().toLowerCase();
      buildRoster();
    });

    [onFieldSlots, offFieldSlots].forEach(function (container) {
      container.addEventListener("click", function (event) {
        var x = event.target.closest(".chip-x");
        if (x) removeUnit(x.getAttribute("data-remove"));
      });
    });

    encounterPicker.addEventListener("click", function (event) {
      var card = event.target.closest(".enc-card");
      if (!card) return;
      chosenEncounter = card.getAttribute("data-enc");
      buildEncounters();
    });

    quickFillBtn.addEventListener("click", quickFill);
    setupBackBtn.addEventListener("click", function () {
      CW.showScreen(modesScreen);
    });
    beginBattleBtn.addEventListener("click", function () {
      startBattle(chosenEncounter);
    });

    battlefield.addEventListener("click", function (event) {
      if (!state.awaiting) return;
      var el = event.target.closest(".unit");
      if (!el) return;
      var unit = state.units.filter(function (u) { return u.id === el.dataset.id; })[0];
      if (!unit || !state.awaiting.valid(unit)) return;
      var resolve = state.awaiting.resolve;
      state.awaiting = null;
      clearTargeting();
      resolve(unit);
    });

    autoToggle.addEventListener("click", function () {
      state.auto = !state.auto;
      autoToggle.textContent = "Auto: " + (state.auto ? "On" : "Off");
      if (state.auto && state.awaiting) {
        var resolve = state.awaiting.resolve;
        state.awaiting = null;
        clearTargeting();
        resolve(chooseEnemyTarget());
      }
    });

    speedToggle.addEventListener("click", function () {
      state.speed = state.speed === 1 ? 2 : 1;
      speedToggle.textContent = "Speed: " + state.speed + "x";
    });

    battleBackBtn.addEventListener("click", function () {
      stopBattle();
      CW.showScreen(setupScreen);
    });

    battleAgainBtn.addEventListener("click", function () {
      startBattle(state.encounter.id);
    });

    battleExitBtn.addEventListener("click", function () {
      battleResult.hidden = true;
      CW.showScreen(setupScreen);
    });
  }

  window.CWBattle = {
    openSetup: openSetup,
    _internals: {
      costOf: costOf,
      elementOf: elementOf,
      roleOf: roleOf,
      playerStats: playerStats,
      ELEMENTS: ELEMENTS,
      ENEMY_ARCHETYPES: ENEMY_ARCHETYPES,
      ENCOUNTERS: ENCOUNTERS
    }
  };

  if (setupScreen && battleScreen && battlefield) {
    wire();
  }
})();
