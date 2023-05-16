const IconUtil = {

  getMimeTypeIcon(mimeType, border, muted, interactive) {
    let iconClass = "";
    if (mimeType) {
      if (mimeType.indexOf("video") !== -1) {
        iconClass = "fas fa-film";
      } else if (mimeType.indexOf("audio") !== -1) {
        iconClass = "fas fa-headphones";
      } else if (mimeType.indexOf("image") !== -1) {
        iconClass = "far fa-image";
      } else if (mimeType.indexOf("fragment") !== -1) {
        iconClass = "fas fa-puzzle-piece";
      } else if (mimeType.indexOf("text") !== -1) {
        iconClass = "far fa-file-alt";
      }
    }
    return IconUtil.__addExtraStyling(iconClass, border, muted, interactive);
  },

  getMediaObjectAccessIcon(present, interalAccess, border, muted, interactive) {
    let iconClass = "";
    if (present) {
      iconClass = interalAccess ? "fas fa-eye" : "fas fa-link";
    } else {
      iconClass = "fas fa-eye-slash";
    }
    return IconUtil.__addExtraStyling(iconClass, border, muted, interactive);
  },

  __addExtraStyling(iconClass, border, muted, interactive) {
    if (border) {
      iconClass += " fa-border";
    }
    if (muted) {
      iconClass += " text-muted";
    }
    if (interactive) {
      iconClass += " interactive";
    }
    return iconClass;
  },
};

export default IconUtil;
