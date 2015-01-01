var GlobalFormater = {
  LocalDate: {
    Chinese: function(millisecondsSinceEpoch) {
      return (new Date(millisecondsSinceEpoch)).toLocaleDateString("zh-Hans-CN");
    }
  }
};