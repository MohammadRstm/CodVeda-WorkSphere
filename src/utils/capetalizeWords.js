export function capitalizeWords(sentence) {
  return sentence
    .split(" ") // split sentence into words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
    .join(" "); // join back into a sentence
}
