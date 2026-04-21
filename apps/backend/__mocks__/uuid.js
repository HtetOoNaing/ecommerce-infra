const { randomUUID } = require("crypto");

module.exports = {
  v4: () => randomUUID(),
  v1: () => randomUUID(),
  v3: () => randomUUID(),
  v5: () => randomUUID(),
  v6: () => randomUUID(),
  v7: () => randomUUID(),
  NIL: "00000000-0000-0000-0000-000000000000",
  parse: (uuid) => uuid,
  stringify: (bytes) => bytes,
  validate: (uuid) => typeof uuid === "string" && uuid.length === 36,
  version: () => 4,
};
