export const setBreadCrumbsFromMatch = (pathname, titles = {}) => {
  const path = pathname.split("/").slice(1);
  if (path && path.length) {
    let result =
      '<li class="breadcrumb-item"><a href="/" class="text-primary"><i class="fa fa-home"></i></a></li>';
    let url = "";
    let title = "";
    path.forEach((p) => {
      url += "/" + p;
      title = p;
      if (p in titles) {
        title = titles[p];
      }
      result +=
        '<li class="breadcrumb-item"><a href="' +
        url +
        '" class="text-primary">' +
        title.charAt(0).toUpperCase() +
        title.slice(1) +
        "</a></li>";
    });
    const elem = document.getElementById("workspace-breadcrumbs");
    if (elem) {
      elem.classList.remove("hidden");
      elem.innerHTML = result;
    }
  }
};
