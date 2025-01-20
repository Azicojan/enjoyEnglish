// utils/flashcardsData.js
import audio1 from "../assets/Numbers_lesson1/track1.wav";
import audio2 from "../assets/Numbers_lesson1/track2.wav";
import audio3 from "../assets/Numbers_lesson1/track3.wav";
import audio4 from "../assets/Numbers_lesson1/track4.wav";
import audio5 from "../assets/Numbers_lesson1/track5.wav";

export const flashcards = [
  {
    id: 1,
    front: "Assalomu aleykum, mening ismim Bil.",
    back: {
      text: "Hello, my name is Bill.",
      audio: audio1,
    },
  },
  {
    id: 2,
    front: "Men o'n yoshdaman.",
    back: {
      text: "I am ten years old.",
      audio: audio2,
    },
  },
  {
    id: 3,
    front: "Men London, Angliyada yashayman.",
    back: {
      text: "I live in London, England.",
      audio: audio3,
    },
  },
  {
    id: 4,
    front: "Jonli futbol o'yiniga birinchi kelishim.",
    back: {
      text: "This is my first live football match.",
      audio: audio4,
    },
  },
  {
    id: 5,
    front: "Men o'yinni ikkita aka-ukam bilan ko'ryapman.",
    back: {
      text: "I am watching the game with my two brothers.",
      audio: audio5,
    },
  },
];
