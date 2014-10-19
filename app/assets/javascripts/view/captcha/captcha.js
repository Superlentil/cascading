View.Captcha = Backbone.View.extend({
  initialize: function(options) {
    totalTokenCount = 4;
    correctTokenCount = 1;
    if (options) {
      if (options.totalTokenCount) {
        totalTokenCount = options.totalTokenCount;
      }
      if (options.correctTokenCount) {
        correctTokenCount = options.correctTokenCount;
      }
    }
    this.totalTokenCount = totalTokenCount;
    this.correctTokenCount = correctTokenCount;
    this.totalToken = [];
    this.correctToken = [];
    this.correctTokenPicked = [];
    this.secretKey = 0;
    this.passCaptcha = false;
    
    this.CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.DOTS = [
      ['   *   ', '  * *  ', '  * *  ', ' *   * ', ' ***** ', '*     *', '*     *'],
      ['****** ', '*     *', '*     *', '****** ', '*     *', '*     *', '****** '],
      [' ***** ', '*     *', '*      ', '*      ', '*      ', '*     *', ' ***** '],
      ['****** ', '*     *', '*     *', '*     *', '*     *', '*     *', '****** '],
      ['*******', '*      ', '*      ', '****   ', '*      ', '*      ', '*******'],
      ['*******', '*      ', '*      ', '****   ', '*      ', '*      ', '*      '],
      [' ***** ', '*     *', '*      ', '*      ', '*   ***', '*     *', ' ***** '],
      ['*     *', '*     *', '*     *', '*******', '*     *', '*     *', '*     *'],
      ['*******', '   *   ', '   *   ', '   *   ', '   *   ', '   *   ', '*******'],
      ['      *', '      *', '      *', '      *', '      *', '*     *', ' ***** '],
      ['*     *', '*   ** ', '* **   ', '**     ', '* **   ', '*   ** ', '*     *'],
      ['*      ', '*      ', '*      ', '*      ', '*      ', '*      ', '*******'],
      ['*     *', '**   **', '* * * *', '*  *  *', '*     *', '*     *', '*     *'],
      ['*     *', '**    *', '* *   *', '*  *  *', '*   * *', '*    **', '*     *'],
      [' ***** ', '*     *', '*     *', '*     *', '*     *', '*     *', ' ***** '],
      ['****** ', '*     *', '*     *', '****** ', '*      ', '*      ', '*      '],
      [' ***** ', '*     *', '*     *', '*     *', '*   * *', '*    * ', ' **** *'],
      ['****** ', '*     *', '*     *', '****** ', '*   *  ', '*    * ', '*     *'],
      [' ***** ', '*     *', '*      ', ' ***** ', '      *', '*     *', ' ***** '],
      ['*******', '   *   ', '   *   ', '   *   ', '   *   ', '   *   ', '   *   '],
      ['*     *', '*     *', '*     *', '*     *', '*     *', '*     *', ' ***** '],
      ['*     *', '*     *', ' *   * ', ' *   * ', '  * *  ', '  * *  ', '   *   '],
      ['*     *', '*     *', '*     *', '*  *  *', '* * * *', '**   **', '*     *'],
      ['*     *', ' *   * ', '  * *  ', '   *   ', '  * *  ', ' *   * ', '*     *'],
      ['*     *', ' *   * ', '  * *  ', '   *   ', '   *   ', '   *   ', '   *   '],
      ['*******', '     * ', '    *  ', '   *   ', '  *    ', ' *     ', '*******']
    ];
    
/* 0 ~ 9
    [
      ['  ***  ', ' *   * ', '*   * *', '*  *  *', '* *   *', ' *   * ', '  ***  '],
      ['   *   ', '  **   ', ' * *   ', '   *   ', '   *   ', '   *   ', '*******'],
      [' ***** ', '*     *', '      *', '     * ', '   **  ', ' **    ', '*******'],
      [' ***** ', '*     *', '      *', '    ** ', '      *', '*     *', ' ***** '],
      ['    *  ', '   **  ', '  * *  ', ' *  *  ', '*******', '    *  ', '    *  '],
      ['*******', '*      ', '****** ', '      *', '      *', '*     *', ' ***** '],
      ['  **** ', ' *     ', '*      ', '****** ', '*     *', '*     *', ' ***** '],
      ['*******', '     * ', '    *  ', '   *   ', '  *    ', ' *     ', '*      '],
      [' ***** ', '*     *', '*     *', ' ***** ', '*     *', '*     *', ' ***** '],
      [' ***** ', '*     *', '*     *', ' ******', '      *', '     * ', ' ****  ']
    ];
*/
  },
  
  
  tagName: "div",
  className: "captcha-container",
  
  
  render: function() {
    this.pickTokens();
    
    var correctTokenHtml = "<div><p class='captcha-description'>Please pick out the letter: &#160; ";
    for (var index in this.correctToken) {
      correctTokenHtml += "<strong><big> " + this.CHARS.charAt(this.correctToken[index]) + " </big></strong>";
    }
    correctTokenHtml += "</p></div>";
    
    var captchaElementWidthPercentage = 100.0 / this.totalTokenCount - 0.000001;
    var totalTokenHtml = "<div class='captcha-container'>";
    for (var index in this.totalToken) {
      totalTokenHtml += "<div class='captcha-challenge' style='width: " + captchaElementWidthPercentage + "%;'>" + this.dotCaptcha(this.totalToken[index]) + "</div>";
    }
    totalTokenHtml += "</div>";
    
    this.$el.html(correctTokenHtml + totalTokenHtml);
    
    $(function() {
      $(".captcha-challenge").show(1000); 
    });
    
    return this;
  },
  
  
  noiseString: function(length) {
    var noiseStr = "";
    for (var index = 0; index < length; ++ index) {
      if (Math.floor(Math.random() * 5) > 0) {
        noiseStr += " ";
      } else {
        noiseStr += "*";
      }
    }
    return noiseStr;
  },
  
  
  complicateDot: function(dotIndex) {
    var dot = this.DOTS[dotIndex].slice(0);   // copy value
    
    var horizontalNoiseLineCount = 0;
    var verticalNoiseLineCount = 0;
    var noiseLineDirection = Math.floor(Math.random() * 2);
    if (noiseLineDirection === 0) {
      ++horizontalNoiseLineCount;
    } else {
      ++verticalNoiseLineCount;
    }
    
    var dotWidth = dot[0].length;
    var dotHeight = dot.length;
    var topMargin = Math.floor(Math.random() * (dotHeight + 1 - horizontalNoiseLineCount));
    var bottomMargin = dotHeight - horizontalNoiseLineCount - topMargin;
    var leftMargin = Math.floor(Math.random() * (dotWidth + 1 - verticalNoiseLineCount));
    var rightMargin = dotWidth - verticalNoiseLineCount - leftMargin;
    
    if (horizontalNoiseLineCount > 0) {
      var noiseLine = "";
      for (var index = 0; index < dotWidth; ++index) {
        noiseLine += " ";
      }
      var noiseLinePosition = Math.floor(Math.random() * (dotHeight - 1)) + 1;
      dot.splice(noiseLinePosition, 0, noiseLine);
      dotHeight = dot.length;
    }
    
    if (verticalNoiseLineCount > 0) {
      var noiseLinePosition = Math.floor(Math.random() * (dotWidth - 1)) + 1;
      for (var index = 0; index < dotHeight; ++index) {
        var originalLine = dot[index];
        dot[index] = originalLine.substring(0, noiseLinePosition) + " " + originalLine.substring(noiseLinePosition);
      }
      dotWidth = dot[0].length;
    }
    
    var emptyLine = this.noiseString(dotWidth).replace(/\*/g, " ");
    var topMarginDot = [];
    for (var index = 0; index < topMargin; ++index) {
      topMarginDot.push(this.noiseString(dotWidth));
    }
    topMarginDot.push(emptyLine);
    dot = topMarginDot.concat(dot);
    
    dot.push(emptyLine);
    for (var index = 0; index < bottomMargin; ++index) {
      dot.push(this.noiseString(dotWidth));
    }
    
    dotHeight = dot.length;
    for (var index = 0; index < dotHeight; ++index) {
      dot[index] = this.noiseString(leftMargin) + " " + dot[index] + " " + this.noiseString(rightMargin);
    }
    
    return dot;
  },
  
  
  dotCaptcha: function(dotIndex) {
    var dot = this.complicateDot(dotIndex);
    var lineCount = dot.length;
    var elementId = dotIndex + this.secretKey;
    var dotCaptchaHtml = "<div class='captcha-element' data-element-id='" + elementId + "'><div class='captcha-element-text'>";
    for (var index = 0; index < lineCount; ++index) {
      dotCaptchaHtml += dot[index].replace(/ /g, "&#160;") + "&#160;&#160;<br>";
    }
    dotCaptchaHtml += "</div></div>";
    return dotCaptchaHtml;
  },
  
  
  pickTokens: function() {
    var totalToken = this.randomSubset(this.DOTS.length, this.totalTokenCount);
    var correctTokenIndex = this.randomSubset(totalToken.length, this.correctTokenCount);
    var correctToken = [];
    var correctTokenPicked = [];
    for (var index in correctTokenIndex) {
      correctToken.push(totalToken[correctTokenIndex[index]]);
      correctTokenPicked.push(false);
    }
    this.passCaptcha = false;
    this.totalToken = totalToken;
    this.correctToken = correctToken;
    this.correctTokenPicked = correctTokenPicked;
    this.secretKey = Math.floor(Math.random() * 1000000);
  },
  
  
  randomSubset: function(setLength, subsetLength) {
    var subset = [];
    var count = subsetLength;
    while (count > 0) {
      var randomIndex = Math.floor(Math.random() * setLength);
      var available = true;
      for (var index in subset) {
        if (subset[index] === randomIndex) {
          available = false;
          break;
        }
      }
      if (available) {
        subset.push(randomIndex);
        --count;
      }
    }
    return subset;
  },
  
  
  events: {
    "click .captcha-element": "validatePick"
  },
  
  
  validatePick: function(event) {    
    var captchaElement = $(event.currentTarget);
    var elementId = parseInt(captchaElement.data("elementId")) - this.secretKey;
    
    var correctToken = this.correctToken;
    var correctTokenPicked = this.correctTokenPicked;
    var pickedCorrectly = false;
    var passCaptcha = true;
    for (var index in correctToken) {
      if (correctToken[index] === elementId) {
        pickedCorrectly = true;
        if (!correctTokenPicked[index]) {
          correctTokenPicked[index] = true;
          captchaElement.addClass("captcha-correct-pick");
        }
      }
      passCaptcha &= correctTokenPicked[index];
    }
    this.passCaptcha = passCaptcha;
    if (!pickedCorrectly) {
      event.stopImmediatePropagation();
      var that = this;
      that.$el.find(".captcha-description").html("<strong><big>Incorrect and please try again ...</big></strong>");
      that.$el.append("<div class='captcha-incorrect-pick'></div>");
      setTimeout(function(){
        that.render();
        that.$el.trigger("click");   // keep propagate "click" event.
      }, 500);
    }
  },
  
  
  hasPassedCaptcha: function() {
    return this.passCaptcha;
  }
});