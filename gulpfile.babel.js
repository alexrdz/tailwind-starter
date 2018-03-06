import gulp from 'gulp';
import postcss from 'gulp-postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import purgecss from 'gulp-purgecss';
import sourcemaps from 'gulp-sourcemaps';
import cleanCSS from 'gulp-clean-css';
import plumber from 'gulp-plumber';
import browserSync from 'browser-sync';

const reload = browserSync.reload;
const PATHS = {
  assets: './src/assets',
  css: './src/css/**/*',
  config: './src/tailwind.js',
  cssDist: './dist/css',
  dist: './dist',
  views: './src/views/**/*',
};

class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:\/]+/g) || [];
  }
}

gulp.task('css', () => {
  return gulp.src(PATHS.css)
    .pipe(plumber())
    .pipe(postcss([
      tailwindcss(PATHS.config),
      autoprefixer
    ]))
    .pipe(gulp.dest(PATHS.cssDist))
    .pipe(reload({stream:true}));
});

gulp.task('build-css', () => {
  return gulp.src(PATHS.css)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(postcss([
      tailwindcss(PATHS.config),
      autoprefixer
    ]))
    .pipe(purgecss({
      content: [`${PATHS.dist}**/*.html`],
      extractors: [
        {
          extractor: TailwindExtractor,
          extensions: ["html", "js"]
        }
      ]
    }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(PATHS.cssDist))
    .pipe(reload({stream:true}));
});

gulp.task('views', () => {
  return gulp.src(PATHS.views)
    .pipe(plumber())
    .pipe(gulp.dest(PATHS.dist))
    .pipe(reload({stream:true}));
});

gulp.task('assets', () => {
  return gulp.src(`${PATHS.assets}/**/*`)
    .pipe(plumber())
    .pipe(gulp.dest(`${PATHS.dist}/assets`))
    /* Reload the browser CSS after every change */
    .pipe(reload({stream:true}));
});

gulp.task('bs-reload', () => {
  browserSync.reload();
});

gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: PATHS.dist
    }
  });
});

gulp.task('build', ['build-css', 'views', 'assets']);

gulp.task('default', ['css', 'views', 'assets', 'serve'], () => {
  gulp.watch([PATHS.views], ['views', 'bs-reload']);
  gulp.watch([PATHS.css], ['css', 'bs-reload']);
  gulp.watch([PATHS.css], ['assets', 'bs-reload']);
});