module.exports = function sitemapFilter(collection) {
  // Only include Home, Services, and Contact Us
  return collection.filter(item => {
    const url = item.url;
    return url === '/' || url === '/services/' || url === '/contact/';
  });
};
