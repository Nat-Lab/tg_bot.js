class TelegramBot {
  constructor ({token, polling_invt = 1}) {
    this.token = token;
    this.intv = polling_invt;
    var api = 'https://api.telegram.org/bot' + token + '/';
    this.request = config => {
      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', api + config.method);
        xhr.setRequestHeader(
          'Content-type', 
           config.sendfile ? 'multipart/form-data' : 'application/json'
        );
        xhr.send(config.data);
        xhr.onerror = function() {
          reject({ok: false, err: xhr.statusText});
        };
        xhr.onload = function () {
          if (this.status == 200) resolve({
            ok: true, 
            res: JSON.parse(xhr.response)
          });
          else reject({
            ok: false,
            res: xhr.response,
            msg: xhr.statusText
          });
        };
      });
    };
  };
  set onreceive (handler_func) {
    this.msg_handler = handler_func;
  };
  set onapi (handler_func) {
    this.api_handler = handler_func;
  };
  set onerror (handler_func) {
    this.apierr = handler_func;
  };
  sendMessage (apiparam) {
    request({data: apiparam, method: 'sendMessage'})
      .then(api_handler)
      .catch(apierr);
  };
  start () {
    if (!this.msg_handler || !this.api_handler || !this.apierr) {
      throw {
        name: 'HandlerError',
        message: 'Handler for message, API respond, or API error was not defined.',
        toString: function() {
          return this.name + ': ' + this.message;
        }
      };
    };
  };
}
