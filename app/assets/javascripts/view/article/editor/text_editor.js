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
      "click .m-clear-format": "clearFormat",
      "click .m-bold": "bold",
      "click .m-italic": "italic",
      "click .m-large-font": "largeFont",
      "click .m-small-font": "smallFont"
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
        range.setStart(editor[0], 0);
        var beforeContent = $(range.extractContents());
        if (editor.text().length === 0) {
          editor.empty();
        }
        
        range.insertNode(unformattedNode);
        if (beforeContent.text().length > 0) {
          range.insertNode(beforeContent[0]);
        }
        range.setStartBefore(unformattedNode);
        
        this.restoreSelection(range);
      }
    }
  },
  
  
  bold: function(event) {
    var that = this;
    that.addFormat("<strong></strong>", function(jQueryElement, vagueMatch) {
      return that.htmlTag(jQueryElement) === "strong";
    });
  },
  
  
  italic: function(event) {
    var that = this;
    that.addFormat("<em></em>", function(jQueryElement, vagueMatch) {
      return that.htmlTag(jQueryElement) === "em";
    });
  },
  
  
  largeFont: function(event) {
    var that = this;
    that.addFormat("<span style=\"font-size:1.42857em\"></span>", function(jQueryElement, vagueMatch) {
      if (that.htmlTag(jQueryElement) === "span") {
        var style = jQueryElement.attr("style");
        if (style) {
          if (vagueMatch) {
            return style.match(/font-size/i);
          } else {
            return style.match(/font-size:1.42857em/i);
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
  },
  
  
  smallFont: function(event) {
    var that = this;
    that.addFormat("<span style=\"font-size:0.7em\"></span>", function(jQueryElement, vagueMatch) {
      if (that.htmlTag(jQueryElement) === "span") {
        var style = jQueryElement.attr("style");
        if (style) {
          if (vagueMatch) {
            return style.match(/font-size/i);
          } else {
            return style.match(/font-size:0.7em/i);
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
  },
  
  
  addFormat: function(htmlFormat, htmlFormatMatcher) {
    var selectedRange = this.selectedRange;
    if (selectedRange) {
      var restoredSelection = this.restoreSelection(selectedRange);
      if (restoredSelection) {
        var range = restoredSelection.getRangeAt(0);
        var parentNode = $(range.commonAncestorContainer);
        var tagName = this.htmlTag(parentNode);
        var needChange = true;
        while (tagName !== "pre") {
          if (htmlFormatMatcher(parentNode, true)) {
            if (htmlFormatMatcher(parentNode)) {
              needChange = false;
            } else {
              
            }
            break;
          }
          parentNode = parentNode.parent();
          tagName = this.htmlTag(parentNode);
        }
        if (needChange) {
          var formattedNode = $(htmlFormat).append(range.extractContents());
          this.stripSubTag(formattedNode.children(), htmlFormatMatcher);
          var selectStartMark = $("<span></span>");
          var selectEndMark = $("<span></span>");
          formattedNode.prepend(selectStartMark);
          formattedNode.append(selectEndMark);
          
          range.insertNode(formattedNode[0]);
          
          this.mergeAdjoinNode(formattedNode, range, true, htmlFormatMatcher);
          this.mergeAdjoinNode(formattedNode, range, false, htmlFormatMatcher);
          
          this.stripSubTag(formattedNode.children(), htmlFormatMatcher);
          
          range.setStartAfter(selectStartMark[0]);
          selectStartMark.remove();
          range.setEndBefore(selectEndMark[0]);
          selectEndMark.remove();
          this.restoreSelection(range);
        }
      }
    }
    console.log(this.editor.html());
  },
  
  
  htmlTag: function(jQueryElement) {
    return (jQueryElement.prop("tagName") || "").toLowerCase();
  },
  
  
  mergeAdjoinNode: function(currentNode, selectedRange, isPreviousNode, htmlFormatMatcher) {
    var merge = false;
    var adjoinNode = isPreviousNode ? currentNode.prev() : currentNode.next();
    while (adjoinNode.length > 0) {
      if (adjoinNode.text().length === 0) {
        adjoinNode.remove();
        adjoinNode = isPreviousNode ? currentNode.prev() : currentNode.next();
      } else {
        if (isPreviousNode) {
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
            if (htmlFormatMatcher(children)) {
              merge = true;
              break;
            }
            children = children.contents();
          } else {
            break;
          }
        }
        
        break;
      }
    }
    
    if (merge) {
      adjoinNode.detach();
      if (isPreviousNode) {
        currentNode.prepend(adjoinNode);
      } else {
        currentNode.append(adjoinNode);
      }
    }
  },
  
  
  stripSubTag: function(subElements, htmlFormatMatcher) {
    var children = subElements;
    var childrenLength = children.length;
    for (var index = 0; index < childrenLength; ++index) {
      var child = $(children[index]);
      this.stripSubTag(child.children(), htmlFormatMatcher);
      if (htmlFormatMatcher(child, true)) {
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
