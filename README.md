tg_bot.js: A simple wrapper for Telegram Bot API, written in Javascript, for Browser
---

usage:

```Javascript
// Create a bot. 'token' is your bot token, polling_invt is the time between two update poll. (ms)
var tg = new TelegramBot({token: 'xxxxxx:xxxxxxxxxxxxx', polling_invt: 1000});

// Set Handler:
/* onerror: Trigger when any error happened, an object represent error will be pass in.
 * onapi: Trigger when any API respond after ant API call. (except getUpdates). Respond object will be pass in.
 * onmessage: Trigger when got any message (including channel message, edited message). The Message object will be pass in.
 * oninline: Trigger when got inline query. Query object will be pass in.
 * oninlineselect: Trigger when inline select. Object will be pass in.
 * oncallback: Trigger when got callback. Object will be pass in.
 */
tg.onerror = tg.onapi = tg.onmessage = tg.oninline = tg.oninlineselect = tg.oncallback = m => console.log(m);

// Start polling:
tg.bot.start();

// Sending message:
tg.api.sendMessage({chat_id: 12345, text: 'text'});

// Sending file:
var fd = new FormData();
fd.append('chat_id', 12345);
fd.append('document', file /* Your file object. */);
tg.api.sendDocument(fd);

// refer to https://core.telegram.org/bots/api for usage of other API methods.
```
