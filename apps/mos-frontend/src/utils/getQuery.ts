const getQuery = (key: string): any => {
  const query = window.location.hash.split('?')[1]
    ? window.location.hash.split('?')[1].split('&')
    : [];
  for (let i = 0; i < query.length; i++) {
    const ks = query[i].split('=');
    if (ks[0] === key) return ks[1];
  }
  return false;
};

const getSearch = (key: string): any => {
  const query = window.location.search.split('?')[1]
    ? window.location.search.split('?')[1].split('&')
    : [];
  for (let i = 0; i < query.length; i++) {
    const ks = query[i].split('=');
    if (ks[0] === key) return ks[1];
  }
  return false;
};

export { getSearch };

export default getQuery;