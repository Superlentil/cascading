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
    }
    
    var oldSelectRange = this.saveSelection();
    
    if (pasteText.length === 0) {
      pasteText = prompt("Please paste here. Your browser may not support direct secure paste.") || "";
    }

    if (pasteText.length > 0) {
      var restoredSelectRange = this.restoreSelection(oldSelectRange);
      var pasted = false;
      if (restoredSelectRange) {
        if (window.getSelection) {
          restoredSelectRange.deleteContents();
          restoredSelectRange.insertNode(document.createTextNode(pasteText));
          pasted = true;
        } else if (document.selection) {
          restoredSelectRange.text = pasteText;
          pasted = true;
        }
      }

      if (!pasted) {
        var input = $(event.currentTarget);
        input.html(input.html() + pasteText);
      }
    }
  },
  
  
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
  
  
  saveSelection: function() {
    if (window.getSelection) {
      var selection = window.getSelection();
      if (selection.getRangeAt && selection.rangeCount) {
        return selection.getRangeAt(0);
      }
    } else {
      var documentSelection = document.selection;
      if (documentSelection && documentSelection.createRange) {
        if (documentSelection.type === "Text") {
          return documentSelection.createRange();
        }
      }
    }
    return null;
  },
  
  
  restoreSelection: function(oldSelectRange) {
    if (oldSelectRange) {
      if (window.getSelection) {
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(oldSelectRange);
        return selection.getRangeAt(0);
      } else if (document.selection && oldSelectRange.select) {
        oldSelectRange.select();
        return oldSelectRange;
      }
    }
    return null;
  }
});
