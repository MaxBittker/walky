function nrandom() {
  return Math.random() - 0.5;
}
function elapsedMillis(millis: number) {
  return Date.now() - millis;
}
export { elapsedMillis, nrandom };
