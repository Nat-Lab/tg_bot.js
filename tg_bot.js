var TelegramBot = function ({token, polling_invt = 1000}) {
  var api = 'https://api.telegram.org/bot' + token + '/',
      request = function (config) {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open('POST', api + config.method);
          xhr.setRequestHeader(
            'Content-type',
             config.sendfile ? 'multipart/form-data' : 'application/json'
          );
          xhr.send(config.sendfile ? config.data : JSON.stringify(config.data));
          xhr.onerror = function() {
            reject({ok: false, err: xhr.statusText});
          };
          xhr.onload = function () {
            if (this.status == 200) {
              var res = JSON.parse(xhr.response);
              if (res.ok) resolve(res);
              else reject(res);
            }
            else reject({
              ok: false,
              res: xhr.response,
              msg: xhr.statusText
            });
          };
        });
      },
      Exception = function ({name, message}) {
        return {
          name, message,
          toString: function () {
            return this.name + ': ' + this.message;
          }
        };
      },
      msg_handler, api_handler, err_handler, inline_handler, inlinesel_handler,
      callback_handler, poller = -1, offset = 0,
      api_methods = [
        'sendMessage',
        'forwardMessage',
        'sendLocation',
        'sendVenue',
        'sendContact',
        'sendChatAction',
        'getUserProfilePhotos',
        'getFile',
        'kickChatMember',
        'leaveChat',
        'unbanChatMember',
        'getChat',
        'getChatAdministrators',
        'getChatMembersCount',
        'getChatMember',
        'answerCallbackQuery'
      ],
      f_api_methods = [
        'sendPhoto',
        'sendAudio',
        'sendDocument',
        'sendSticker',
        'sendVideo',
        'sendVoice'
      ],
      apis = (function () {
        var methods = {};
        api_methods.forEach(method => {
          methods[method] = apidata => {
            request({data: apidata, method: method})
              .then(api_handler)
              .catch(err_handler);
          };
        });
        f_api_methods.forEach(method => {
          methods[method] = apidata => {
            request({data: apidata, method: method, sendfile: true})
              .then(api_handler)
              .catch(err_handler);
          };
        });
        return methods;
      })();
  return {
    set onmessage (handler_func) { msg_handler = handler_func; },
    set oninline (handler_func) { inline_handler = handler_func; },
    set oninlineselect (handler_func) { inlinesel_handler = handler_func; },
    set oncallback (handler_func) { callback_handler = handler_func; },
    set onapi (handler_func) { api_handler = handler_func; },
    set onerror (handler_func) { err_handler = handler_func; },
    get onmessage () { return msg_handler; },
    get oninline () { return inline_handler; },
    get oninlineselect () { return inlinesel_handler; },
    get oncallback () { return callback_handler; },
    get onapi () { return api_handler; },
    get onerror () { return err_handler; },
    api: apis,
    bot: {
      start () {
        if (!msg_handler || !api_handler || !err_handler) throw new Exception({
          name: 'HandlerError',
          message: 'Need message handler, api handler, and error handler must be set to start the bot.'
        });
        if(poller > 0) throw new Exception({
          name: 'BotError',
          message: 'Try to start a bot that was not started.'
        });
        poller = window.setInterval(() => {
          request({data: {offset}, method: 'getUpdates'})
            .then(res => {
              res.result.forEach(result => {
                offset = result.update_id;
                if(result.message) msg_handler(result.message);
                if(result.edited_message) msg_handler(result.edited_message);
                if(result.channel_post) msg_handler(result.channel_post);
                if(result.edited_channel_post) msg_handler(result.edited_channel_post);
                if(result.inline_query && inline_handler) inline_handler(result.inline_query);
                if(result.chosen_inline_result && inlinesel_handler) inlinesel_handler(result.chosen_inline_result);
                if(result.callback_query && callback_handler) callback_handler(result.callback_query);
              });
              offset++;
            })
            .catch(err_handler);
        }, polling_invt);
      },
      stop () {
        if(poller > 0) {
          window.clearInterval(poller);
          poller = -1;
        }
        else throw new Exception({
          name: 'BotError',
          message: 'Try to stop a bot that was not started.'
        });
      }
    }
  };
};
