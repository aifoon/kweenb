/**
 * Create a Dictionary
 */

export default class Dictionary<T> {
  private memory = new Map<string, T>()

  setValue(key: string, value: T) {
    this.memory.set(key, value);
  }

  getMemory() {
    return this.memory;
  }

  getValue(key: string) {
    return this.memory.get(key);
  }
}