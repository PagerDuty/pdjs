const path = require('path');

const baseConfig = {
  entry: './src/index.ts',
  devtool: 'source-map',
  output: {
    filename: 'pdjs.js',
    library: 'PagerDuty',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};

module.exports = [
  {
    ...baseConfig,
    output: {
      ...baseConfig.output,
      filename: 'pdjs-legacy.js',
    },
  },
  {
    ...baseConfig,
    module: {
      ...baseConfig.module,
      rules: [
        ...baseConfig.module.rules,
        {
          test: /\.[jt]sx?$/,
          enforce: 'pre',
          exclude: /(node_modules|\.spec\.js)/,
          use: [
            {
              loader: 'webpack-strip-block',
              options: {
                start: 'NODE-ONLY-START',
                end: 'NODE-ONLY-END',
              },
            },
          ],
        },
      ],
    },
  },
];
