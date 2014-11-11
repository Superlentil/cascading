// define the view "TextEditor"
View.Article.Editor.TextEditor = View.Article.Editor.BaseEditor.extend({
  template: JST["template/article/editor/text_editor"],
  
  
  renderHelper: function() {
    this.viewColorPicker = new View.Article.Editor.ColorPicker({pickEventHandler: function() {}});
    this.fontColorPickerOn = false;
    this.backgroundColorPickerOn = false;
    _.bindAll(this, "changeFontColor");
    _.bindAll(this, "changeBackgroundColor");
    this.fontColorButton = this.$el.find(".m-font-color");
    this.backgroundColorButton = this.$el.find(".m-background-color");
    this.colorPicker = this.$el.find(".article-editor-color-picker");
    this.colorPicker.append(this.viewColorPicker.render().$el);
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
      "click .m-small-font": "smallFont",
      "click .m-font-color": "fontColorPicker",
      "click .m-background-color": "backgroundColorPicker"
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
    var range = this.selectedRange;
    if (range) {
      var editor = this.editor;
      
      if (range.collapsed) {
        editor.html(editor.text());
      } else {
        var restoredSelection = this.restoreSelection(range);
        if (restoredSelection) {
          var range = restoredSelection.getRangeAt(0);
          var unformattedNode = document.createTextNode($(range.extractContents()).text());
          
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
        this.stripSubEmptyTags();
      }
    }
    console.log(this.editor.html());
  },
  
  
  bold: function(event) {
    var that = this;
    that.changeStyle("<strong></strong>", function(jQueryElement, vagueMatch) {
      return that.htmlTag(jQueryElement) === "strong";
    });
  },
  
  
  italic: function(event) {
    var that = this;
    that.changeStyle("<em></em>", function(jQueryElement, vagueMatch) {
      return that.htmlTag(jQueryElement) === "em";
    });
  },
  
  
  largeFont: function(event) {
    this.changeStyleWidthSpanTag("font-size", "1.42857em");
  },
  
  
  smallFont: function(event) {
    this.changeStyleWidthSpanTag("font-size", "0.7em");
  },
  
  
  fontColorPicker: function(event) {
    var colorPicker = this.colorPicker;
    var markSelected = true;
    if (this.fontColorPickerOn) {
      colorPicker.slideUp(500);
      markSelected = false;
    } else {
      this.restoreSelection(this.selectedRange);
      this.viewColorPicker.setColorPickHandler(this.changeFontColor);
      if (colorPicker.is(":hidden")) {
        colorPicker.slideDown(500);
      }
    }
    this.markColorPickerButton(this.fontColorButton, markSelected);
    this.fontColorPickerOn = markSelected;
  },
  
  
  changeFontColor: function(color) {
    this.changeStyleWidthSpanTag("color", color);
  },
  
  
  backgroundColorPicker: function(event) {
    var colorPicker = this.colorPicker;
    var markSelected = true;
    if (this.backgroundColorPickerOn) {
      colorPicker.slideUp(500);
      markSelected = false;
    } else {
      this.restoreSelection(this.selectedRange);
      this.viewColorPicker.setColorPickHandler(this.changeBackgroundColor);
      if (colorPicker.is(":hidden")) {
        colorPicker.slideDown(500);
      }
    }
    this.markColorPickerButton(this.backgroundColorButton, markSelected);
    this.backgroundColorPickerOn = markSelected;
  },
  
  
  changeBackgroundColor: function(color) {
    this.changeStyleWidthSpanTag("background-color", color);
  },
  
  
  markColorPickerButton: function(button, markSelected) {
    var fontColorButton = this.fontColorButton;
    var backgroundColorButton = this.backgroundColorButton;
    if (fontColorButton[0] === button[0]) {
      if (markSelected) {
        fontColorButton.css("opacity", 0.3);
      } else {
        fontColorButton.css("opacity", 1.0);
      }
      backgroundColorButton.css("opacity", 1.0);
      this.backgroundColorPickerOn = false;
    } else {
      if (markSelected) {
        backgroundColorButton.css("opacity", 0.3);
      } else {
        backgroundColorButton.css("opacity", 1.0);
      }
      fontColorButton.css("opacity", 1.0);
      this.fontColorPickerOn = false;
    }
  },
  
  
  changeStyleWidthSpanTag: function(styleType, styleValue) {
    var that = this;
    that.changeStyle("<span style=\"" + styleType + ":" + styleValue + "\"></span>", function(jQueryElement, vagueMatch) {
      if (that.htmlTag(jQueryElement) === "span") {
        var style = jQueryElement.attr("style");
        if (style) {
          if (vagueMatch) {
            var regExp = new RegExp('^' + styleType, "i");
            return style.match(regExp);
          } else {
            var regExp = new RegExp('^' + styleType + ":" + styleValue, "i");
            return style.match(regExp);
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
  },
  
  
  markSelectRange: function(selectRange, selectStartMark, selectEndMark) {
    selectRange.insertNode(selectStartMark[0]);
    selectRange.collapse(false);
    selectRange.insertNode(selectEndMark[0]);
    selectRange.setStartBefore(selectStartMark[0]);
  },
  
  
  restoreSelectRangeFromMarks: function(selectRange, selectStartMark, selectEndMark) {
    selectRange.setStartAfter(selectStartMark[0]);
    selectRange.setEndBefore(selectEndMark[0]);
    selectStartMark.remove();
    selectEndMark.remove();
  },
  
  
  styleOutFromAncestor: function(selectRange, selectStartMark, selectEndMark, rangeAncestor, htmlStyleWrapper) {
    if (rangeAncestor.find(selectStartMark).length > 0) {
      var rangeAncestorPositionMark = $("<span></span>");
      rangeAncestor.before(rangeAncestorPositionMark);
      rangeAncestor.detach();
      var temporaryContainer = $("<div></div>").append(rangeAncestor);
      selectRange.selectNode(rangeAncestor[0]);
      selectRange.setEndBefore(selectStartMark[0]);
      var beforeNode = $(selectRange.extractContents());
      selectRange.collapse(false);
      selectRange.setEndAfter(selectEndMark[0]);
      var selectedNode = $(htmlStyleWrapper).append(selectRange.extractContents());
      var afterNode = $(temporaryContainer.contents());
      rangeAncestorPositionMark.before(beforeNode);
      rangeAncestorPositionMark.before(selectedNode);
      rangeAncestorPositionMark.before(afterNode);
      rangeAncestorPositionMark.remove();
      return selectedNode;
    } else {
      selectRange.setStartBefore(selectStartMark[0]);
      selectRange.setEndAfter(selectEndMark[0]);
      var selectedNode = $(htmlStyleWrapper).append(selectRange.extractContents());
      selectRange.insertNode(selectedNode[0]);
      return selectedNode;
    }
  },
  
  
  changeStyle: function(htmlStyleWrapper, htmlStyleMatcher) {
    var range = this.selectedRange;
    if (range) {
      if (range.collapsed) {
        var editor = this.editor;
        var styledContents = $(htmlStyleWrapper).append(editor.contents());
        editor.html(styledContents);
        this.stripSubTags(styledContents.children(), htmlStyleMatcher);
      } else {
        var restoredSelection = this.restoreSelection(range);
        if (restoredSelection) {       
          var range = restoredSelection.getRangeAt(0);
          var rangeAncestor = $(range.commonAncestorContainer);
          var tagName = this.htmlTag(rangeAncestor);
          var needChange = true;
          var simplyAdd = true;
          while (tagName !== "pre") {
            if (htmlStyleMatcher(rangeAncestor, true)) {
              if (htmlStyleMatcher(rangeAncestor)) {
                needChange = false;
              } else {
                simplyAdd = false;
              }
              break;
            }
            rangeAncestor = rangeAncestor.parent();
            tagName = this.htmlTag(rangeAncestor);
          }
          
          if (needChange) {
            var selectStartMark = $("<span></span>");
            var selectEndMark = $("<span></span>");
            this.markSelectRange(range, selectStartMark, selectEndMark);
            
            var formattedNode = null;
            
            if (simplyAdd) {
              formattedNode = $(htmlStyleWrapper).append(range.extractContents());
              range.insertNode(formattedNode[0]);
            } else {   // has ancestor with the same type of style but not the same style
              var parent = rangeAncestor;
              var onlyChild = this.getOnlyChild(parent);
              while (onlyChild) {
                parent = onlyChild;
                onlyChild = this.getOnlyChild(parent);
              }
  
              if (parent[0] !== rangeAncestor[0]) {
                rangeAncestor.before(rangeAncestor.contents());
                if (parent[0].nodeType === 3) {   // a text node
                  parent.before(rangeAncestor);
                  rangeAncestor.append(parent);
                } else {
                  rangeAncestor.append(parent.contents());
                  parent.append(rangeAncestor);
                }
              }
              
              formattedNode = this.styleOutFromAncestor(range, selectStartMark, selectEndMark, rangeAncestor, htmlStyleWrapper);
            }
            
            var formattedNodeParent = formattedNode.parent();
            while (this.htmlTag(formattedNodeParent) !== "pre") {
              if (this.getOnlyChild(formattedNodeParent)) {
                formattedNode = formattedNodeParent;
                formattedNodeParent = formattedNode.parent();
              } else {
                break;
              }
            }
            
            var formattedNodePosition = $("<span></span>");
            formattedNode.before(formattedNodePosition);
            formattedNode = $(htmlStyleWrapper).append(formattedNode);
            formattedNodePosition.before(formattedNode);
            formattedNodePosition.remove();
            
            formattedNode.prepend(selectStartMark);   // avoid "selectStartMark" and "selectEndMark" to get removed in "stripSubTags"
            formattedNode.append(selectEndMark);
            
            this.mergeAdjoinNode(formattedNode, range, true, htmlStyleMatcher);
            this.mergeAdjoinNode(formattedNode, range, false, htmlStyleMatcher);
            
            this.stripSubTags(formattedNode.children(), htmlStyleMatcher);
            
            this.restoreSelectRangeFromMarks(range, selectStartMark, selectEndMark);
            this.restoreSelection(range);
          }
        }
      }
    }
    this.stripSubEmptyTags();
    console.log(this.editor.html());
  },
  
  
  htmlTag: function(jQueryElement) {
    return (jQueryElement.prop("tagName") || "").toLowerCase();
  },
  
  
  getOnlyChild: function(jQueryElement) {
    var children = jQueryElement.contents();

    if (children.length > 0) {
      var childrenCount = children.length;
      var realChildCount = 0;
      var realChildIndex = 0;
      for(var index = 0; index < childrenCount; ++index) {
        var child = $(children[index]);
        if (child.text().length > 0) {
          ++realChildCount;
          realChildIndex = index;
        }
      }
      
      if (realChildCount === 1) {
        return $(children[realChildIndex]);
      } else {
        return null;
      }
    }
  },
  
  
  mergeAdjoinNode: function(currentNode, selectedRange, isPreviousNode, htmlStyleMatcher) {
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

        var onlyChild = this.getOnlyChild($("<div></div>").append(selectedRange.cloneContents()));
        while (onlyChild) {
          if (htmlStyleMatcher(onlyChild)) {
            merge = true;
            break;
          }
          onlyChild = this.getOnlyChild(onlyChild);
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
  
  
  stripSubTags: function(subElements, htmlStyleMatcher) {
    var children = subElements;
    var childrenLength = children.length;
    for (var index = 0; index < childrenLength; ++index) {
      var child = $(children[index]);
      this.stripSubTags(child.children(), htmlStyleMatcher);
      if (htmlStyleMatcher(child, true)) {
        child.before(child.html());
        child.remove();
      }
    }
  },
  
  
  stripSubEmptyTags: function() {
    this.stripSubTags(this.editor, function(jQueryElement, vagueMatch) {
      return jQueryElement.text().length === 0;
    });
  },
  
  
  // returns "range"
  saveSelection: function() {
    if (window.getSelection) {
      var selection = window.getSelection();
      if (selection.rangeCount > 0) {
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
  },
  
  
  removeHelper: function() {
    this.viewColorPicker.remove();
  }
});
