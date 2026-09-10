/* =========================================================
   火龍出巡 · Fire Dragon Checkpoint Hunt — CONTENT
   ---------------------------------------------------------
   Everything a librarian would want to change lives here.
   No other file needs to be touched to edit the hunt.

   The game is bilingual (Traditional Chinese / English), so
   every player-facing string is an { en, zh } pair. Anything
   NOT shown directly to players (id, icon, correctIndex) is a
   plain value.

   Each checkpoint:
     id           short code used in the QR link, e.g. a code
                  of "A" means the QR points to
                  https://your-site/?checkpoint=A
                  (must be unique; letters/numbers are fine)
     name         { en, zh } real-world location name, shown
                  once solved
     icon         one emoji shown once the checkpoint is solved
     question     { en, zh } the multiple-choice question text
     options      { en: [4 strings], zh: [4 strings] } — keep
                  the SAME order/meaning in both languages so
                  correctIndex lines up for either language
     correctIndex index (0-3) of the correct entry in `options`
     clue         { en, zh } a description of this location,
                  shown to a player as their "next clue" once a
                  DIFFERENT checkpoint sends them here

   There is no fixed play order — a player can find the four
   checkpoints in any order, so every clue should make sense
   on its own, without depending on what came before it.
   ========================================================= */

var CHECKPOINTS = [
  {
    id: "A",
    name: { en: "3D Printer", zh: "3D打印機" },
    icon: "🖨️",
    question: {
      en: "Which file format is supported for the 3D printing service?",
      zh: "3D打印服務支援以下哪種檔案格式?"
    },
    options: {
      en: ["XLS", "EPUB", "DOC", "STL"],
      zh: ["XLS", "EPUB", "DOC", "STL"]
    },
    correctIndex: 3,
    clue: {
      en: "The dragon is calling you to a place where you can create something with a 3D printer.",
      zh: "火龍正呼喚你前往一個可以用3D打印機製作物件的地方。"
    }
  },
  {
    id: "B",
    name: { en: "Magazine", zh: "雜誌區" },
    icon: "📰",
    question: {
      en: "What is the maximum loan period for back issues of periodicals for students, including renewals?",
      zh: "學生借閱過期期刊的最長借閱期限是多久(連同續借在內)?"
    },
    options: {
      en: ["4 days", "8 days", "12 days", "24 days"],
      zh: ["4天", "8天", "12天", "24天"]
    },
    correctIndex: 1,
    clue: {
      en: "Your next dragon scale is waiting where you can browse the latest magazines and periodicals.",
      zh: "你的下一片龍鱗,正在一個可以瀏覽最新雜誌與期刊的地方等著你。"
    }
  },
  {
    id: "C",
    name: { en: "Study Box", zh: "討論室" },
    icon: "💬",
    question: {
      en: "Which email account can be used for room booking in the LRC?",
      zh: "在LRC預約房間時,可以使用哪個電郵帳戶?"
    },
    options: {
      en: ["Gmail", "Hotmail", "VTC email", "All of the above"],
      zh: ["Gmail", "Hotmail", "VTC電郵", "以上皆是"]
    },
    correctIndex: 2,
    clue: {
      en: "The dragon is looking for a quiet place where you can study and discuss.",
      zh: "火龍正在尋找一個可以安靜溫習與討論的地方。"
    }
  },
  {
    id: "D",
    name: { en: "e-Read Kiosk", zh: "電子閱讀展板" },
    icon: "📱",
    question: {
      en: "Try touching a book on the screen. What do you see?",
      zh: "試試在螢幕上輕觸一本書,你看到甚麼?"
    },
    options: {
      en: ["The screen turns off", "A book with a QR code link to it!", "A price tag", "An error message"],
      zh: ["螢幕熄滅", "顯示該書籍連結的QR code!", "價錢牌", "錯誤訊息"]
    },
    correctIndex: 1,
    clue: {
      en: "The dragon has found a place where books come alive on a screen.",
      zh: "火龍發現了一個讓書本在螢幕上活過來的地方。"
    }
  }
];

var GAME_CONFIG = {
  titleZh: "火龍出巡",
  subtitle: { en: "Fire Dragon Checkpoint Hunt", zh: "檢查站尋寶之旅" },
  pointsPerCheckpoint: 25,
  completionMessage: {
    en: "The fire dragon is ready to return home! Borrow any book this week to complete the hunt. Show your completion screen at the 6/F counter to receive your reward.",
    zh: "火龍準備回家了!本週內借閱任何一本書籍,即可完成任務。請在6/F櫃檯出示你的完成畫面,領取小禮物。"
  }
};
