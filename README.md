# SpamWatch API JavaScript Wrapper

## Basic Usage

```javascript
const SpamWatch = require('spamwatch');
const client = new SpamWatch.Client(token);

(async () => {
    const ban = await client.getBan(777000);
    console.log(ban);
})();
```
