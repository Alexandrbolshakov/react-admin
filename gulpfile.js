import { task, src, dest, watch as _watch, parallel } from "gulp";
import webpack from "webpack-stream";
import sass, { logError } from "gulp-sass";
import autoprefixer from "autoprefixer";
const cleanCSS = require('gulp-clean-css');
import postcss from "gulp-postcss";


const dist = "C:/Users/Александр/Downloads/OSPanel/domains/react-admin/admin";
const prod = "./build/";

task("copy-html", () => {
    return src("./app/src/index.html")
                .pipe(dest(dist));
});

task("build-js", () => {
    return src("./app/src/main.js")
                .pipe(webpack({
                    mode: 'development',
                    output: {
                        filename: 'script.js'
                    },
                    watch: false,
                    devtool: "source-map",
                    module: {
                        rules: [
                          {
                            test: /\.m?js$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                              loader: 'babel-loader',
                              options: {
                                presets: [['@babel/preset-env', {
                                    debug: true,
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }],
                                 "@babel/react"]
                              }
                            }
                          }
                        ]
                      }
                }))
                .pipe(dest(dist));
});

task("build-sass", () => {
    return src("./app/scss/style.scss")
                .pipe(sass().on('error', logError))
                .pipe(dest(dist));
});

task("copy-api", () => {
  src("./app/api/**/.*")
                .pipe(dest(dist + "/api"));
    return src("./app/api/**/*.*")
                .pipe(dest(dist + "/api"));
});

task("copy-assets", () => {
    return src("./app/assets/**/*.*")
                .pipe(dest(dist + "/assets"));
});

task("watch", () => {
    _watch("./app/src/index.html", parallel("copy-html"));
    _watch("./app/assets/**/*.*", parallel("copy-assets"));
    _watch("./app/api/**/*.*", parallel("copy-api"));
    _watch("./app/scss/**/*.scss", parallel("build-sass"));
    _watch("./app/src/**/*.js", parallel("build-js"));
});

task("build", parallel("copy-html", "copy-assets", "copy-api", "build-sass", "build-js"));

task("prod", () => {
  src("./app/src/index.html")
      .pipe(dest(prod));
  src("./app/api/**/.*")
      .pipe(dest(prod + "/api"));
  src("./app/api/**/*.*")
      .pipe(dest(prod + "/api"));
  src("./app/assets/**/*.*")
      .pipe(dest(prod + "/assets"));

  src("./app/src/main.js")
      .pipe(webpack({
          mode: 'production',
          output: {
              filename: 'script.js'
          },
          module: {
              rules: [
                {
                  test: /\.m?js$/,
                  exclude: /(node_modules|bower_components)/,
                  use: {
                    loader: 'babel-loader',
                    options: {
                      presets: [['@babel/preset-env', {
                          debug: false,
                          corejs: 3,
                          useBuiltIns: "usage"
                      }],
                       "@babel/react"]
                    }
                  }
                }
              ]
            }
      }))
      .pipe(dest(prod));
  
  return src("./app/scss/style.scss")
      .pipe(sass().on('error', logError))
      .pipe(postcss([autoprefixer()]))
      .pipe(cleanCSS())
      .pipe(dest(prod));
});

task("default", parallel("watch", "build"));