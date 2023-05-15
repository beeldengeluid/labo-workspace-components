// From: https://stackoverflow.com/questions/39245488/event-path-is-undefined-running-in-firefox/45061945#45061945
export const getEventPath = (evt) => {
  const path = (evt.composedPath && evt.composedPath()) || evt.path;
  const target = evt.target;

  if (path !== null) {
    // Safari doesn't include Window, but it should.
    return path.indexOf(window) < 0 ? path.concat(window) : path;
  }

  if (target === window) {
    return [window];
  }

  const getParents = (node, memo = null) => {
    memo = memo || [];
    let parentNode = node.parentNode;

    if (!parentNode) {
      return memo;
    } else {
      return getParents(parentNode, memo.concat(parentNode));
    }
  };
  return [target].concat(getParents(target), window);
};
