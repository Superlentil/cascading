// define the view "TextEditor"
View.Article.Editor.TextEditor = View.Article.Editor.BaseEditor.extend({
  template: JST["template/article/editor/text_editor"],
  
  
  events: function() {
    return _.extend({}, View.Article.Editor.BaseEditor.prototype.events, {
      "paste .Paragraph": "onPaste"
      // "click .article-editor-text-bold": "onBold",
    });
  },
  
  
  onPaste: function(event) {
    event.preventDefault();
    
    var pasteText = "";
    var clipboard = (event.originalEvent || event).clipboardData;
    if (clipboard) {
      pasteText = clipboard.getData("text/plain");
    } else if (window.clipboardData) {
      pasteText = window.clipboardData.getData("Text");
    } else {
      prompt("For security purpose, please paste here:");
    }

    if (window.getSelection) {
      var selection = window.getSelection();
      if (selection.rangeCount) {
        selection.getRangeAt(0).deleteContents();
        selection.getRangeAt(0).insertNode(document.createTextNode("***" + pasteText + "***"));
      }
    } else if (document.selection) {
      if (document.selection.type === "Text") {
        var range = document.selection.createRange();
        range.text = "---" + pasteText + "---";
      }
    }
  }
  
  
  // onBold: function(event) {
    // if (window.getSelection) {
      // var selection = window.getSelection();
      // if (selection.rangeCount) {
        // var content = selection.getRangeAt(0).cloneContents();
        // selection.getRangeAt(0).deleteContents();
        // selection.getRangeAt(0).insertNode(document.createTextNode("<strong>" + content + "</strong>"));
      // }
    // } else if (document.selection) {
      // if (document.selection.type === "Text") {
        // var range = document.selection.createRange();
        // var content = range.htmlText;
        // range.text = "<strong>" + content + "</strong>";
      // }
    // }
  // }
});
