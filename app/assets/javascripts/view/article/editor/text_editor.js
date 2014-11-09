// define the view "TextEditor"
View.Article.Editor.TextEditor = View.Article.Editor.BaseEditor.extend({
  template: JST["template/article/editor/text_editor"],
  
  
  renderHelper: function() {
    this.editor = this.$el.find(".Paragraph");
  },
  
  
  events: function() {
    return _.extend({}, View.Article.Editor.BaseEditor.prototype.events, {
      "paste .Paragraph": "onPaste",
      "blur .Paragraph": "onBlur",
      "click .article-editor-text-clear-format": "clearFormat",
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
  
  
  clearFormat: function(event) {
    var selectedRange = this.selectedRange;
    if (selectedRange) {
      var restoredSelection = this.restoreSelection(selectedRange);
      if (restoredSelection) {
        var range = restoredSelection.getRangeAt(0);
        var unformattedNode = document.createTextNode($(range.extractContents()).text());
        
        var editor = this.editor;
        range.setStart(editor.first()[0], 0);
        var beforeContent = $(range.extractContents());
        if (editor.text().length === 0) {
          editor.empty();
        }
        
        range.insertNode(unformattedNode);
        if (beforeContent.text().length > 0) {
          range.insertNode(beforeContent[0]);
        }
        range.setStart(unformattedNode, 0);
        
        this.restoreSelection(range);
      }
    }
  },
  
  
  htmlTag: function(jQuerySelector) {
    return (jQuerySelector.prop("tagName") || "").toLowerCase();
  },
  
  
  mergeAdjoinNode: function(currentNode, selectedRange, leftAdjoinNode) {
    var merge = false;
    var adjoinNode = leftAdjoinNode ? currentNode.prev() : currentNode.next();
    console.log(adjoinNode);
    if (adjoinNode.length > 0) {
      if (adjoinNode.text().length === 0) {
        adjoinNode.remove();
      } else {
        if (leftAdjoinNode) {
          selectedRange.setStartBefore(adjoinNode[0]);
          selectedRange.setEndBefore(currentNode[0]);
        } else {
          selectedRange.setStartAfter(currentNode[0]);
          selectedRange.setEndAfter(adjoinNode[0]);
        }

        var children = $("<div></div>").append(selectedRange.cloneContents()).contents();

        while (children.length > 0) {
          var childrenCount = children.length;
          var realChildCount = 0;
          var realChildIndex = 0;
          for(var index = 0; index < childrenCount; ++index) {
            var child = $(children[index]);
            if (child.text().length > 0) {
              ++realChildCount;
              realChildIndex = index;
            } else {
              child.remove();
            }
          }
          
          if (realChildCount === 1) {
            children = $(children[realChildIndex]);
            if (this.htmlTag(children) === "strong") {
              merge = true;
              break;
            }
            children = children.contents();
          } else {
            break;
          }
        }
      }
    }
    
    if (merge) {
      adjoinNode.detach();
      if (leftAdjoinNode) {
        currentNode.prepend(adjoinNode);
      } else {
        currentNode.append(adjoinNode);
      }
      return adjoinNode;
    } else {
      return null;
    }
  },
  
  
  onBold: function(event) {
    var selectedRange = this.selectedRange;
    if (selectedRange) {
      var restoredSelection = this.restoreSelection(selectedRange);
      if (restoredSelection) {
        var range = restoredSelection.getRangeAt(0);
        var parentNode = $(range.commonAncestorContainer);
        var tagName = this.htmlTag(parentNode);
        var needChange = true;
        while (tagName !== "pre") {
          if (tagName === "strong") {
            needChange = false;
            break;
          }
          parentNode = parentNode.parent();
          tagName = this.htmlTag(parentNode);
        }
        if (needChange) {
          var oldNode = $(range.extractContents());
          var oldNodeTextLength = oldNode.text().length;
          var formattedNode = $("<strong></strong>").append(oldNode);
          range.insertNode(formattedNode[0]);
          
          var leftMergedNode = this.mergeAdjoinNode(formattedNode, range, true);
          this.mergeAdjoinNode(formattedNode, range, false);
          
          this.stripSubTag(formattedNode.children(), "strong");
          
          var leftMergeNodeTextLength = leftMergedNode ? leftMergedNode.text().length : 0;
          range.selectNode(formattedNode[0]);
          range.setStart(formattedNode[0], leftMergeNodeTextLength);
          range.setEnd(formattedNode[0], leftMergeNodeTextLength + oldNodeTextLength);
          this.restoreSelection(range);
        }
      }
    }
    console.log(this.editor.html());
  },
  
  
  onItalic: function(event) {
    var selectedRange = this.selectedRange;
    if (selectedRange) {
      var restoredSelection = this.restoreSelection(selectedRange);
      if (restoredSelection) {
        var range = restoredSelection.getRangeAt(0);
        var fragment = $("<em></em>").append(range.extractContents());
        // this.stripSubTag(fragment, "em");
        range.insertNode(fragment[0]);
        this.restoreSelection(range);
      }
    }
  },
  
  
  stripSubTag: function(subElements, tagName) {
    var that = this;
    
    var children = subElements;
    var childrenLength = children.length;
    for (var index = 0; index < childrenLength; ++index) {
      var child = $(children[index]);
      console.log(child.html());
      that.stripSubTag(child.children(), tagName);
      if (this.htmlTag(child) === "strong") {
        child.before(child.html());
        child.remove();
      }
    }
  },
  
  
  // returns "range"
  saveSelection: function() {
    if (window.getSelection) {
      var selection = window.getSelection();
      if (selection.rangeCount) {
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
