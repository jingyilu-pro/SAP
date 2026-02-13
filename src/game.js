const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const TEAM_SLOTS = 5;
const SHOP_PET_SLOTS = 5;
const SHOP_FOOD_SLOTS = 2;
const MAX_TROPHIES = 10;
const START_LIVES = 10;
const TURN_GOLD = 10;
const PET_COST = 3;
const FOOD_COST = 3;
const REROLL_COST = 1;
const BATTLE_STEP_SECONDS = 0.52;
const BATTLE_RESULT_HOLD_SECONDS = 1.8;
const TRIGGER_PRIORITY = {
  start: 10,
  pre_attack: 20,
  attack: 30,
  hurt: 40,
  cleanup: 50,
  faint: 60,
};

const HURT_ABILITIES = new Set(["hurt_buff_rear", "hurt_gain_attack"]);
const FAINT_ABILITIES = new Set([
  "faint_buff_random_ally",
  "faint_buff_rear",
  "faint_give_melon_friend_behind",
  "faint_summon_zombie",
]);
const LANGUAGE_STORAGE_KEY = "sap_clone_language";
const SUPPORTED_LANGUAGES = new Set(["en", "zh"]);

const PET_NAME_ZH = {
  ant: "蚂蚁",
  fish: "鱼",
  beaver: "海狸",
  cricket: "蟋蟀",
  mosquito: "蚊子",
  otter: "水獭",
  swan: "天鹅",
  horse: "马",
  flamingo: "火烈鸟",
  camel: "骆驼",
  kangaroo: "袋鼠",
  giraffe: "长颈鹿",
  rabbit: "兔子",
  peacock: "孔雀",
  dodo: "渡渡鸟",
  penguin: "企鹅",
  turtle: "海龟",
  zombie_cricket: "僵尸蟋蟀",
  bee: "蜜蜂",
};

const FOOD_NAME_ZH = {
  apple: "苹果",
  honey: "蜂蜜",
  meat: "牛排",
  garlic: "蒜头",
  pear: "梨",
  salad: "沙拉",
  cupcake: "纸杯蛋糕",
  canned_food: "罐头",
  melon: "蜜瓜",
  chocolate: "巧克力",
};

const I18N = {
  en: {
    language_name: "English",
    language_switch_target: "中文",
    side_friendly: "Friendly",
    side_enemy: "Enemy",
    top_round: ({ round }) => `Round ${round}`,
    top_gold: ({ gold }) => `Gold ${gold}`,
    top_lives: ({ lives }) => `Lives ${lives}`,
    top_trophy: ({ trophies }) => `Trophy ${trophies}`,
    top_max: "MAX",
    top_level_xp: ({ level, xp }) => `Lvl ${level} XP ${xp}`,
    top_tier_shop: ({ tier }) => `Tier ${tier} Shop`,
    ui_team_front: "Team (front -> back)",
    ui_shop_pets: "Shop Pets",
    ui_shop_food: "Shop Food",
    ui_reroll: "Reroll (R)",
    ui_freeze: "Freeze (X)",
    ui_sell: "Sell (S)",
    ui_end_turn: "End Turn (E)",
    ui_test_presets: "Test Presets",
    ui_controls: "Controls: click/drag cards, drag pet to Sell, right click shop to freeze, F fullscreen, L language",
    preset_chocolate: "Choco",
    preset_melon: "Melon",
    preset_dodo: "Dodo",
    preset_penguin: "Peng",
    preset_turtle: "Turtle",
    menu_title: "Super Auto Pets",
    menu_subtitle: "Steam-inspired auto battler clone",
    menu_line1: "Build your team in shop, then auto-battle each round.",
    menu_line2: "Merge pets, feed food, and reach 10 trophies before 0 lives.",
    menu_start: "Start Game",
    battle_phase: "Battle Phase",
    battle_your_team: "Your Team",
    battle_enemy_team: "Enemy Team",
    battle_log: "Combat Log",
    battle_result_win: "Victory!",
    battle_result_lose: "Defeat!",
    battle_result_draw: "Draw!",
    over_win: "You Win!",
    over_lose: "Game Over",
    over_round: ({ round }) => `Round reached: ${round}`,
    over_trophies: ({ trophies, max }) => `Trophies: ${trophies} / ${max}`,
    over_lives: ({ lives }) => `Lives left: ${lives}`,
    over_restart: "Play Again",
    pet_lv_exp: ({ level, exp }) => `Lv ${level}  Exp ${exp}`,
    token_attack: ({ value }) => `A ${value}`,
    token_health: ({ value }) => `H ${value}`,
    drag_default: "drag",
    drag_team: "team",
    drag_pet: "pet",
    drag_food: "food",
    perk_meat: "MEAT",
    perk_garlic: "GARLIC",
    perk_melon: "MELON",
    food_effect_stat_1_1: "stat +1/+1",
    food_effect_summon_bee: "summon bee",
    food_effect_perk_meat: "perk meat",
    food_effect_perk_garlic: "perk garlic",
    food_effect_stat_2_2: "stat +2/+2",
    food_effect_team_random_buff_1_1: "buff 2 allies +1/+1",
    food_effect_temp_3_3: "temp +3/+3",
    food_effect_shop_buff_2_1: "shop buff +2/+1",
    food_effect_perk_melon: "perk melon",
    food_effect_exp_1: "exp +1",
    toast_language_switched: ({ language }) => `Language switched: ${language}.`,
    toast_level_up_player: ({ level }) => `Level up! Reached level ${level}.`,
    toast_not_enough_gold_reroll: "Not enough gold for reroll.",
    toast_no_pet_to_sell: "No pet to sell.",
    toast_sold_pet_gold: "Sold pet for 1 gold.",
    toast_pet_level_buff: ({ pet, buff }) => `${pet} leveled: team buff +${buff}/+${buff}.`,
    toast_buffed_shop_pet: ({ pet }) => `${pet} buffed a shop pet.`,
    toast_scenario_chocolate: "Scenario loaded: Chocolate -> Fish level up.",
    toast_scenario_melon: "Scenario loaded: Melon block test.",
    toast_scenario_dodo: "Scenario loaded: Dodo start-battle buff.",
    toast_scenario_penguin: "Scenario loaded: Penguin end-turn buff.",
    toast_scenario_turtle: "Scenario loaded: Turtle faint -> melon.",
    toast_empty_shop_slot: "Empty shop slot.",
    toast_not_enough_gold: "Not enough gold.",
    toast_cannot_stack: "Cannot stack different pets.",
    toast_joined_team: ({ pet }) => `${pet} joined the team.`,
    toast_merged_stats: ({ pet }) => `${pet} merged and gained stats.`,
    toast_empty_food_slot: "Empty food slot.",
    toast_select_pet_first: "Select a pet first.",
    toast_pet_ate_food: ({ pet, food }) => `${pet} ate ${food}.`,
    toast_used_food: ({ food }) => `Used ${food}.`,
    toast_select_shop_slot: "Select a shop slot first.",
    toast_only_shop_freeze: "Only shop slots can be frozen.",
    toast_select_team_to_sell: "Select a team pet to sell.",
    toast_victory_trophy: "Victory! +1 trophy.",
    toast_defeat_life: ({ loss }) => `Defeat! -${loss} life${loss > 1 ? "s" : ""}.`,
    toast_draw: "Draw.",
    toast_place_pet: "Place at least one pet.",
    log_trigger_guard: "Trigger queue guard reached.",
    log_both_fainted: "Both teams fainted.",
    log_enemy_wins: "Enemy wins this round.",
    log_you_win: "You win this round.",
    log_dodo_buff: ({ side, target, bonus }) => `${side} Dodo buffs ${target} +${bonus} attack.`,
    log_ping: ({ side, actor, target }) => `${side} ${actor} pings ${target} for 1.`,
    log_melon_block: ({ defender }) => `${defender}'s Melon blocks the hit.`,
    log_horse_buff: ({ side, bonus }) => `${side} Horse buffs summoned ally +${bonus} attack.`,
    log_ant_buff: ({ side, target }) => `${side} Ant buffs ${target}.`,
    log_flamingo_buff: ({ side }) => `${side} Flamingo buffs rear ally.`,
    log_turtle_melon: ({ side, target }) => `${side} Turtle gives Melon to ${target}.`,
    log_cricket_summon: ({ side }) => `${side} Cricket summons Zombie.`,
    log_pet_summon: ({ side, pet, summon }) => `${side} ${pet} summons ${summon}.`,
    log_camel_buff: ({ side }) => `${side} Camel buffs friend behind.`,
    log_peacock_hurt: ({ side }) => `${side} Peacock gains attack from hurt.`,
    log_trade: ({ attacker, defender }) => `${attacker} trades with ${defender}.`,
    log_battle_started: "Battle started.",
  },
  zh: {
    language_name: "中文",
    language_switch_target: "EN",
    side_friendly: "友方",
    side_enemy: "敌方",
    top_round: ({ round }) => `第 ${round} 回合`,
    top_gold: ({ gold }) => `金币 ${gold}`,
    top_lives: ({ lives }) => `生命 ${lives}`,
    top_trophy: ({ trophies }) => `奖杯 ${trophies}`,
    top_max: "满级",
    top_level_xp: ({ level, xp }) => `等级 ${level} 经验 ${xp}`,
    top_tier_shop: ({ tier }) => `${tier} 级商店`,
    ui_team_front: "队伍（前排 -> 后排）",
    ui_shop_pets: "宠物商店",
    ui_shop_food: "食物商店",
    ui_reroll: "刷新 (R)",
    ui_freeze: "冻结 (X)",
    ui_sell: "出售 (S)",
    ui_end_turn: "结束回合 (E)",
    ui_test_presets: "测试预设",
    ui_controls: "操作：点击/拖拽卡片，拖拽宠物到出售，右键冻结商店，F 全屏，L 语言",
    preset_chocolate: "巧克力",
    preset_melon: "蜜瓜",
    preset_dodo: "渡渡鸟",
    preset_penguin: "企鹅",
    preset_turtle: "海龟",
    menu_title: "超级自动宠物",
    menu_subtitle: "受 Steam 启发的自走对战复刻",
    menu_line1: "在商店构建队伍，然后每回合自动战斗。",
    menu_line2: "合成宠物、喂食物，在生命归零前拿到 10 个奖杯。",
    menu_start: "开始游戏",
    battle_phase: "战斗阶段",
    battle_your_team: "我方队伍",
    battle_enemy_team: "敌方队伍",
    battle_log: "战斗日志",
    battle_result_win: "胜利！",
    battle_result_lose: "失败！",
    battle_result_draw: "平局！",
    over_win: "你赢了！",
    over_lose: "游戏结束",
    over_round: ({ round }) => `到达回合：${round}`,
    over_trophies: ({ trophies, max }) => `奖杯：${trophies} / ${max}`,
    over_lives: ({ lives }) => `剩余生命：${lives}`,
    over_restart: "再来一局",
    pet_lv_exp: ({ level, exp }) => `等级 ${level} 经验 ${exp}`,
    token_attack: ({ value }) => `攻 ${value}`,
    token_health: ({ value }) => `血 ${value}`,
    drag_default: "拖拽",
    drag_team: "队伍",
    drag_pet: "宠物",
    drag_food: "食物",
    perk_meat: "肉",
    perk_garlic: "蒜",
    perk_melon: "蜜瓜",
    food_effect_stat_1_1: "属性 +1/+1",
    food_effect_summon_bee: "召唤蜜蜂",
    food_effect_perk_meat: "获得肉",
    food_effect_perk_garlic: "获得蒜",
    food_effect_stat_2_2: "属性 +2/+2",
    food_effect_team_random_buff_1_1: "随机 2 友军 +1/+1",
    food_effect_temp_3_3: "本回合 +3/+3",
    food_effect_shop_buff_2_1: "商店宠物 +2/+1",
    food_effect_perk_melon: "获得蜜瓜",
    food_effect_exp_1: "经验 +1",
    toast_language_switched: ({ language }) => `语言已切换：${language}。`,
    toast_level_up_player: ({ level }) => `升级！到达等级 ${level}。`,
    toast_not_enough_gold_reroll: "金币不足，无法刷新。",
    toast_no_pet_to_sell: "没有可出售的宠物。",
    toast_sold_pet_gold: "出售宠物，获得 1 金币。",
    toast_pet_level_buff: ({ pet, buff }) => `${pet} 升级：全队 +${buff}/+${buff}。`,
    toast_buffed_shop_pet: ({ pet }) => `${pet} 强化了一个商店宠物。`,
    toast_scenario_chocolate: "已加载预设：巧克力让鱼升级。",
    toast_scenario_melon: "已加载预设：蜜瓜护盾测试。",
    toast_scenario_dodo: "已加载预设：渡渡鸟开战加攻。",
    toast_scenario_penguin: "已加载预设：企鹅回合末增益。",
    toast_scenario_turtle: "已加载预设：海龟遗言给蜜瓜。",
    toast_empty_shop_slot: "该商店位置为空。",
    toast_not_enough_gold: "金币不足。",
    toast_cannot_stack: "不同宠物不能直接合成。",
    toast_joined_team: ({ pet }) => `${pet} 加入了队伍。`,
    toast_merged_stats: ({ pet }) => `${pet} 合成并提升了属性。`,
    toast_empty_food_slot: "该食物位置为空。",
    toast_select_pet_first: "请先选择宠物。",
    toast_pet_ate_food: ({ pet, food }) => `${pet} 吃下了 ${food}。`,
    toast_used_food: ({ food }) => `使用了 ${food}。`,
    toast_select_shop_slot: "请先选择商店格子。",
    toast_only_shop_freeze: "只能冻结商店格子。",
    toast_select_team_to_sell: "请选择一个队伍宠物进行出售。",
    toast_victory_trophy: "胜利！+1 奖杯。",
    toast_defeat_life: ({ loss }) => `失败！-${loss} 生命。`,
    toast_draw: "平局。",
    toast_place_pet: "请至少放置一只宠物。",
    log_trigger_guard: "触发队列达到保护上限。",
    log_both_fainted: "双方队伍同时阵亡。",
    log_enemy_wins: "敌方赢下了本回合。",
    log_you_win: "你赢下了本回合。",
    log_dodo_buff: ({ side, target, bonus }) => `${side} 渡渡鸟给 ${target} +${bonus} 攻击。`,
    log_ping: ({ side, actor, target }) => `${side} ${actor} 对 ${target} 造成 1 点伤害。`,
    log_melon_block: ({ defender }) => `${defender} 的蜜瓜抵挡了伤害。`,
    log_horse_buff: ({ side, bonus }) => `${side} 马给召唤友军 +${bonus} 攻击。`,
    log_ant_buff: ({ side, target }) => `${side} 蚂蚁强化了 ${target}。`,
    log_flamingo_buff: ({ side }) => `${side} 火烈鸟强化了后排友军。`,
    log_turtle_melon: ({ side, target }) => `${side} 海龟给 ${target} 提供了蜜瓜。`,
    log_cricket_summon: ({ side }) => `${side} 蟋蟀召唤了僵尸蟋蟀。`,
    log_pet_summon: ({ side, pet, summon }) => `${side} ${pet} 召唤了 ${summon}。`,
    log_camel_buff: ({ side }) => `${side} 骆驼强化了身后友军。`,
    log_peacock_hurt: ({ side }) => `${side} 孔雀受伤后增加了攻击。`,
    log_trade: ({ attacker, defender }) => `${attacker} 与 ${defender} 互换攻击。`,
    log_battle_started: "战斗开始。",
  },
};

const petPool = [
  { kind: "ant", name: "Ant", tier: 1, attack: 2, health: 1, color: "#d98f4e", ability: "faint_buff_random_ally" },
  { kind: "fish", name: "Fish", tier: 1, attack: 2, health: 3, color: "#72b8ea", ability: "level_buff_team" },
  { kind: "beaver", name: "Beaver", tier: 1, attack: 2, health: 2, color: "#ab7d61", ability: "sell_buff_attack" },
  { kind: "cricket", name: "Cricket", tier: 1, attack: 1, health: 2, color: "#8ac95f", ability: "faint_summon_zombie" },
  { kind: "mosquito", name: "Mosquito", tier: 1, attack: 2, health: 2, color: "#8a7ef2", ability: "start_ping_enemy" },
  { kind: "otter", name: "Otter", tier: 1, attack: 1, health: 2, color: "#8f9fc2", ability: "buy_buff_random_shop_pet" },
  { kind: "swan", name: "Swan", tier: 1, attack: 1, health: 3, color: "#e3f3ff", ability: "start_turn_gain_gold" },
  { kind: "horse", name: "Horse", tier: 1, attack: 2, health: 1, color: "#af8868", ability: "friend_summoned_attack" },
  { kind: "flamingo", name: "Flamingo", tier: 2, attack: 3, health: 2, color: "#f08da8", ability: "faint_buff_rear" },
  { kind: "camel", name: "Camel", tier: 2, attack: 2, health: 5, color: "#d1ba75", ability: "hurt_buff_rear" },
  { kind: "kangaroo", name: "Kangaroo", tier: 2, attack: 1, health: 3, color: "#c58c42", ability: "behind_attack_gain" },
  { kind: "giraffe", name: "Giraffe", tier: 2, attack: 2, health: 4, color: "#e8b85e", ability: "end_turn_buff_friend_ahead" },
  { kind: "rabbit", name: "Rabbit", tier: 2, attack: 3, health: 2, color: "#f5f0f7", ability: "friend_eat_bonus_health" },
  { kind: "peacock", name: "Peacock", tier: 2, attack: 2, health: 5, color: "#76b7c2", ability: "hurt_gain_attack" },
  { kind: "dodo", name: "Dodo", tier: 2, attack: 2, health: 3, color: "#d7ad7b", ability: "start_battle_buff_friend_ahead_attack" },
  { kind: "penguin", name: "Penguin", tier: 3, attack: 1, health: 2, color: "#5d7d9f", ability: "end_turn_buff_level2_friends" },
  { kind: "turtle", name: "Turtle", tier: 3, attack: 1, health: 2, color: "#6aaa77", ability: "faint_give_melon_friend_behind" },
];

const foodPool = [
  { kind: "apple", name: "Apple", tier: 1, color: "#e55e57", effect: "stat_1_1" },
  { kind: "honey", name: "Honey", tier: 1, color: "#e0aa35", effect: "summon_bee" },
  { kind: "meat", name: "Meat", tier: 1, color: "#d66a4f", effect: "perk_meat" },
  { kind: "garlic", name: "Garlic", tier: 1, color: "#b9b3a6", effect: "perk_garlic" },
  { kind: "pear", name: "Pear", tier: 2, color: "#8dc95f", effect: "stat_2_2" },
  { kind: "salad", name: "Salad", tier: 2, color: "#62c26e", effect: "team_random_buff_1_1" },
  { kind: "cupcake", name: "Cupcake", tier: 2, color: "#f29ec0", effect: "temp_3_3" },
  { kind: "canned_food", name: "Can", tier: 2, color: "#8ea7bb", effect: "shop_buff_2_1" },
  { kind: "melon", name: "Melon", tier: 3, color: "#8fdc78", effect: "perk_melon" },
  { kind: "chocolate", name: "Chocolate", tier: 3, color: "#9f7a58", effect: "exp_1" },
];

function t(key, params = {}) {
  const current = I18N[state.language] || I18N.en;
  const fallback = I18N.en[key];
  const value = current[key] ?? fallback ?? key;
  return typeof value === "function" ? value(params) : value;
}

function petDisplayName(pet) {
  if (!pet) return "";
  if (state.language !== "zh") return pet.name;
  return PET_NAME_ZH[pet.kind] ?? pet.name;
}

function foodDisplayName(food) {
  if (!food) return "";
  if (state.language !== "zh") return food.name;
  return FOOD_NAME_ZH[food.kind] ?? food.name;
}

function summonDisplayNameFromTemplate(template) {
  if (!template) return "";
  if (state.language !== "zh") return template.name;
  return PET_NAME_ZH[template.kind] ?? template.name;
}

function perkDisplayName(perk) {
  if (!perk) return "";
  return t(`perk_${perk}`);
}

function foodEffectDisplayName(effect) {
  return t(`food_effect_${effect}`);
}

function persistLanguagePreference() {
  try {
    window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, state.language);
  } catch {
    // Ignore persistence failures (private mode / blocked storage).
  }
}

function restoreLanguagePreference() {
  try {
    const saved = window.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.has(saved)) {
      state.language = saved;
    }
  } catch {
    // Ignore restore failures and keep default language.
  }
}

function toggleLanguage() {
  state.language = state.language === "en" ? "zh" : "en";
  persistLanguagePreference();
  pushToast(t("toast_language_switched", { language: t("language_name") }));
}

function rect(x, y, w, h) {
  return { x, y, w, h };
}

function buildRow(x, y, count, w, h, gap) {
  const out = [];
  for (let i = 0; i < count; i += 1) out.push(rect(x + i * (w + gap), y, w, h));
  return out;
}

const ui = {
  startButton: rect(490, 325, 300, 86),
  teamSlots: buildRow(70, 128, TEAM_SLOTS, 220, 122, 16),
  shopPetSlots: buildRow(70, 306, SHOP_PET_SLOTS, 220, 122, 16),
  shopFoodSlots: buildRow(70, 466, SHOP_FOOD_SLOTS, 220, 122, 16),
  rerollBtn: rect(1096, 132, 154, 56),
  freezeBtn: rect(1096, 202, 154, 56),
  sellBtn: rect(1096, 272, 154, 56),
  endTurnBtn: rect(1096, 342, 154, 68),
  restartBtn: rect(530, 420, 220, 64),
  languageBtn: rect(1134, 42, 104, 50),
  debugButtons: buildRow(820, 622, 5, 82, 36, 10),
};

const debugScenarioButtons = [
  { key: "chocolate" },
  { key: "melon" },
  { key: "dodo" },
  { key: "penguin" },
  { key: "turtle" },
];

const state = {
  mode: "menu",
  language: "en",
  rngSeed: Math.floor(Date.now() % 2147483647),
  nextId: 1,
  round: 1,
  playerLevel: 1,
  playerXp: 0,
  lives: START_LIVES,
  trophies: 0,
  gold: TURN_GOLD,
  shopBuffAttack: 0,
  shopBuffHealth: 0,
  team: Array(TEAM_SLOTS).fill(null),
  shopPets: Array(SHOP_PET_SLOTS).fill(null),
  shopFood: Array(SHOP_FOOD_SLOTS).fill(null),
  freezePets: Array(SHOP_PET_SLOTS).fill(false),
  freezeFood: Array(SHOP_FOOD_SLOTS).fill(false),
  selected: null,
  toast: "",
  toastTime: 0,
  battle: null,
  enemyPreview: [],
  drag: null,
  debugEnemyPreset: null,
};

let lastFrameMs = performance.now();

function seededRandom() {
  state.rngSeed = (1664525 * state.rngSeed + 1013904223) >>> 0;
  return state.rngSeed / 4294967296;
}

function randomChoice(list) {
  if (!list.length) return null;
  return list[Math.floor(seededRandom() * list.length)];
}

function randInt(min, max) {
  return min + Math.floor(seededRandom() * (max - min + 1));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
}

function pointInRect(px, py, box) {
  return px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h;
}

function entityAtPosition(slots, x, y) {
  for (let i = 0; i < slots.length; i += 1) {
    if (pointInRect(x, y, slots[i])) return i;
  }
  return -1;
}

function getTierForRound(round) {
  if (round >= 11) return 6;
  if (round >= 9) return 5;
  if (round >= 7) return 4;
  if (round >= 5) return 3;
  if (round >= 3) return 2;
  return 1;
}

function maxUnlockedTier() {
  const byRound = getTierForRound(state.round);
  const byLevel = state.playerLevel >= 5 ? 6 : state.playerLevel;
  return Math.max(byRound, byLevel);
}

function xpThresholdForPlayerLevel(level) {
  if (level === 1) return 2;
  if (level === 2) return 2;
  if (level === 3) return 3;
  if (level === 4) return 3;
  return 999;
}

function gainPlayerXp(value) {
  if (state.playerLevel >= 5 || value <= 0) return;
  state.playerXp += value;
  while (state.playerXp >= xpThresholdForPlayerLevel(state.playerLevel) && state.playerLevel < 5) {
    state.playerXp -= xpThresholdForPlayerLevel(state.playerLevel);
    state.playerLevel += 1;
    pushToast(t("toast_level_up_player", { level: state.playerLevel }));
  }
}

function lifeLossByRound(round) {
  if (round <= 4) return 1;
  if (round <= 8) return 2;
  return 3;
}

function petDef(kind) {
  return petPool.find((entry) => entry.kind === kind);
}

function createPet(kind, attackOverride, healthOverride) {
  const def = petDef(kind);
  if (!def) throw new Error(`Unknown pet kind: ${kind}`);
  return {
    id: state.nextId++,
    kind: def.kind,
    name: def.name,
    color: def.color,
    attack: attackOverride ?? def.attack,
    health: healthOverride ?? def.health,
    level: 1,
    exp: 0,
    ability: def.ability,
    perk: null,
    summonOnFaint: null,
    tempAttack: 0,
    tempHealth: 0,
  };
}

function createFood(kind) {
  const def = foodPool.find((entry) => entry.kind === kind);
  if (!def) throw new Error(`Unknown food kind: ${kind}`);
  return deepClone(def);
}

function shopPoolPets() {
  const tier = maxUnlockedTier();
  return petPool.filter((pet) => pet.tier <= tier);
}

function shopPoolFood() {
  const tier = maxUnlockedTier();
  return foodPool.filter((food) => food.tier <= tier);
}

function pushToast(message) {
  state.toast = message;
  state.toastTime = 2.2;
}

function rerollShop(free = false) {
  if (!free) {
    if (state.gold < REROLL_COST) {
      pushToast(t("toast_not_enough_gold_reroll"));
      return false;
    }
    state.gold -= REROLL_COST;
  }

  const availablePets = shopPoolPets();
  const availableFood = shopPoolFood();
  for (let i = 0; i < SHOP_PET_SLOTS; i += 1) {
    if (state.freezePets[i]) continue;
    const pick = randomChoice(availablePets);
    if (!pick) {
      state.shopPets[i] = null;
      continue;
    }
    const pet = createPet(pick.kind);
    pet.attack += state.shopBuffAttack;
    pet.health += state.shopBuffHealth;
    state.shopPets[i] = pet;
  }
  for (let i = 0; i < SHOP_FOOD_SLOTS; i += 1) {
    if (state.freezeFood[i]) continue;
    const pick = randomChoice(availableFood);
    state.shopFood[i] = pick ? createFood(pick.kind) : null;
  }
  return true;
}

function beginShopTurn() {
  state.gold = TURN_GOLD;
  const startTurnGold = state.team
    .filter((pet) => pet && pet.ability === "start_turn_gain_gold")
    .reduce((sum, pet) => sum + pet.level, 0);
  state.gold += startTurnGold;
  state.selected = null;
  rerollShop(true);
}

function resetGame() {
  state.mode = "shop";
  state.round = 1;
  state.playerLevel = 1;
  state.playerXp = 0;
  state.lives = START_LIVES;
  state.trophies = 0;
  state.gold = TURN_GOLD;
  state.shopBuffAttack = 0;
  state.shopBuffHealth = 0;
  state.team = Array(TEAM_SLOTS).fill(null);
  state.shopPets = Array(SHOP_PET_SLOTS).fill(null);
  state.shopFood = Array(SHOP_FOOD_SLOTS).fill(null);
  state.freezePets = Array(SHOP_PET_SLOTS).fill(false);
  state.freezeFood = Array(SHOP_FOOD_SLOTS).fill(false);
  state.enemyPreview = [];
  state.battle = null;
  state.toast = "";
  state.toastTime = 0;
  state.selected = null;
  state.drag = null;
  state.debugEnemyPreset = null;
  beginShopTurn();
}

function onSellTeamPet(slotIndex) {
  const pet = state.team[slotIndex];
  if (!pet) {
    pushToast(t("toast_no_pet_to_sell"));
    return false;
  }

  state.gold = clamp(state.gold + 1, 0, TURN_GOLD + 20);
  if (pet.ability === "sell_buff_attack") {
    const candidates = state.team
      .map((ally, idx) => ({ ally, idx }))
      .filter((entry) => entry.ally && entry.idx !== slotIndex);
    const buffCount = Math.min(candidates.length, pet.level);
    for (let i = 0; i < buffCount; i += 1) {
      const pickIdx = randInt(0, candidates.length - 1);
      const target = candidates.splice(pickIdx, 1)[0].ally;
      target.attack += 1;
    }
  }

  state.team[slotIndex] = null;
  if (state.selected && state.selected.type === "team" && state.selected.index === slotIndex) {
    state.selected = null;
  }
  pushToast(t("toast_sold_pet_gold"));
  return true;
}

function levelThreshold(level) {
  if (level <= 1) return 2;
  if (level === 2) return 3;
  return 999;
}

function gainPetExp(pet, value) {
  if (!pet || pet.level >= 3 || value <= 0) return;
  pet.exp += value;
  while (pet.level < 3 && pet.exp >= levelThreshold(pet.level)) {
    pet.exp -= levelThreshold(pet.level);
    pet.level += 1;
    applyLevelUpAbility(pet);
  }
}

function applyLevelUpAbility(pet) {
  if (pet.ability === "level_buff_team") {
    const candidates = state.team.filter((ally) => ally && ally.id !== pet.id);
    const buffAmount = pet.level;
    for (const ally of candidates) {
      ally.attack += buffAmount;
      ally.health += buffAmount;
    }
    pushToast(
      t("toast_pet_level_buff", {
        pet: petDisplayName(pet),
        buff: buffAmount,
      })
    );
  }
}

function mergePet(basePet, mergedPet) {
  basePet.attack = Math.max(basePet.attack, mergedPet.attack) + 1;
  basePet.health = Math.max(basePet.health, mergedPet.health) + 1;
  gainPetExp(basePet, 1);
}

function isTargetlessFood(food) {
  if (!food) return false;
  return food.effect === "team_random_buff_1_1" || food.effect === "shop_buff_2_1";
}

function triggerBuyAbility(pet) {
  if (!pet) return;
  if (pet.ability === "buy_buff_random_shop_pet") {
    const options = state.shopPets.filter((entry) => !!entry);
    if (!options.length) return;
    const target = randomChoice(options);
    target.attack += pet.level;
    target.health += pet.level;
    pushToast(t("toast_buffed_shop_pet", { pet: petDisplayName(pet) }));
  }
}

function applyFriendEatBonus(eater) {
  const bonus = state.team
    .filter((ally) => ally && ally.id !== eater.id && ally.ability === "friend_eat_bonus_health")
    .reduce((sum, ally) => sum + ally.level, 0);
  if (bonus > 0) eater.health += bonus;
}

function clearOneBattleFoodBuffs() {
  for (const pet of state.team) {
    if (!pet) continue;
    pet.tempAttack = 0;
    pet.tempHealth = 0;
  }
}

function triggerPriority(phase) {
  return TRIGGER_PRIORITY[phase] ?? 999;
}

function hasHurtBehavior(pet) {
  return !!pet && HURT_ABILITIES.has(pet.ability);
}

function hasFaintBehavior(pet) {
  return !!pet && (FAINT_ABILITIES.has(pet.ability) || !!pet.summonOnFaint);
}

function enqueueBattleTrigger(battle, trigger) {
  if (!battle) return;
  battle.triggerSeq += 1;
  battle.triggerQueue.push({
    id: battle.triggerSeq,
    phase: trigger.phase,
    priority: triggerPriority(trigger.phase),
    side: trigger.side ?? "System",
    actor: trigger.actor ?? "System",
    note: trigger.note ?? "",
    run: trigger.run,
  });
}

function flushBattleTriggerQueue(battle, maxSteps = 300) {
  if (!battle) return;
  let steps = 0;
  while (battle.triggerQueue.length && steps < maxSteps) {
    steps += 1;
    battle.triggerQueue.sort((a, b) => a.priority - b.priority || a.id - b.id);
    const item = battle.triggerQueue.shift();
    item.run();
    const label = `${item.phase}:${item.side}:${item.actor}${item.note ? ` [${item.note}]` : ""}`;
    battle.triggerResolved.unshift(label);
    if (battle.triggerResolved.length > 18) battle.triggerResolved.length = 18;
  }

  if (steps >= maxSteps && battle.triggerQueue.length) {
    battle.triggerQueue.length = 0;
    appendBattleLog(t("log_trigger_guard"));
  }
}

function findPetById(team, id) {
  for (const pet of team) {
    if (pet && pet.id === id) return pet;
  }
  return null;
}

function queueCleanupTrigger(battle, team, sideLabel) {
  enqueueBattleTrigger(battle, {
    phase: "cleanup",
    side: sideLabel,
    actor: "cleanup",
    run: () => {
      for (let i = 0; i < team.length; ) {
        const pet = team[i];
        if (!pet || pet.health > 0) {
          i += 1;
          continue;
        }
        team.splice(i, 1);
        const deathIndex = i;
        if (!hasFaintBehavior(pet)) continue;
        const faintNote = FAINT_ABILITIES.has(pet.ability)
          ? `ability=${pet.ability}`
          : pet.summonOnFaint
            ? `summon=${pet.summonOnFaint.kind}`
            : "";
        enqueueBattleTrigger(battle, {
          phase: "faint",
          side: sideLabel,
          actor: pet.name,
          note: faintNote,
          run: () => handleFaint(pet, deathIndex, team, sideLabel),
        });
      }
      for (let i = team.length - 1; i >= 0; i -= 1) {
        if (team[i] === null) team.splice(i, 1);
      }
      if (team.length > TEAM_SLOTS) team.length = TEAM_SLOTS;
    },
  });
}

function queueCleanupForBothSides(battle) {
  queueCleanupTrigger(battle, battle.friendly, t("side_friendly"));
  queueCleanupTrigger(battle, battle.enemy, t("side_enemy"));
}

function refreshBattleOutcome(battle) {
  if (!battle || battle.result) return true;
  const left = battle.friendly;
  const right = battle.enemy;
  if (!left.length && !right.length) {
    battle.result = "draw";
    appendBattleLog(t("log_both_fainted"));
    return true;
  }
  if (!left.length) {
    battle.result = "lose";
    appendBattleLog(t("log_enemy_wins"));
    return true;
  }
  if (!right.length) {
    battle.result = "win";
    appendBattleLog(t("log_you_win"));
    return true;
  }
  return false;
}

function createPresetPet(entry) {
  const pet = createPet(entry.kind, entry.attack, entry.health);
  pet.level = entry.level ?? 1;
  pet.exp = entry.exp ?? 0;
  pet.perk = entry.perk ?? null;
  pet.tempAttack = 0;
  pet.tempHealth = 0;
  if (entry.summonOnFaint) pet.summonOnFaint = deepClone(entry.summonOnFaint);
  return pet;
}

function instantiatePresetTeam(preset) {
  const team = [];
  for (const entry of preset) {
    team.push(createPresetPet(entry));
  }
  while (team.length < TEAM_SLOTS) team.push(null);
  return team;
}

function resetScenarioBase(round = 3, level = 3) {
  state.mode = "shop";
  state.round = round;
  state.playerLevel = level;
  state.playerXp = 0;
  state.gold = TURN_GOLD;
  state.lives = START_LIVES;
  state.trophies = 0;
  state.shopBuffAttack = 0;
  state.shopBuffHealth = 0;
  state.team = Array(TEAM_SLOTS).fill(null);
  state.shopPets = Array(SHOP_PET_SLOTS).fill(null);
  state.shopFood = Array(SHOP_FOOD_SLOTS).fill(null);
  state.freezePets = Array(SHOP_PET_SLOTS).fill(false);
  state.freezeFood = Array(SHOP_FOOD_SLOTS).fill(false);
  state.selected = null;
  state.drag = null;
  state.battle = null;
  state.debugEnemyPreset = null;
  state.toast = "";
  state.toastTime = 0;
}

function loadDebugScenario(name) {
  if (name === "chocolate") {
    resetScenarioBase(3, 3);
    const fish = createPet("fish");
    fish.level = 1;
    fish.exp = 1;
    const ant = createPet("ant");
    state.team[0] = fish;
    state.team[1] = ant;
    state.shopFood[0] = createFood("chocolate");
    state.shopFood[1] = createFood("apple");
    pushToast(t("toast_scenario_chocolate"));
    return true;
  }

  if (name === "melon") {
    resetScenarioBase(3, 3);
    const fish = createPet("fish");
    fish.perk = "melon";
    state.team[0] = fish;
    state.team[1] = createPet("cricket");
    state.debugEnemyPreset = [{ kind: "beaver", attack: 11, health: 2, level: 1 }];
    pushToast(t("toast_scenario_melon"));
    return true;
  }

  if (name === "dodo") {
    resetScenarioBase(3, 3);
    state.team[0] = createPet("fish");
    state.team[1] = createPet("dodo");
    state.debugEnemyPreset = [{ kind: "beaver", attack: 3, health: 4, level: 1 }];
    pushToast(t("toast_scenario_dodo"));
    return true;
  }

  if (name === "penguin") {
    resetScenarioBase(5, 4);
    const fish = createPet("fish");
    fish.level = 2;
    fish.exp = 0;
    fish.attack = 4;
    fish.health = 5;
    state.team[0] = fish;
    state.team[1] = createPet("penguin");
    state.debugEnemyPreset = [{ kind: "ant", attack: 2, health: 1, level: 1 }];
    pushToast(t("toast_scenario_penguin"));
    return true;
  }

  if (name === "turtle") {
    resetScenarioBase(5, 4);
    state.team[0] = createPet("turtle");
    state.team[1] = createPet("fish");
    state.team[2] = createPet("horse");
    state.debugEnemyPreset = [{ kind: "beaver", attack: 7, health: 2, level: 1 }];
    pushToast(t("toast_scenario_turtle"));
    return true;
  }

  return false;
}

window.__debugLoadScenario = (name) => loadDebugScenario(String(name || "").toLowerCase());

function buyPet(shopIndex, teamIndex) {
  const pet = state.shopPets[shopIndex];
  if (!pet) {
    pushToast(t("toast_empty_shop_slot"));
    return false;
  }
  if (state.gold < PET_COST) {
    pushToast(t("toast_not_enough_gold"));
    return false;
  }
  const target = state.team[teamIndex];
  if (target && target.kind !== pet.kind) {
    pushToast(t("toast_cannot_stack"));
    return false;
  }

  state.gold -= PET_COST;
  state.shopPets[shopIndex] = null;
  state.freezePets[shopIndex] = false;
  if (!target) {
    state.team[teamIndex] = pet;
    triggerBuyAbility(pet);
    pushToast(t("toast_joined_team", { pet: petDisplayName(pet) }));
    return true;
  }

  mergePet(target, pet);
  triggerBuyAbility(pet);
  pushToast(t("toast_merged_stats", { pet: petDisplayName(target) }));
  return true;
}

function applyFood(foodIndex, teamIndex) {
  const food = state.shopFood[foodIndex];
  if (!food) {
    pushToast(t("toast_empty_food_slot"));
    return false;
  }

  const targetless = isTargetlessFood(food);
  const pet = teamIndex >= 0 ? state.team[teamIndex] : null;
  if (!targetless && !pet) {
    pushToast(t("toast_select_pet_first"));
    return false;
  }
  if (state.gold < FOOD_COST) {
    pushToast(t("toast_not_enough_gold"));
    return false;
  }

  state.gold -= FOOD_COST;
  state.shopFood[foodIndex] = null;
  state.freezeFood[foodIndex] = false;

  if (food.effect === "stat_1_1" && pet) {
    pet.attack += 1;
    pet.health += 1;
  } else if (food.effect === "stat_2_2" && pet) {
    pet.attack += 2;
    pet.health += 2;
  } else if (food.effect === "perk_meat" && pet) {
    pet.perk = "meat";
  } else if (food.effect === "perk_garlic" && pet) {
    pet.perk = "garlic";
  } else if (food.effect === "perk_melon" && pet) {
    pet.perk = "melon";
  } else if (food.effect === "summon_bee" && pet) {
    pet.summonOnFaint = { kind: "bee", name: "Bee", attack: 1, health: 1, color: "#f4cf50" };
  } else if (food.effect === "temp_3_3" && pet) {
    pet.tempAttack += 3;
    pet.tempHealth += 3;
  } else if (food.effect === "exp_1" && pet) {
    gainPetExp(pet, 1);
  } else if (food.effect === "shop_buff_2_1") {
    state.shopBuffAttack += 2;
    state.shopBuffHealth += 1;
  } else if (food.effect === "team_random_buff_1_1") {
    const options = state.team.filter((ally) => !!ally);
    const picks = Math.min(2, options.length);
    for (let i = 0; i < picks; i += 1) {
      const idx = randInt(0, options.length - 1);
      const target = options.splice(idx, 1)[0];
      target.attack += 1;
      target.health += 1;
    }
  }

  if (pet) applyFriendEatBonus(pet);
  if (pet) pushToast(t("toast_pet_ate_food", { pet: petDisplayName(pet), food: foodDisplayName(food) }));
  else pushToast(t("toast_used_food", { food: foodDisplayName(food) }));
  return true;
}

function swapTeamSlots(a, b) {
  const temp = state.team[a];
  state.team[a] = state.team[b];
  state.team[b] = temp;
}

function clearSelection() {
  state.selected = null;
}

function toggleFreezeSelection() {
  if (!state.selected) {
    pushToast(t("toast_select_shop_slot"));
    return;
  }
  if (state.selected.type === "shopPet") {
    const idx = state.selected.index;
    if (!state.shopPets[idx]) return;
    state.freezePets[idx] = !state.freezePets[idx];
  } else if (state.selected.type === "shopFood") {
    const idx = state.selected.index;
    if (!state.shopFood[idx]) return;
    state.freezeFood[idx] = !state.freezeFood[idx];
  } else {
    pushToast(t("toast_only_shop_freeze"));
    return;
  }
}

function clickTeamSlot(index) {
  const hasPet = !!state.team[index];
  if (!state.selected) {
    if (hasPet) state.selected = { type: "team", index };
    return;
  }
  if (state.selected.type === "team") {
    if (state.selected.index === index) {
      clearSelection();
      return;
    }
    swapTeamSlots(state.selected.index, index);
    clearSelection();
    return;
  }
  if (state.selected.type === "shopPet") {
    if (buyPet(state.selected.index, index)) clearSelection();
    return;
  }
  if (state.selected.type === "shopFood") {
    if (applyFood(state.selected.index, index)) clearSelection();
  }
}

function clickShopPetSlot(index) {
  if (!state.shopPets[index]) return;
  if (!state.selected) {
    state.selected = { type: "shopPet", index };
    return;
  }
  if (state.selected.type === "shopPet" && state.selected.index === index) {
    state.freezePets[index] = !state.freezePets[index];
    clearSelection();
    return;
  }
  state.selected = { type: "shopPet", index };
}

function clickShopFoodSlot(index) {
  const food = state.shopFood[index];
  if (!food) return;
  if (!state.selected) {
    state.selected = { type: "shopFood", index };
    return;
  }
  if (state.selected.type === "shopFood" && state.selected.index === index) {
    if (isTargetlessFood(food)) {
      if (applyFood(index, -1)) clearSelection();
      return;
    }
    state.freezeFood[index] = !state.freezeFood[index];
    clearSelection();
    return;
  }
  state.selected = { type: "shopFood", index };
}

function debugButtonAtPosition(x, y) {
  for (let i = 0; i < ui.debugButtons.length; i += 1) {
    if (pointInRect(x, y, ui.debugButtons[i])) return i;
  }
  return -1;
}

function handleShopClick(x, y) {
  if (pointInRect(x, y, ui.languageBtn)) {
    toggleLanguage();
    return;
  }

  const debugIndex = debugButtonAtPosition(x, y);
  if (debugIndex !== -1) {
    const preset = debugScenarioButtons[debugIndex];
    if (preset) loadDebugScenario(preset.key);
    clearSelection();
    return;
  }

  if (pointInRect(x, y, ui.rerollBtn)) {
    rerollShop(false);
    clearSelection();
    return;
  }
  if (pointInRect(x, y, ui.freezeBtn)) {
    toggleFreezeSelection();
    return;
  }
  if (pointInRect(x, y, ui.sellBtn)) {
    if (!state.selected || state.selected.type !== "team") {
      pushToast(t("toast_select_team_to_sell"));
      return;
    }
    onSellTeamPet(state.selected.index);
    clearSelection();
    return;
  }
  if (pointInRect(x, y, ui.endTurnBtn)) {
    startBattle();
    return;
  }

  const teamIdx = entityAtPosition(ui.teamSlots, x, y);
  if (teamIdx !== -1) return clickTeamSlot(teamIdx);
  const shopPetIdx = entityAtPosition(ui.shopPetSlots, x, y);
  if (shopPetIdx !== -1) return clickShopPetSlot(shopPetIdx);
  const shopFoodIdx = entityAtPosition(ui.shopFoodSlots, x, y);
  if (shopFoodIdx !== -1) return clickShopFoodSlot(shopFoodIdx);

  clearSelection();
}

function enemyTeamSizeByRound(round) {
  if (round >= 9) return 5;
  if (round >= 5) return 4;
  return 3;
}

function generateEnemyTeam() {
  const count = enemyTeamSizeByRound(state.round);
  const maxTier = getTierForRound(state.round);
  const pool = petPool.filter((pet) => pet.tier <= maxTier);
  const bonus = Math.floor((state.round - 1) / 2);
  const team = [];
  for (let i = 0; i < count; i += 1) {
    const pick = randomChoice(pool);
    const pet = createPet(pick.kind);
    pet.attack += randInt(0, bonus);
    pet.health += randInt(0, bonus + 1);
    if (seededRandom() < 0.2) pet.perk = "garlic";
    team.push(pet);
  }
  while (team.length < TEAM_SLOTS) team.push(null);
  return team;
}

function cloneBattlePet(pet) {
  if (!pet) return null;
  return {
    id: pet.id,
    kind: pet.kind,
    name: pet.name,
    color: pet.color,
    attack: pet.attack + (pet.tempAttack ?? 0),
    health: pet.health + (pet.tempHealth ?? 0),
    level: pet.level,
    ability: pet.ability,
    perk: pet.perk,
    summonOnFaint: pet.summonOnFaint ? deepClone(pet.summonOnFaint) : null,
  };
}

function activeBattleLine(team) {
  return team.filter((pet) => !!pet).map((pet) => cloneBattlePet(pet));
}

function appendBattleLog(text) {
  if (!state.battle) return;
  state.battle.log.unshift(text);
  if (state.battle.log.length > 9) state.battle.log.length = 9;
}

function queueStartBattleTriggers(team, opponent, sideLabel, battle) {
  for (let i = team.length - 1; i >= 0; i -= 1) {
    const pet = team[i];
    if (!pet || pet.ability !== "start_battle_buff_friend_ahead_attack") continue;
    if (i <= 0) continue;
    const actorId = pet.id;
    enqueueBattleTrigger(battle, {
      phase: "start",
      side: sideLabel,
      actor: pet.name,
      note: "dodo",
      run: () => {
        const actorIndex = team.findIndex((entry) => entry && entry.id === actorId);
        if (actorIndex <= 0) return;
        const actor = team[actorIndex];
        const target = team[actorIndex - 1];
        if (!actor || !target) return;
        const bonus = Math.max(1, Math.floor(actor.attack * (0.5 * actor.level)));
        target.attack += bonus;
        appendBattleLog(
          t("log_dodo_buff", {
            side: sideLabel,
            target: petDisplayName(target),
            bonus,
          })
        );
      },
    });
  }

  for (const pet of team) {
    if (!pet || pet.ability !== "start_ping_enemy") continue;
    for (let i = 0; i < pet.level; i += 1) {
      const actorId = pet.id;
      enqueueBattleTrigger(battle, {
        phase: "start",
        side: sideLabel,
        actor: pet.name,
        note: "mosquito",
        run: () => {
          const actor = findPetById(team, actorId);
          if (!actor) return;
          if (!opponent.length) return;
          const target = opponent[randInt(0, opponent.length - 1)];
          if (!target) return;
          target.health -= 1;
          appendBattleLog(
            t("log_ping", {
              side: sideLabel,
              actor: petDisplayName(actor),
              target: petDisplayName(target),
            })
          );
        },
      });
    }
  }
}

function computeDamage(attacker, defender) {
  let damage = attacker.attack;
  if (attacker.perk === "meat") damage += 3;
  if (defender.perk === "melon") {
    appendBattleLog(t("log_melon_block", { defender: petDisplayName(defender) }));
    damage = Math.max(0, damage - 20);
    defender.perk = null;
  }
  if (defender.perk === "garlic") damage = Math.max(1, damage - 2);
  return damage;
}

function summonFromTemplate(template) {
  return {
    id: state.nextId++,
    kind: template.kind,
    name: template.name,
    color: template.color,
    attack: template.attack,
    health: template.health,
    level: 1,
    ability: null,
    perk: null,
    summonOnFaint: null,
    tempAttack: 0,
    tempHealth: 0,
  };
}

function applySummonedPetBuffs(team, summonedPet, sideLabel) {
  if (!summonedPet) return;
  const bonus = team
    .filter((ally) => ally && ally.id !== summonedPet.id && ally.ability === "friend_summoned_attack")
    .reduce((sum, ally) => sum + ally.level, 0);
  if (bonus <= 0) return;
  summonedPet.attack += bonus;
  appendBattleLog(t("log_horse_buff", { side: sideLabel, bonus }));
}

function handleFaint(pet, index, team, sideLabel) {
  if (pet.ability === "faint_buff_random_ally") {
    const targets = team
      .map((ally, idx) => ({ ally, idx }))
      .filter((entry) => entry.ally && entry.idx !== index && entry.ally.health > 0);
    if (targets.length) {
      const pick = randomChoice(targets).ally;
      pick.attack += 2 * pet.level;
      pick.health += 1 * pet.level;
      appendBattleLog(t("log_ant_buff", { side: sideLabel, target: petDisplayName(pick) }));
    }
  }

  if (pet.ability === "faint_buff_rear") {
    const rear = [];
    for (let i = index; i < team.length; i += 1) {
      if (team[i]) rear.push(team[i]);
      if (rear.length >= 2) break;
    }
    for (const target of rear) {
      target.attack += pet.level;
      target.health += pet.level;
    }
    if (rear.length) appendBattleLog(t("log_flamingo_buff", { side: sideLabel }));
  }

  if (pet.ability === "faint_give_melon_friend_behind") {
    const behind = team[index];
    if (behind) {
      behind.perk = "melon";
      appendBattleLog(t("log_turtle_melon", { side: sideLabel, target: petDisplayName(behind) }));
    }
  }

  if (pet.ability === "faint_summon_zombie") {
    const summon = summonFromTemplate({
      kind: "zombie_cricket",
      name: "Zombie",
      color: "#b7d55f",
      attack: pet.level,
      health: pet.level,
    });
    if (team.length < TEAM_SLOTS) {
      team.splice(index, 0, summon);
      applySummonedPetBuffs(team, summon, sideLabel);
      appendBattleLog(t("log_cricket_summon", { side: sideLabel }));
    }
  } else if (pet.summonOnFaint && team.length < TEAM_SLOTS) {
    const summon = summonFromTemplate(pet.summonOnFaint);
    team.splice(index, 0, summon);
    applySummonedPetBuffs(team, summon, sideLabel);
    appendBattleLog(
      t("log_pet_summon", {
        side: sideLabel,
        pet: petDisplayName(pet),
        summon: summonDisplayNameFromTemplate(pet.summonOnFaint),
      })
    );
  }
}

function handleHurtAbility(pet, index, team, sideLabel) {
  if (!pet || pet.health <= 0) return;
  if (pet.ability === "hurt_buff_rear") {
    const rear = team[index + 1];
    if (rear) {
      rear.attack += pet.level;
      rear.health += pet.level;
      appendBattleLog(t("log_camel_buff", { side: sideLabel }));
    }
  } else if (pet.ability === "hurt_gain_attack") {
    pet.attack += 2 * pet.level;
    appendBattleLog(t("log_peacock_hurt", { side: sideLabel }));
  }
}

function resolveBattleStep() {
  const battle = state.battle;
  if (!battle || battle.result) return;
  if (refreshBattleOutcome(battle)) return;

  const left = battle.friendly;
  const right = battle.enemy;

  for (let i = 1; i < left.length; i += 1) {
    const pet = left[i];
    if (!pet || pet.ability !== "behind_attack_gain") continue;
    const actorId = pet.id;
    enqueueBattleTrigger(battle, {
      phase: "pre_attack",
      side: t("side_friendly"),
      actor: pet.name,
      note: "kangaroo",
      run: () => {
        const actor = findPetById(left, actorId);
        if (!actor) return;
        actor.attack += 2 * actor.level;
        actor.health += actor.level;
      },
    });
  }

  for (let i = 1; i < right.length; i += 1) {
    const pet = right[i];
    if (!pet || pet.ability !== "behind_attack_gain") continue;
    const actorId = pet.id;
    enqueueBattleTrigger(battle, {
      phase: "pre_attack",
      side: t("side_enemy"),
      actor: pet.name,
      note: "kangaroo",
      run: () => {
        const actor = findPetById(right, actorId);
        if (!actor) return;
        actor.attack += 2 * actor.level;
        actor.health += actor.level;
      },
    });
  }

  enqueueBattleTrigger(battle, {
    phase: "attack",
    side: "System",
    actor: "frontline",
    run: () => {
      if (!left.length || !right.length) return;
      const leftFront = left[0];
      const rightFront = right[0];
      const leftDamage = computeDamage(leftFront, rightFront);
      const rightDamage = computeDamage(rightFront, leftFront);
      rightFront.health -= leftDamage;
      leftFront.health -= rightDamage;
      appendBattleLog(
        t("log_trade", {
          attacker: petDisplayName(leftFront),
          defender: petDisplayName(rightFront),
        })
      );

      if (leftFront.health > 0 && hasHurtBehavior(leftFront)) {
        const actorId = leftFront.id;
        enqueueBattleTrigger(battle, {
          phase: "hurt",
          side: t("side_friendly"),
          actor: leftFront.name,
          note: `ability=${leftFront.ability}`,
          run: () => {
            const actor = findPetById(left, actorId);
            if (!actor) return;
            const idx = left.findIndex((entry) => entry && entry.id === actorId);
            if (idx === -1) return;
            handleHurtAbility(actor, idx, left, t("side_friendly"));
          },
        });
      }

      if (rightFront.health > 0 && hasHurtBehavior(rightFront)) {
        const actorId = rightFront.id;
        enqueueBattleTrigger(battle, {
          phase: "hurt",
          side: t("side_enemy"),
          actor: rightFront.name,
          note: `ability=${rightFront.ability}`,
          run: () => {
            const actor = findPetById(right, actorId);
            if (!actor) return;
            const idx = right.findIndex((entry) => entry && entry.id === actorId);
            if (idx === -1) return;
            handleHurtAbility(actor, idx, right, t("side_enemy"));
          },
        });
      }

      queueCleanupForBothSides(battle);
    },
  });

  flushBattleTriggerQueue(battle);
  refreshBattleOutcome(battle);
}

function finishBattle() {
  const battle = state.battle;
  if (!battle || !battle.result) return;

  if (battle.result === "win") {
    state.trophies += 1;
    pushToast(t("toast_victory_trophy"));
  } else if (battle.result === "lose") {
    const loss = lifeLossByRound(state.round);
    state.lives -= loss;
    pushToast(t("toast_defeat_life", { loss }));
  } else {
    pushToast(t("toast_draw"));
  }

  clearOneBattleFoodBuffs();

  if (state.trophies >= MAX_TROPHIES || state.lives <= 0) {
    state.mode = "gameover";
    state.battle = null;
    return;
  }

  state.round += 1;
  gainPlayerXp(1);
  state.mode = "shop";
  state.battle = null;
  beginShopTurn();
}

function runEndTurnTeamAbilities() {
  for (let i = TEAM_SLOTS - 1; i >= 0; i -= 1) {
    const pet = state.team[i];
    if (!pet) continue;
    if (pet.ability === "end_turn_buff_friend_ahead" && i > 0) {
      let ahead = null;
      for (let j = i - 1; j >= 0; j -= 1) {
        if (!state.team[j]) continue;
        ahead = state.team[j];
        break;
      }
      if (!ahead) continue;
      ahead.attack += pet.level;
      ahead.health += pet.level;
    }

    if (pet.ability === "end_turn_buff_level2_friends") {
      const candidates = state.team.filter((ally) => ally && ally.id !== pet.id && ally.level >= 2);
      const count = Math.min(2, candidates.length);
      for (let n = 0; n < count; n += 1) {
        const idx = randInt(0, candidates.length - 1);
        const target = candidates.splice(idx, 1)[0];
        target.attack += pet.level;
        target.health += pet.level;
      }
    }
  }
}

function startBattle() {
  runEndTurnTeamAbilities();
  const friendlyLine = activeBattleLine(state.team);
  if (!friendlyLine.length) {
    pushToast(t("toast_place_pet"));
    return;
  }

  const enemyTemplate = state.debugEnemyPreset ? instantiatePresetTeam(state.debugEnemyPreset) : generateEnemyTeam();
  state.debugEnemyPreset = null;
  state.enemyPreview = enemyTemplate;
  const enemyLine = activeBattleLine(enemyTemplate);

  state.battle = {
    friendly: friendlyLine,
    enemy: enemyLine,
    log: [],
    timer: 0,
    result: null,
    resultTime: 0,
    roundSnapshot: state.round,
    triggerSeq: 0,
    triggerQueue: [],
    triggerResolved: [],
  };
  state.selected = null;
  state.toast = "";
  state.toastTime = 0;
  state.mode = "battle";
  appendBattleLog(t("log_battle_started"));
  queueStartBattleTriggers(state.battle.friendly, state.battle.enemy, t("side_friendly"), state.battle);
  queueStartBattleTriggers(state.battle.enemy, state.battle.friendly, t("side_enemy"), state.battle);
  queueCleanupForBothSides(state.battle);
  flushBattleTriggerQueue(state.battle);
  refreshBattleOutcome(state.battle);
}

function update(dt) {
  if (state.toastTime > 0) state.toastTime = Math.max(0, state.toastTime - dt);

  if (state.mode === "battle" && state.battle) {
    const battle = state.battle;
    if (!battle.result) {
      battle.timer += dt;
      while (battle.timer >= BATTLE_STEP_SECONDS && !battle.result) {
        battle.timer -= BATTLE_STEP_SECONDS;
        resolveBattleStep();
      }
    } else {
      battle.resultTime += dt;
      if (battle.resultTime >= BATTLE_RESULT_HOLD_SECONDS) finishBattle();
    }
  }
}

function roundRect(target, x, y, w, h, r, fillStyle) {
  target.beginPath();
  target.moveTo(x + r, y);
  target.arcTo(x + w, y, x + w, y + h, r);
  target.arcTo(x + w, y + h, x, y + h, r);
  target.arcTo(x, y + h, x, y, r);
  target.arcTo(x, y, x + w, y, r);
  target.closePath();
  target.fillStyle = fillStyle;
  target.fill();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#f8fcff");
  gradient.addColorStop(1, "#d6ecff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgba(123, 171, 215, 0.16)";
  ctx.beginPath();
  ctx.ellipse(180, 80, 210, 90, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(1040, 620, 230, 110, -0.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawButton(box, text, fill, bold = false) {
  roundRect(ctx, box.x, box.y, box.w, box.h, 12, fill);
  ctx.strokeStyle = "rgba(31, 58, 95, 0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#233a59";
  ctx.font = `${bold ? "700" : "600"} 22px 'Trebuchet MS', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, box.x + box.w / 2, box.y + box.h / 2 + 1);
}

function drawPill(x, y, w, h, text, fill, textColor = "#1f304b") {
  roundRect(ctx, x, y, w, h, 14, fill);
  ctx.fillStyle = textColor;
  ctx.font = "600 24px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
}

function drawTopBar() {
  roundRect(ctx, 30, 24, 1220, 88, 20, "rgba(255,255,255,0.86)");
  ctx.strokeStyle = "rgba(35, 65, 106, 0.28)";
  ctx.lineWidth = 2;
  ctx.stroke();
  drawPill(54, 42, 176, 50, t("top_round", { round: state.round }), "#b9ddff");
  drawPill(248, 42, 144, 50, t("top_gold", { gold: state.gold }), "#ffe48a");
  drawPill(408, 42, 170, 50, t("top_lives", { lives: state.lives }), "#ffb8ad");
  drawPill(594, 42, 190, 50, t("top_trophy", { trophies: state.trophies }), "#c9f0b4");
  const xpNeeded = xpThresholdForPlayerLevel(state.playerLevel);
  const xpText = state.playerLevel >= 5 ? t("top_max") : `${state.playerXp}/${xpNeeded}`;
  drawPill(802, 42, 210, 50, t("top_level_xp", { level: state.playerLevel, xp: xpText }), "#d5cef9");

  ctx.fillStyle = "#294569";
  ctx.font = "700 18px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(t("top_tier_shop", { tier: maxUnlockedTier() }), 1070, 70);
  drawButton(ui.languageBtn, t("language_switch_target"), "#d7e9ff");
}

function drawSlot(slot, fill) {
  roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 16, fill);
  ctx.strokeStyle = "rgba(32, 62, 102, 0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawStatToken(x, y, text, fill, width = 68) {
  roundRect(ctx, x, y, width, 24, 8, fill);
  ctx.fillStyle = "#2f425f";
  ctx.font = "700 13px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + width / 2, y + 12);
}

function drawPetCard(slot, pet, options) {
  const { price, frozen } = options;
  const x = slot.x + 9;
  const y = slot.y + 24;
  const w = slot.w - 18;
  const h = slot.h - 32;

  roundRect(ctx, x, y, w, h, 14, "rgba(255,255,255,0.95)");
  ctx.strokeStyle = frozen ? "rgba(56, 119, 182, 0.45)" : "rgba(27, 57, 97, 0.24)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = pet.color;
  ctx.beginPath();
  ctx.ellipse(x + 46, y + 40, 30, 24, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#263f60";
  ctx.font = "700 20px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(petDisplayName(pet), x + 86, y + 28);

  ctx.font = "600 15px 'Trebuchet MS', sans-serif";
  ctx.fillStyle = "#4a678f";
  ctx.fillText(t("pet_lv_exp", { level: pet.level, exp: pet.exp }), x + 86, y + 50);

  drawStatToken(x + 20, y + 66, t("token_attack", { value: pet.attack }), "#ffd38b");
  drawStatToken(x + 96, y + 66, t("token_health", { value: pet.health }), "#ffb8af");
  if (pet.perk) drawStatToken(x + 172, y + 66, perkDisplayName(pet.perk), "#b6e2ba", 82);
  if (price != null) drawStatToken(x + w - 62, y + 8, `${price}G`, "#ffe88f", 54);
}

function drawFoodCard(slot, food, options) {
  const { price } = options;
  const x = slot.x + 9;
  const y = slot.y + 24;
  const w = slot.w - 18;
  const h = slot.h - 32;

  roundRect(ctx, x, y, w, h, 14, "rgba(255,255,255,0.96)");
  ctx.strokeStyle = "rgba(71, 81, 30, 0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = food.color;
  ctx.beginPath();
  ctx.arc(x + 44, y + 38, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#324c6f";
  ctx.font = "700 20px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(foodDisplayName(food), x + 78, y + 28);

  ctx.font = "600 14px 'Trebuchet MS', sans-serif";
  ctx.fillStyle = "#4e6687";
  ctx.fillText(foodEffectDisplayName(food.effect), x + 78, y + 50);
  drawStatToken(x + w - 62, y + 8, `${price}G`, "#ffe88f", 54);
}

function isSlotSelected(type, index) {
  return !!state.selected && state.selected.type === type && state.selected.index === index;
}

function drawShopPanel() {
  drawTopBar();
  ctx.fillStyle = "#365379";
  ctx.font = "600 22px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(t("ui_team_front"), 70, 118);
  ctx.fillText(t("ui_shop_pets"), 70, 296);
  ctx.fillText(t("ui_shop_food"), 70, 456);

  for (let i = 0; i < ui.teamSlots.length; i += 1) {
    const slot = ui.teamSlots[i];
    const pet = state.team[i];
    drawSlot(slot, isSlotSelected("team", i) ? "#97ccff" : "#e6f2ff");
    if (pet) drawPetCard(slot, pet, { price: null, frozen: false });
  }
  for (let i = 0; i < ui.shopPetSlots.length; i += 1) {
    const slot = ui.shopPetSlots[i];
    const pet = state.shopPets[i];
    const frozen = state.freezePets[i];
    drawSlot(slot, isSlotSelected("shopPet", i) ? "#a9ddff" : frozen ? "#d6edff" : "#eff7ff");
    if (pet) drawPetCard(slot, pet, { price: PET_COST, frozen });
  }
  for (let i = 0; i < ui.shopFoodSlots.length; i += 1) {
    const slot = ui.shopFoodSlots[i];
    const food = state.shopFood[i];
    const frozen = state.freezeFood[i];
    drawSlot(slot, isSlotSelected("shopFood", i) ? "#ffe6aa" : frozen ? "#fff2c8" : "#fff7e6");
    if (food) drawFoodCard(slot, food, { frozen, price: FOOD_COST });
  }

  drawButton(ui.rerollBtn, t("ui_reroll"), "#b9ddff");
  drawButton(ui.freezeBtn, t("ui_freeze"), "#f8d17e");
  drawButton(ui.sellBtn, t("ui_sell"), "#ffc2b8");
  drawButton(ui.endTurnBtn, t("ui_end_turn"), "#8fd691", true);

  ctx.fillStyle = "#355177";
  ctx.font = "700 14px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(t("ui_test_presets"), 820, 614);
  for (let i = 0; i < ui.debugButtons.length; i += 1) {
    const box = ui.debugButtons[i];
    const preset = debugScenarioButtons[i];
    roundRect(ctx, box.x, box.y, box.w, box.h, 10, "rgba(255,255,255,0.9)");
    ctx.strokeStyle = "rgba(45, 82, 132, 0.32)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#2f4c74";
    ctx.font = "700 15px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t(`preset_${preset.key}`), box.x + box.w / 2, box.y + box.h / 2 + 1);
  }

  ctx.fillStyle = "rgba(37, 59, 90, 0.9)";
  ctx.font = "600 17px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(t("ui_controls"), 70, 678);
}

function drawMenu() {
  drawBackground();
  ctx.fillStyle = "#2f4d73";
  ctx.font = "700 68px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(t("menu_title"), WIDTH / 2, 210);

  ctx.fillStyle = "#44638c";
  ctx.font = "600 28px 'Trebuchet MS', sans-serif";
  ctx.fillText(t("menu_subtitle"), WIDTH / 2, 258);

  roundRect(ctx, 330, 305, 620, 188, 22, "rgba(255,255,255,0.85)");
  ctx.strokeStyle = "rgba(33, 62, 100, 0.28)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#315078";
  ctx.font = "600 24px 'Trebuchet MS', sans-serif";
  ctx.fillText(t("menu_line1"), WIDTH / 2, 356);
  ctx.fillText(t("menu_line2"), WIDTH / 2, 396);
  drawButton(ui.startButton, t("menu_start"), "#91d38e", true);
  drawButton(ui.languageBtn, t("language_switch_target"), "#d7e9ff");
}

function drawBattleLine(line, x, y, faceRight) {
  const cardW = 102;
  const gap = 12;
  for (let i = 0; i < TEAM_SLOTS; i += 1) {
    const px = x + i * (cardW + gap);
    roundRect(ctx, px, y, cardW, 252, 12, "rgba(236, 245, 255, 0.75)");
    ctx.strokeStyle = "rgba(39, 67, 108, 0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();
    const pet = line[i];
    if (!pet) continue;
    ctx.fillStyle = pet.color;
    ctx.beginPath();
    ctx.ellipse(px + 51, y + 86, 34, 28, faceRight ? -0.15 : 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2d4b72";
    ctx.font = "700 16px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(petDisplayName(pet), px + 51, y + 136);
    drawStatToken(px + 12, y + 162, t("token_attack", { value: pet.attack }), "#ffd38b", 78);
    drawStatToken(px + 12, y + 192, t("token_health", { value: pet.health }), "#ffb8af", 78);
    if (pet.perk) drawStatToken(px + 12, y + 222, perkDisplayName(pet.perk), "#bde4bf", 78);
  }
}

function drawBattle() {
  drawBackground();
  drawTopBar();
  const battle = state.battle;
  if (!battle) return;

  ctx.fillStyle = "#2e4a70";
  ctx.font = "700 26px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(t("battle_phase"), WIDTH / 2, 156);

  roundRect(ctx, 46, 180, 566, 340, 18, "rgba(255,255,255,0.85)");
  ctx.strokeStyle = "rgba(32, 62, 102, 0.2)";
  ctx.lineWidth = 2;
  ctx.stroke();
  roundRect(ctx, 668, 180, 566, 340, 18, "rgba(255,255,255,0.85)");
  ctx.stroke();

  ctx.fillStyle = "#36557f";
  ctx.font = "700 22px 'Trebuchet MS', sans-serif";
  ctx.fillText(t("battle_your_team"), 329, 215);
  ctx.fillText(t("battle_enemy_team"), 951, 215);
  drawBattleLine(battle.friendly, 86, 246, true);
  drawBattleLine(battle.enemy, 708, 246, false);

  roundRect(ctx, 320, 536, 640, 150, 16, "rgba(255,255,255,0.9)");
  ctx.strokeStyle = "rgba(32, 62, 102, 0.2)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#334f76";
  ctx.font = "700 20px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(t("battle_log"), 344, 564);
  ctx.font = "600 16px 'Trebuchet MS', sans-serif";
  for (let i = 0; i < battle.log.length; i += 1) {
    ctx.fillText(`- ${battle.log[i]}`, 344, 592 + i * 20);
  }

  if (battle.result) {
    const text =
      battle.result === "win"
        ? t("battle_result_win")
        : battle.result === "lose"
          ? t("battle_result_lose")
          : t("battle_result_draw");
    roundRect(ctx, 520, 90, 240, 64, 14, "rgba(255,255,255,0.95)");
    ctx.strokeStyle = "rgba(32,62,102,0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = battle.result === "win" ? "#2f9256" : battle.result === "lose" ? "#b94949" : "#5f6e86";
    ctx.font = "700 34px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, 640, 133);
  }
}

function drawGameOver() {
  drawBackground();
  const win = state.trophies >= MAX_TROPHIES;
  ctx.fillStyle = win ? "#2f8c56" : "#ad4f4f";
  ctx.font = "700 72px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(win ? t("over_win") : t("over_lose"), WIDTH / 2, 228);

  roundRect(ctx, 360, 276, 560, 210, 22, "rgba(255,255,255,0.9)");
  ctx.strokeStyle = "rgba(32,62,102,0.2)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#325178";
  ctx.font = "600 30px 'Trebuchet MS', sans-serif";
  ctx.fillText(t("over_round", { round: state.round }), WIDTH / 2, 336);
  ctx.fillText(t("over_trophies", { trophies: state.trophies, max: MAX_TROPHIES }), WIDTH / 2, 376);
  ctx.fillText(t("over_lives", { lives: state.lives }), WIDTH / 2, 416);
  drawButton(ui.restartBtn, t("over_restart"), "#92d692", true);
  drawButton(ui.languageBtn, t("language_switch_target"), "#d7e9ff");
}

function drawToast() {
  if (!state.toast || state.toastTime <= 0) return;
  const alpha = clamp(state.toastTime / 2.2, 0, 1);
  roundRect(ctx, 400, 16, 480, 38, 11, `rgba(35, 59, 92, ${0.84 * alpha})`);
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.font = "600 18px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(state.toast, 640, 35);
}

function drawDragOverlay() {
  if (state.mode !== "shop" || !state.drag || !state.drag.source || !state.drag.moved) return;
  const { currentX, currentY, source } = state.drag;
  const label = sourceLabel(source);
  roundRect(ctx, currentX - 74, currentY - 54, 148, 34, 10, "rgba(41, 69, 105, 0.82)");
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "600 15px 'Trebuchet MS', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, currentX, currentY - 37);

  ctx.beginPath();
  ctx.fillStyle = "rgba(56, 138, 230, 0.24)";
  ctx.arc(currentX, currentY, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.strokeStyle = "rgba(36, 95, 160, 0.7)";
  ctx.lineWidth = 2;
  ctx.arc(currentX, currentY, 26, 0, Math.PI * 2);
  ctx.stroke();
}

function render() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  if (state.mode === "menu") drawMenu();
  else if (state.mode === "shop") {
    drawBackground();
    drawShopPanel();
  } else if (state.mode === "battle") drawBattle();
  else if (state.mode === "gameover") drawGameOver();
  drawToast();
  drawDragOverlay();
}

function toWorldCoords(event) {
  const box = canvas.getBoundingClientRect();
  const sx = (event.clientX - box.left) / box.width;
  const sy = (event.clientY - box.top) / box.height;
  return { x: sx * WIDTH, y: sy * HEIGHT };
}

function handlePrimaryClick(x, y) {
  if (pointInRect(x, y, ui.languageBtn)) {
    toggleLanguage();
    return;
  }

  if (state.mode === "menu") {
    if (pointInRect(x, y, ui.startButton)) resetGame();
    return;
  }
  if (state.mode === "shop") {
    handleShopClick(x, y);
    return;
  }
  if (state.mode === "gameover") {
    if (pointInRect(x, y, ui.restartBtn)) resetGame();
  }
}

function dragSourceAtPosition(x, y) {
  const teamIdx = entityAtPosition(ui.teamSlots, x, y);
  if (teamIdx !== -1 && state.team[teamIdx]) return { type: "team", index: teamIdx };

  const shopPetIdx = entityAtPosition(ui.shopPetSlots, x, y);
  if (shopPetIdx !== -1 && state.shopPets[shopPetIdx]) return { type: "shopPet", index: shopPetIdx };

  const shopFoodIdx = entityAtPosition(ui.shopFoodSlots, x, y);
  if (shopFoodIdx !== -1 && state.shopFood[shopFoodIdx]) return { type: "shopFood", index: shopFoodIdx };

  return null;
}

function sourceLabel(source) {
  if (!source) return t("drag_default");
  if (source.type === "team") {
    const pet = state.team[source.index];
    return pet ? petDisplayName(pet) : t("drag_team");
  }
  if (source.type === "shopPet") {
    const pet = state.shopPets[source.index];
    return pet ? petDisplayName(pet) : t("drag_pet");
  }
  if (source.type === "shopFood") {
    const food = state.shopFood[source.index];
    return food ? foodDisplayName(food) : t("drag_food");
  }
  return t("drag_default");
}

function handleDragDrop(source, x, y) {
  if (!source || state.mode !== "shop") return false;

  if (source.type === "team") {
    const teamTarget = entityAtPosition(ui.teamSlots, x, y);
    if (teamTarget !== -1) {
      if (teamTarget !== source.index) swapTeamSlots(source.index, teamTarget);
      return true;
    }
    if (pointInRect(x, y, ui.sellBtn)) {
      onSellTeamPet(source.index);
      return true;
    }
    return false;
  }

  if (source.type === "shopPet") {
    const teamTarget = entityAtPosition(ui.teamSlots, x, y);
    if (teamTarget !== -1) {
      return buyPet(source.index, teamTarget);
    }
    const selfTarget = entityAtPosition(ui.shopPetSlots, x, y);
    if (selfTarget === source.index && state.shopPets[source.index]) {
      state.freezePets[source.index] = !state.freezePets[source.index];
      return true;
    }
    return false;
  }

  if (source.type === "shopFood") {
    const teamTarget = entityAtPosition(ui.teamSlots, x, y);
    if (teamTarget !== -1) {
      return applyFood(source.index, teamTarget);
    }
    const selfTarget = entityAtPosition(ui.shopFoodSlots, x, y);
    if (selfTarget === source.index && state.shopFood[source.index]) {
      const food = state.shopFood[source.index];
      if (isTargetlessFood(food)) return applyFood(source.index, -1);
      state.freezeFood[source.index] = !state.freezeFood[source.index];
      return true;
    }
    return false;
  }

  return false;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  if (key === "l") {
    toggleLanguage();
    return;
  }
  if (key === "f") return toggleFullscreen();
  if (event.key === "Escape" && document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {});
    return;
  }

  if (state.mode !== "shop") return;
  if (key === "a") {
    loadDebugScenario("chocolate");
    return;
  }
  if (key === "b") {
    loadDebugScenario("melon");
    return;
  }
  if (event.key === "ArrowLeft") {
    loadDebugScenario("dodo");
    return;
  }
  if (event.key === "ArrowRight") {
    loadDebugScenario("penguin");
    return;
  }
  if (event.key === "ArrowUp") {
    loadDebugScenario("turtle");
    return;
  }

  if (key === "r") rerollShop(false);
  if (key === "x") toggleFreezeSelection();
  if (key === "e") startBattle();
  if (key === "s" && state.selected?.type === "team") {
    onSellTeamPet(state.selected.index);
    clearSelection();
  }
}

function onPointerDown(event) {
  const { x, y } = toWorldCoords(event);
  if (state.mode !== "shop") {
    handlePrimaryClick(x, y);
    return;
  }

  const source = dragSourceAtPosition(x, y);
  state.drag = {
    pointerId: event.pointerId,
    source,
    startX: x,
    startY: y,
    currentX: x,
    currentY: y,
    moved: false,
  };
  if (source) {
    canvas.setPointerCapture?.(event.pointerId);
  }
}

function onPointerMove(event) {
  if (!state.drag || state.mode !== "shop") return;
  const { x, y } = toWorldCoords(event);
  state.drag.currentX = x;
  state.drag.currentY = y;
  const dx = x - state.drag.startX;
  const dy = y - state.drag.startY;
  if (dx * dx + dy * dy > 36) state.drag.moved = true;
}

function onPointerUp(event) {
  if (!state.drag || state.mode !== "shop") return;
  const drag = state.drag;
  const { x, y } = toWorldCoords(event);
  drag.currentX = x;
  drag.currentY = y;

  let handled = false;
  if (drag.source && drag.moved) {
    handled = handleDragDrop(drag.source, x, y);
    clearSelection();
  }
  if (!handled && !drag.moved) {
    handlePrimaryClick(x, y);
  }

  state.drag = null;
}

function onPointerCancel() {
  state.drag = null;
}

function onContextMenu(event) {
  event.preventDefault();
  if (state.mode !== "shop") return;
  const { x, y } = toWorldCoords(event);
  const petIdx = entityAtPosition(ui.shopPetSlots, x, y);
  if (petIdx !== -1 && state.shopPets[petIdx]) {
    state.freezePets[petIdx] = !state.freezePets[petIdx];
    return;
  }
  const foodIdx = entityAtPosition(ui.shopFoodSlots, x, y);
  if (foodIdx !== -1 && state.shopFood[foodIdx]) {
    state.freezeFood[foodIdx] = !state.freezeFood[foodIdx];
  }
}

function loop(ts) {
  const dt = Math.min(0.1, (ts - lastFrameMs) / 1000);
  lastFrameMs = ts;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

function resizeCanvasDisplay() {
  const margin = 24;
  const availableW = Math.max(320, window.innerWidth - margin);
  const availableH = Math.max(240, window.innerHeight - margin);
  const scale = Math.min(availableW / WIDTH, availableH / HEIGHT);
  canvas.style.width = `${Math.floor(WIDTH * scale)}px`;
  canvas.style.height = `${Math.floor(HEIGHT * scale)}px`;
}

function compactPet(pet) {
  if (!pet) return null;
  return {
    kind: pet.kind,
    name: pet.name,
    displayName: petDisplayName(pet),
    attack: pet.attack,
    health: pet.health,
    level: pet.level,
    exp: pet.exp,
    perk: pet.perk ?? null,
    temp: pet.tempAttack || pet.tempHealth ? { attack: pet.tempAttack, health: pet.tempHealth } : null,
  };
}

function renderGameToText() {
  const payload = {
    coordinateSystem: "origin=(0,0) top-left; +x right; +y down; canvas=1280x720",
    language: state.language,
    mode: state.mode,
    round: state.round,
    playerLevel: state.playerLevel,
    playerXp: state.playerXp,
    gold: state.gold,
    lives: state.lives,
    trophies: state.trophies,
    shopTier: maxUnlockedTier(),
    shopBuff: { attack: state.shopBuffAttack, health: state.shopBuffHealth },
    selected: state.selected ? { ...state.selected } : null,
    drag:
      state.drag && state.drag.source
        ? {
            source: { ...state.drag.source },
            moved: state.drag.moved,
            x: Math.round(state.drag.currentX),
            y: Math.round(state.drag.currentY),
          }
        : null,
    team: state.team.map((pet, idx) => ({ slot: idx, pet: compactPet(pet) })),
    shop: {
      pets: state.shopPets.map((pet, idx) => ({
        slot: idx,
        frozen: state.freezePets[idx],
        pet: compactPet(pet),
      })),
      food: state.shopFood.map((food, idx) => ({
        slot: idx,
        frozen: state.freezeFood[idx],
        food: food ? { kind: food.kind, name: food.name, displayName: foodDisplayName(food), effect: food.effect } : null,
      })),
    },
    battle: state.battle
      ? {
          friendly: state.battle.friendly.map((pet) => compactPet(pet)),
          enemy: state.battle.enemy.map((pet) => compactPet(pet)),
          result: state.battle.result,
          resultTime: Number(state.battle.resultTime.toFixed(2)),
          resultHold: BATTLE_RESULT_HOLD_SECONDS,
          logTop: state.battle.log.slice(0, 4),
          triggerQueue: (state.battle.triggerQueue || []).slice(0, 8).map((entry) => ({
            phase: entry.phase,
            side: entry.side,
            actor: entry.actor,
            note: entry.note,
            priority: entry.priority,
          })),
          triggerResolved: (state.battle.triggerResolved || []).slice(0, 10),
        }
      : null,
    toast: state.toastTime > 0 ? state.toast : null,
  };
  return JSON.stringify(payload);
}

window.render_game_to_text = renderGameToText;
window.advanceTime = (ms) => {
  const frameMs = 1000 / 60;
  const steps = Math.max(1, Math.round(ms / frameMs));
  for (let i = 0; i < steps; i += 1) update(1 / 60);
  render();
};

canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerup", onPointerUp);
canvas.addEventListener("pointercancel", onPointerCancel);
canvas.addEventListener("contextmenu", onContextMenu);
window.addEventListener("keydown", onKeyDown);
window.addEventListener("resize", resizeCanvasDisplay);
document.addEventListener("fullscreenchange", resizeCanvasDisplay);

restoreLanguagePreference();
resizeCanvasDisplay();
render();
requestAnimationFrame(loop);
