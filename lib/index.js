module.exports = function (bundler) {
  bundler.addAssetType('md', require.resolve('./asset.js'))
}
