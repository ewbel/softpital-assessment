function createRateLimiter(limit, windowsMs) {
  const requests = {};

  return function(userId) {
    const now = Date.now();

    if(!requests[userId] || now > requests[userId].resetTime) {
      requests[userId] = { count: 0, resetTime: now + windowsMs };
    }

    if(requests[userId].count >= limit) {
      return false;
    }

    requests[userId].count++;
    return true;
  };
};

module.exports = { 
  createRateLimiter
};