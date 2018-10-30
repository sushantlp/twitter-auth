"use strict";

// Create Json Object
module.exports.createJsonObject = (
  data,
  msg,
  location,
  code,
  bool,
  metadata
) => {
  return JSON.stringify({
    results: data,
    message: msg,
    requestLocation: location,
    status: code,
    bool: bool,
    metadata: metadata
  });
};
