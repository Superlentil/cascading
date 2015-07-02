var ModelHelper = {
  multipartFormSubmit: function(formData, callbacks, method, url) {
    method = method || "POST";
    url = url || (this.urlRoot || "");
    
    if (!callbacks) {
      callbacks = {
        progress: function(event) {},
        beforeSend: function(jqXHR, settings) {},
        success: function(data, textStatus, jqXHR) {},
        error: function(jqXHR, textStatus, errorThrown) {},
        complete: function(jqXHR, textStatus ) {} 
      };
    }
    
    $.ajax({
      url: url,  //Server script to process data
      type: method,
      dataType: "json",
      xhr: function() {  // Custom XMLHttpRequest
        var customizedXhr = $.ajaxSettings.xhr();
        if(customizedXhr.upload){ // Check if upload property exists
          customizedXhr.upload.addEventListener('progress',callbacks.progress, false); // For handling the progress of the upload
        }
        return customizedXhr;
      },
      //Ajax events
      beforeSend: callbacks.beforeSend,
      success: callbacks.success,
      error: callbacks.error,
      complete: callbacks.complete,
      // Form data
      data: formData,
      //Options to tell jQuery not to process data or worry about content-type.
      cache: false,
      contentType: false,
      processData: false
    });
  }
};
