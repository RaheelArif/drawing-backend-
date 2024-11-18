class TaskStore {
    constructor() {
      this.store = new Map();
    }
  
    set(key, value) {
      this.store.set(key, value);
    }
  
    get(key) {
      return this.store.get(key);
    }
  
    has(key) {
      return this.store.has(key);
    }
  }
  
  module.exports = new TaskStore();