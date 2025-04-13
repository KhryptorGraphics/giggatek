/**
 * Webpack configuration for GigGatek frontend
 */

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

  // Entry points for different pages
  entry: {
    main: './js/main.js',
    cart: './js/cart.js',
    checkout: './js/checkout.js',
    dashboard: './js/dashboard.js',
    product: './js/product.js',
    auth: './js/auth.js',
    wishlist: './js/wishlist.js',
    notifications: './js/notifications.js',
    'stripe-integration': './js/stripe-integration.js',
    pwa: './js/pwa.js',
    i18n: './js/i18n.js',
    'form-validation': './js/form-validation.js',
    app: './js/app.js'
  },

  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].bundle.js',
    clean: true
  },

  // Module rules for processing different file types
  module: {
    rules: [
      // JavaScript files
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },

      // CSS files
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },

  // Plugins
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].bundle.css'
    })
  ],

  // Optimization
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false
          },
          compress: {
            drop_console: process.env.NODE_ENV === 'production'
          }
        },
        extractComments: false
      })
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },

  // Development server
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map'
};
