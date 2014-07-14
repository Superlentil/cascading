// define the helper "Editor" 
Articles.Helpers.Editor = {
  toContentHTML: function(articleContentJSON) {
    var articleContent = JSON.parse(articleContentJSON);
    var articleHtml = "<div>";
    $.each(articleContent, function(index, articleParagraph) {
      articleHtml += "<pre>" + articleParagraph.src + "</pre>";
    });
    articleHtml += "</div>";
    return articleHtml;
  }
};
