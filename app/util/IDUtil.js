const IDUtil = {
  //generates a guid from nothing
  guid: function () {
    return (
      IDUtil.__s4() +
      IDUtil.__s4() +
      "-" +
      IDUtil.__s4() +
      "-" +
      IDUtil.__s4() +
      "-" +
      IDUtil.__s4() +
      "-" +
      IDUtil.__s4() +
      IDUtil.__s4() +
      IDUtil.__s4()
    );
  },

  //only used by the guid function
  __s4: function () {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  },

  //all component specific class names should be generated with this function
  //class names consist of: bg__[component-prefix]__[semantically-intelligble-component-attribute]
  cssClassName: function (componentAttribute, componentPrefix) {
    if (componentPrefix) {
      return "bg__" + componentPrefix + "__" + componentAttribute;
    }
    return "bg__" + componentAttribute;
  },
};

export default IDUtil;
