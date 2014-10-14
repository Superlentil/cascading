var GlobalValidator = {
  Email: function(email) {
    return /\S+@\S+/.test(email);
  },
  
  Password: function(password) {
    return /\S{6,50}/.test(password);
  },
  
  Nickname: function(nickname) {
    if (/^[a-zA-Z\u2E80-\u9FFF]{1}[a-zA-Z0-9\u2E80-\u9FFF]*$/.test(nickname)) {   // all asian languages
      var length = nickname.replace(/[\u2E80-\u9FFF]/g, "00").length;
      if (length < 3 || length > 10) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
};