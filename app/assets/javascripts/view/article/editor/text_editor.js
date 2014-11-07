// define the view "TextEditor"
View.Article.Editor.TextEditor = View.Article.Editor.BaseEditor.extend({
  template: JST["template/article/editor/text_editor"],
  
  
  events: function() {
    return _.extend({}, View.Article.Editor.BaseEditor.prototype.events, {
      "paste .Paragraph": "onPaste",
      "blur .Paragraph": "onBlur",
      "click .article-editor-text-bold": "onBold",
      "click .article-editor-text-italic": "onItalic"
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
      var restoredSelection = this.restoreSelection(oldSelectRange);
      if (restoredSelection) {
        var range = restoredSelection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(pasteText));
        this.restoreSelection(range).collapseToEnd();
      } else {
        var input = $(event.currentTarget);
        input.html(input.html() + pasteText);
      }
    }
  },
  
  
  onBlur: function(event) {
    this.selectedRange = this.saveSelection();
  },
  
  
  onBold: function(event) {
    var selectedRange = this.selectedRange;
    if (selectedRange) {
      var restoredSelection = this.restoreSelection(selectedRange);
      if (restoredSelection) {
        var range = restoredSelection.getRangeAt(0);
        var parentNode = $(range.commonAncestorContainer);
        var tagName = (parentNode.prop("tagName") || "").toLowerCase();
        var needChange = true;
        while (tagName !== "pre") {
          console.log(tagName);
          parentNode = parentNode.parent();
          tagName = (parentNode.prop("tagName") || "").toLowerCase();
          if (tagName === "strong") {
            needChange = false;
          }
        }
        if (needChange) {
          var fragment = $("<strong></strong>").append(range.extractContents());
          this.stripSubTag(fragment, "strong");
          range.insertNode(fragment[0]);
          this.restoreSelection(range);
        }
      }
    }
  },
  
  
  onItalic: function(event) {
    var selectedRange = this.selectedRange;
    if (selectedRange) {
      var restoredSelection = this.restoreSelection(selectedRange);
      if (restoredSelection) {
        var range = restoredSelection.getRangeAt(0);
        var fragment = $("<em></em>").append(range.extractContents());
        console.log(fragment);
        // this.stripSubTag(fragment, "em");
        range.insertNode(fragment[0]);
        this.restoreSelection(range);
      }
    }
  },
  
  
  stripSubTag: function(jQueryElement, tagName) {
    var that = this;
    
    var children = jQueryElement.children(tagName);
    if (children.length > 0) {
      children.each(function(index, child) {
        var childElement = $(child);       
        that.stripSubTag(childElement, tagName);
        childElement.after(childElement.html());
        childElement.remove();
      });
    }
  },
  
  
  // returns "range"
  saveSelection: function() {
    if (window.getSelection) {
      var selection = window.getSelection();
      if (selection.getRangeAt && selection.rangeCount) {
        return selection.getRangeAt(0);
      }
    }
    return null;
  },
  
  
  // returns "selection"
  restoreSelection: function(oldSelectRange) {
    if (oldSelectRange && window.getSelection) {
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(oldSelectRange);
      return selection;
    }
    return null;
  }
});
