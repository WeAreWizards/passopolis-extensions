export function assert(expression: bool) {
  if (!expression) {
    throw new Error('Assertion failed');
  }
}
