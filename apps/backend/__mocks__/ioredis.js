const EventEmitter = require("events");

class MockRedis extends EventEmitter {
  constructor() {
    super();
  }

  get() { return Promise.resolve(null); }
  set() { return Promise.resolve("OK"); }
  del() { return Promise.resolve(1); }
  setex() { return Promise.resolve("OK"); }
  quit() { return Promise.resolve("OK"); }
  disconnect() {}
  duplicate() { return new MockRedis(); }
}

// Support both: require("ioredis") and require("ioredis").default
module.exports = MockRedis;
module.exports.default = MockRedis;
