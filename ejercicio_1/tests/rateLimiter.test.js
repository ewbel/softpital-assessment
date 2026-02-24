const { createRateLimiter } = require('../src/createRateLimiter');

console.log('=== Test ===');

const limiter = createRateLimiter(3, 1000);

console.log(limiter('user1')); // true
console.log(limiter('user1')); // true
console.log(limiter('user1')); // true
console.log(limiter('user1')); // false

console.log('=== Test multi usuario ===');

console.log(limiter('user2'));