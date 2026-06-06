const badWords = ["গালি১", "গালি২", "ফেকলিংক"]; // আপনার প্রয়োজন অনুযায়ী লিস্ট বড় করতে পারেন

export const checkContent = (text) => {
  let cleaned = text;
  badWords.forEach(word => {
    const regex = new RegExp(word, "gi");
    cleaned = cleaned.replace(regex, "***");
  });
  return cleaned;
};
