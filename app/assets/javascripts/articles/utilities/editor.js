Article.Utility.Editor = {
  toJSON: function(type, content) {
    return JSON.stringify({"type": type, "content": content});
  },
  
  toHTML: function(contentJSON) {
    var contentObj = JSON.parse(contentJSON);
    return "<div><p><em>" + contentObj.type + ":</em> " + contentObj.content + "</p></div>";
  }
};
