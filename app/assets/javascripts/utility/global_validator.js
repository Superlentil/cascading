var GlobalValidator = {
  Email: function(email) {
    return /\S+@\S+/.test(email);
  },
  
  Password: function(password) {
    return /\S{6,50}/.test(password);
  },
  
  Nickname: function(nickname) {
    if (/^[a-zA-Z0-9\u2E80-\u9FFF]{3,10}$/.test(nickname)) {   // all asian languages
      return true;
    } else {
      return false;
    }
  }
};