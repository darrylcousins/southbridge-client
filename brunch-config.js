// See http://brunch.io for documentation.
exports.files = {
  javascripts: {
    joinTo: {
      'app.js': /^app/,
      'vendor.js': /^(?!app)/
    }
  },
  stylesheets: {
    joinTo: {
      'app.css': /^app/,
      'vendor.css': /^node_modules/
    }
  }
};

exports.paths = {
  public: "./theme/assets"
};

exports.npm = {
  styles: {
    tachyons: ['css/tachyons.css']
  }
};

exports.plugins = {
  babel: {
    babelrc: true
  },
  sass: {
    options: {
      includePaths: [
        'app/styles', 'node_modules/'
      ]
    }
  }
};
