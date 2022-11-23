const getBundleConfig = minimize => ({
  mode: 'production',
  entry: ['./src/index.js'],
  output: {
    path: __dirname,
    filename: `./bundle/umd/moysklad${minimize ? '.min' : ''}.js`,
    library: {
      name: 'MoyskladClient',
      type: 'window'
    }
  },
  optimization: {
    minimize
  },
  target: 'web'
})

module.exports = [getBundleConfig(false), getBundleConfig(true)]
