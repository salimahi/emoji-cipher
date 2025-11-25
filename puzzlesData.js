// puzzlesData.js
// Holds all puzzle definitions and lookup helpers.

(function (global) {
  "use strict";

  /** @type {Array<PuzzleDefinition>} */
  const PUZZLES = [
    {
      id: "001",
      phrase: "COOL GAME BRO",
      phraseWords: [
        ["🦊","🪐","🪐","🐸"],
        ["🚀","🌵","🎲","🔮"],
        ["🧊","🐙","🪐"]
      ],
      mapping: {
        "🦊": { letter:"C", number:3 },
        "🪐": { letter:"O", number:8 },
        "🐸": { letter:"L", number:4 },
        "🚀": { letter:"G", number:7 },
        "🌵": { letter:"A", number:1 },
        "🎲": { letter:"M", number:6 },
        "🔮": { letter:"E", number:2 },
        "🧊": { letter:"B", number:5 },
        "🐙": { letter:"R", number:9 }
      },
      uniqueEmojis: ["🦊","🪐","🐸","🚀","🌵","🎲","🔮","🧊","🐙"],
      equations: [
        { left:["🚀","+","🪐"], target:15 },
        { left:["🪐","+","🧊"], target:13 },
        { left:["🦊","+","🌵","+","🎲"], target:10 },
        { left:["🎲","+","🔮"], target:8 },
        { left:["🐸","+","🚀"], target:11 },
        { left:["🧊","+","🐙"], target:14 },
        { left:["🐙","+","🌵"], target:10 },
        { left:["🚀","+","🦊","+","🐸"], target:14 }
      ],
      contextHint: "Your feedback to me about Emoji Cipher.",
      unlockAfter: [],
      chapter: 1,
      tags: ["intro"]
    },
    {
      id: "002",
      phrase: "IT IS NAP TIME",
      phraseWords: [
        ["🍄","🧊"],
        ["🍄","🐸"],
        ["🐙","🌵","🦊"],
        ["🧊","🍄","🎲","🔮"]
      ],
      mapping: {
        "🍄": { letter:"I", number:4 },
        "🧊": { letter:"T", number:9 },
        "🐸": { letter:"S", number:2 },
        "🐙": { letter:"N", number:5 },
        "🌵": { letter:"A", number:1 },
        "🦊": { letter:"P", number:7 },
        "🎲": { letter:"M", number:6 },
        "🔮": { letter:"E", number:3 }
      },
      uniqueEmojis: ["🍄","🧊","🐸","🐙","🌵","🦊","🎲","🔮"],
      equations: [
        { left:["🍄","+","🐙"], target:9 },
        { left:["🐸","+","🎲"], target:8 },
        { left:["🌵","+","🔮"], target:4 },
        { left:["🎲","+","🦊"], target:13 },
        { left:["🧊","+","🎲"], target:15 }
      ],
      contextHint: "Friday afternoons.",
      unlockAfter: ["001"],
      chapter: 1,
      tags: ["intro"]
    },
    {
      id: "003",
      phrase: "HERBAL OR VERBAL TEA",
      phraseWords: [
        ["🪐","🔮","🌊","🚀","🌵","🐙"],
        ["🎲","🌊"],
        ["🦊","🔮","🌊","🚀","🌵","🐙"],
        ["🧊","🔮","🌵"]
      ],
      mapping: {
        "🪐": { letter:"H", number:4 },
        "🔮": { letter:"E", number:2 },
        "🌊": { letter:"R", number:9 },
        "🚀": { letter:"B", number:5 },
        "🌵": { letter:"A", number:1 },
        "🐙": { letter:"L", number:7 },
        "🎲": { letter:"O", number:6 },
        "🦊": { letter:"V", number:8 },
        "🧊": { letter:"T", number:3 }
      },
      uniqueEmojis: ["🪐","🔮","🌊","🚀","🌵","🐙","🎲","🦊","🧊"],
      equations: [
        { left:["🪐","+","🔮"], target:6 },
        { left:["🦊","+","🧊"], target:11 },
        { left:["🌊","+","🚀"], target:14 },
        { left:["🌵","+","🐙"], target:8 },
        { left:["🔮","+","🌊"], target:11 },
        { left:["🚀","+","🌵"], target:6 },
        { left:["🦊","+","🔮"], target:10 },
        { left:["🪐","+","🧊"], target:7 },
        { left:["🧊","+","🔮","+","🌵"], target:6 }
      ],
      contextHint: "Hot bev or hot goss - why not both?",
      unlockAfter: ["002"],
      chapter: 1,
      tags: ["intro"]
    },
    {
      id: "004",
      phrase: "ADDICTED TO RAGEAHOL",
      phraseWords: [
        ["🌵","🎲","🎲","🍄","🦊","🧊","🔮","🎲"],
        ["🧊","⭐️"],
        ["🌊","🌵","🚀","🔮","🌵","🐸","⭐️","🐙"]
      ],
      mapping: {
        "🌵": { letter:"A", number:1 },
        "🎲": { letter:"D", number:7 },
        "🍄": { letter:"I", number:4 },
        "🦊": { letter:"C", number:8 },
        "🧊": { letter:"T", number:9 },
        "🔮": { letter:"E", number:3 },
        "⭐️": { letter:"O", number:6 },
        "🌊": { letter:"R", number:5 },
        "🚀": { letter:"G", number:2 },
        "🐸": { letter:"H", number:4 },
        "🐙": { letter:"L", number:8 }
      },
      uniqueEmojis: ["🌵","🎲","🍄","🦊","🧊","🔮","⭐️","🌊","🚀","🐸","🐙"],
      equations: [
        { left:["🌵","+","🎲"], target:8 },
        { left:["⭐️","+","🐙"], target:14 },
        { left:["🎲","+","🍄"], target:11 },
        { left:["🦊","+","🧊"], target:17 },
        { left:["🌊","+","⭐️"], target:11 },
        { left:["🔮","+","🎲"], target:10 },
        { left:["🌊","+","🌵","+","🚀"], target:8 },
        { left:["🐸","+","🎲"], target:11 },
        { left:["🎲","+","🐙"], target:15 }
      ],
      contextHint: "Homer, season 13 ep 18.",
      unlockAfter: ["003"],
      chapter: 1,
      tags: ["intro"]
    },
    {
      id: "005",
      phrase: "I BARELY EVEN KNOW HER",
      phraseWords: [
        ["🍄"],
        ["🚀","🌵","🌊","🔮","🐙","🧊"],
        ["🔮","🎲","🔮","🪐"],
        ["🦊","🪐","🐸","🦴"],
        ["🐢","🔮","🌊"]
      ],
      mapping: {
        "🍄": { letter:"I", number:4 },
        "🚀": { letter:"B", number:6 },
        "🌵": { letter:"A", number:1 },
        "🌊": { letter:"R", number:9 },
        "🔮": { letter:"E", number:2 },
        "🐙": { letter:"L", number:7 },
        "🧊": { letter:"Y", number:8 },
        "🎲": { letter:"V", number:5 },
        "🪐": { letter:"N", number:3 },
        "🦊": { letter:"K", number:4 },
        "🐸": { letter:"O", number:6 },
        "🦴": { letter:"W", number:2 },
        "🐢": { letter:"H", number:5 }
      },
      uniqueEmojis: ["🍄","🚀","🌵","🌊","🔮","🐙","🧊","🎲","🪐","🦊","🐸","🦴","🐢"],
      equations: [
        { left:["🍄","+","🔮"], target:6 },
        { left:["🪐","+","🌊"], target:12 },
        { left:["🐙","+","🎲"], target:12 },
        { left:["🔮","+","🐙","+","🧊"], target:17 },
        { left:["🦴","+","🐢"], target:7 },
        { left:["🐢","+","🌵"], target:6 },
        { left:["🍄","+","🦊"], target:8 },
        { left:["🌵","+","🐸"], target:7 },
        { left:["🚀","+","🎲"], target:11 },
        { left:["🦊","+","🪐","+","🐸","+","🦴"], target:15 },
        { left:["🐢","+","🔮"], target:7 }
      ],
      contextHint: "response to any word that ends in er or ar.",
      unlockAfter: ["004"],
      chapter: 1,
      tags: ["intro"]
    },
    {
      id: "006",
      phrase: "SEND MORE KITTENS",
      phraseWords: [
        ["🦊","🐸","🪐","🎲"],
        ["🚀","🔮","🌵","🐸"],
        ["🧊","🍄","🦴","🦴","🐸","🪐","🦊"]
      ],
      mapping: {
        "🦊": { letter:"S", number:6 },
        "🐸": { letter:"E", number:2 },
        "🪐": { letter:"N", number:5 },
        "🎲": { letter:"D", number:4 },
        "🚀": { letter:"M", number:7 },
        "🔮": { letter:"O", number:8 },
        "🌵": { letter:"R", number:3 },
        "🧊": { letter:"K", number:9 },
        "🍄": { letter:"I", number:1 },
        "🦴": { letter:"T", number:4 }
      },
      uniqueEmojis: ["🦊","🐸","🪐","🎲","🚀","🔮","🌵","🧊","🍄","🦴"],
      equations: [
        { left:["🦊","+","🐸"], target:8 },
        { left:["🐸","+","🪐","+","🎲"], target:11 },
        { left:["🚀","+","🔮"], target:15 },
        { left:["🌵","+","🐸"], target:5 },
        { left:["🍄","+","🪐"], target:6 },
        { left:["🚀","+","🪐"], target:12 },
        { left:["🧊","+","🍄"], target:10 },
        { left:["🦴","+","🦊"], target:10 },
        { left:["🌵","+","🪐","+","🧊"], target:17 }
      ],
      contextHint: "A good solve for anything.",
      unlockAfter: ["005"],
      chapter: 1,
      tags: ["intro"]
    },
    {
      id: "007",
      phrase: "CAUGHT A VIBE",
      phraseWords: [
        ["🌵","🐙","🚀","🦊","🐸","🧊"],
        ["🐙"],
        ["🎲","🔮","🪐","🦴"]
      ],
      mapping: {
        "🌵": { letter:"C", number:2 },
        "🐙": { letter:"A", number:1 },
        "🚀": { letter:"U", number:6 },
        "🦊": { letter:"G", number:7 },
        "🐸": { letter:"H", number:4 },
        "🧊": { letter:"T", number:9 },
        "🎲": { letter:"V", number:8 },
        "🔮": { letter:"I", number:3 },
        "🪐": { letter:"B", number:5 },
        "🦴": { letter:"E", number:2 }
      },
      uniqueEmojis: ["🌵","🐙","🚀","🦊","🐸","🧊","🎲","🔮","🪐","🦴"],
      equations: [
        { left:["🌵","+","🐙"], target:3 },
        { left:["🚀","+","🦊"], target:13 },
        { left:["🐸","+","🧊"], target:13 },
        { left:["🦴","+","🐸"], target:6 },
        { left:["🎲","+","🚀"], target:14 },
        { left:["🌵","+","🔮"], target:5 },
        { left:["🔮","+","🧊","+","🦊"], target:19 },
        { left:["🪐","+","🦴"], target:7 },
        { left:["🐙","+","🎲"], target:9 }
      ],
      contextHint: "Willow Smith.",
      unlockAfter: ["006"],
      chapter: 1,
      tags: ["intro"]
    },
    {
      id: "008",
      phrase: "A CENTER FOR ANTS",
      phraseWords: [
        ["🐙"],
        ["🧊","🌵","🦴","🔮","🌵","🎲"],
        ["🪐","🐸","🎲"],
        ["🐙","🦴","🔮","🚀"]
      ],
      mapping: {
        "🐙": { letter:"A", number:1 },
        "🧊": { letter:"C", number:6 },
        "🌵": { letter:"E", number:2 },
        "🦴": { letter:"N", number:5 },
        "🔮": { letter:"T", number:9 },
        "🎲": { letter:"R", number:4 },
        "🪐": { letter:"F", number:7 },
        "🐸": { letter:"O", number:8 },
        "🚀": { letter:"S", number:3 }
      },
      uniqueEmojis: ["🐙","🧊","🌵","🦴","🔮","🎲","🪐","🐸","🚀"],
      equations: [
        { left:["🧊","+","🌵"], target:8 },
        { left:["🪐","+","🚀"], target:10 },
        { left:["🦴","+","🔮"], target:14 },
        { left:["🌵","+","🎲"], target:6 },
        { left:["🪐","+","🐸"], target:15 },
        { left:["🎲","+","🐙"], target:5 },
        { left:["🧊","+","🔮"], target:15 }
      ],
      contextHint: "Zoolander.",
      unlockAfter: ["007"],
      chapter: 1,
      tags: ["intro"]
    },
    {
      id: "009",
      phrase: "BY DOG I MEAN SON",
      phraseWords: [
        ["🧊","🎲"],
        ["🐸","🪐","🦊"],
        ["🍄"],
        ["🚀","🌵","🪼","🔮"],
        ["🐙","🪐","🔮"]
      ],
      mapping: {
        "🧊": { letter:"B", number:4 },
        "🎲": { letter:"Y", number:7 },
        "🐸": { letter:"D", number:8 },
        "🪐": { letter:"O", number:6 },
        "🦊": { letter:"G", number:5 },
        "🍄": { letter:"I", number:3 },
        "🚀": { letter:"M", number:9 },
        "🌵": { letter:"E", number:2 },
        "🪼": { letter:"A", number:1 },
        "🔮": { letter:"N", number:4 },
        "🐙": { letter:"S", number:6 }
      },
      uniqueEmojis: ["🧊","🎲","🐸","🪐","🦊","🍄","🚀","🌵","🪼","🔮","🐙"],
      equations: [
        { left:["🧊","+","🎲"], target:11 },
        { left:["🐸","+","🪐"], target:14 },
        { left:["🦊","+","🍄"], target:8 },
        { left:["🐸","+","🍄","+","🚀"], target:20 },
        { left:["🎲","+","🔮"], target:11 },
        { left:["🚀","+","🌵"], target:11 },
        { left:["🪼","+","🔮"], target:5 },
        { left:["🐸","+","🧊"], target:12 },
        { left:["🦊","+","🪐"], target:11 },
        { left:["🐙","+","🪐","+","🔮"], target:16 }
      ],
      contextHint: "Simpsons season 4 ep 21.",
      unlockAfter: ["008"],
      chapter: 1,
      tags: ["intro"]
    },
    {
      id: "010",
      phrase: "GREAT WORK SO FAR",
      phraseWords: [
        ["🦊","🌵","🧊","🎲","🔮"],
        ["🚀","🐸","🌵","🦴"],
        ["🐙","🐸"],
        ["🍄","🎲","🌵"]
      ],
      mapping: {
        "🦊": { letter:"G", number:8 },
        "🌵": { letter:"R", number:4 },
        "🧊": { letter:"E", number:2 },
        "🎲": { letter:"A", number:1 },
        "🔮": { letter:"T", number:9 },
        "🚀": { letter:"W", number:6 },
        "🐸": { letter:"O", number:7 },
        "🦴": { letter:"K", number:5 },
        "🐙": { letter:"S", number:3 },
        "🍄": { letter:"F", number:4 }
      },
      uniqueEmojis: ["🦊","🌵","🧊","🎲","🔮","🚀","🐸","🦴","🐙","🍄"],
      equations: [
        { left:["🔮","+","🦴"], target:14 },
        { left:["🦊","+","🌵"], target:12 },
        { left:["🧊","+","🎲"], target:3 },
        { left:["🔮","+","🚀"], target:15 },
        { left:["🦊","+","🍄"], target:12 },
        { left:["🐸","+","🌵"], target:11 },
        { left:["🦴","+","🐙"], target:8 },
        { left:["🍄","+","🎲","+","🌵"], target:9 }
      ],
      contextHint: "How you are doing.",
      unlockAfter: ["009"],
      chapter: 1,
      tags: ["intro"]
    }
  ];

  const puzzlesById = {};
  for (const p of PUZZLES) {
    puzzlesById[p.id] = p;
  }

  function getPuzzleById(id) {
    return puzzlesById[id] || null;
  }

  function getAllPuzzles() {
    return PUZZLES.slice();
  }

  function getNextPuzzlesToUnlock(id) {
    return PUZZLES.filter(p => Array.isArray(p.unlockAfter) && p.unlockAfter.includes(id));
  }

  global.PuzzlesData = {
    getPuzzleById,
    getAllPuzzles,
    getNextPuzzlesToUnlock
  };

})(window);
