const IconUtil = {
  //TODO somehow also allow recipes to override icons?
  getAnnotationTemplateIcon(template, border, muted, interactive) {
    let iconClass = "fas fa-question";
    if (template === "av" || template === "video") {
      iconClass = "fas fa-film";
    } else if (template === "audio") {
      iconClass = "fas fa-signal";
    } else if (template === "artwork") {
      iconClass = "fas fa-paint-brush";
    } else if (template === "link") {
      iconClass = "fas fa-link";
    } else if (template === "image") {
      iconClass = "far fa-image";
    } else if (template === "article" || template === "text") {
      iconClass = "far fa-file-alt";
    } else if (template === "person") {
      iconClass = "fas fa-user-circle";
    }
    return IconUtil.__addExtraStyling(iconClass, border, muted, interactive);
  },

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

  getUserActionIcon(action, border, muted, interactive) {
    let iconClass = "fas fa-question";
    if (action.indexOf("save") !== -1) {
      iconClass = "fas fa-save";
    } else if (action.indexOf("remove") !== -1) {
      iconClass = "fas fa-times";
    } else if (action.indexOf("add") !== -1) {
      iconClass = "fas fa-plus";
    } else if (action.indexOf("annotate") !== -1) {
      iconClass = "fas fa-sticky-note";
    } else if (action.indexOf("next") !== -1) {
      iconClass = "fas fa-caret-right";
    } else if (action.indexOf("previous") !== -1) {
      iconClass = "fas fa-caret-left";
    } else if (action.indexOf("play") !== -1) {
      iconClass = "fas fa-play";
    } else if (action.indexOf("comment") !== -1) {
      iconClass = "fas fa-comment";
    } else if (action.indexOf("link") !== -1) {
      iconClass = "fas fa-link";
    } else if (action.indexOf("classification") !== -1) {
      iconClass = "fas fa-tag";
    } else if (action.indexOf("metadata") !== -1) {
      iconClass = "fas fa-sticky-note";
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
