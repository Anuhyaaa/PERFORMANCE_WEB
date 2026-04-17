
const gulp = require('gulp');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const browsersync = require('browser-sync');
const del = require('del');


const paths = {
  src: {
    html: ['*.html'],
    css: ['style.css'],
    js: ['*.js', '!gulpfile.js'],
    images: ['images*'],
    root: [
      'about.html',
      'app.html',
      'distance.html',
      'index.html',
      'nutrition.html',
      'profile.html',
      'progress.html',
      'quotes.html',
      'settings.html',
      'steps.html',
      'water.html',
      'weekly.html'
    ]
  },
  dist: './dist'
};


const clean = () => del([paths.dist]);


const css = () => {
  return gulp
    .src(paths.src.css)
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(`${paths.dist}/css`))
    .pipe(browsersync.stream());
};


const javascript = () => {
  return gulp
    .src(paths.src.js)
    .pipe(
      babel({
        presets: ['@babel/preset-env']
      })
    )
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(`${paths.dist}/js`))
    .pipe(browsersync.stream());
};


const html = () => {
  return gulp
    .src(paths.src.html)
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true
      })
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist))
    .pipe(browsersync.stream());
};

const images = () => {
  return gulp
    .src(paths.src.images)
    .pipe(
      imagemin([
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest(`${paths.dist}/images`));
};

const serve = (done) => {
  browsersync.init({
    server: {
      baseDir: paths.dist
    },
    notify: true,
    online: true,
    port: 3000
  });
  done();
};

const reload = (done) => {
  browsersync.reload();
  done();
};


const watch = () => {
  gulp.watch(paths.src.html, gulp.series(html, reload));
  gulp.watch(paths.src.css, css);
  gulp.watch(paths.src.js, gulp.series(javascript, reload));
  gulp.watch(paths.src.images, gulp.series(images, reload));
};


const developement = gulp.series(
  clean,
  gulp.parallel(html, css, javascript, images),
  serve,
  watch
);

const build = gulp.series(
  clean,
  gulp.parallel(html, css, javascript, images)
);


exports.default = developement;
exports.build = build;
exports.clean = clean;
exports.css = css;
exports.js = javascript;
exports.html = html;
exports.images = images;
exports.watch = watch;
