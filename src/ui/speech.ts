/** Reads text aloud in Polish. One word is free in the UI. A whole sentence costs a token. */
export function say(text: string): void {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pl-PL';
  utterance.rate = 0.8;
  speechSynthesis.speak(utterance);
}
