function createRateLimiter(limit, winsowsMs) {
  const requests = {};

  return function(userId) {
    const now = Date.now();

    if(!requests[userId]) {
      requests[userId] = [];
    }

    requests[userId] = requests[userId].filter(
      (timestamp) => now - timestamp < winsowsMs
    );

    if(requests[userId].length >= limit) {
      return false;
    }

    requests[userId].push(now);
    return true;
  } 
};

module.exports = { 
  createRateLimiter
};