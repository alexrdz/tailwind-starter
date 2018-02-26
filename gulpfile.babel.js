import gulp from 'gulp';
import postcss from 'gulp-postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import purgecss from 'gulp-purgecss';
import plumber from 'gulp-plumber';
import browserSync from 'browser-sync';
const reload = browserSync.reload;


class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:\/]+/g) || [];
  }
}


const PATHS = {
  css: './src/css/**/*',
  config: './src/tailwind.js',
  cssDist: './dist/css',
  dist: './dist',
  views: './src/views/**/*'
};


gulp.task('css', () => {
  return gulp.src(PATHS.css)
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
    .pipe(gulp.dest(PATHS.cssDist))
    .pipe(reload({stream:true}));
});

gulp.task('views', () => {
  return gulp.src(PATHS.views)
    .pipe(plumber())
    .pipe(gulp.dest('./dist/'))
    .pipe(reload({stream:true}));
});




gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: './'
    }      
  });
});

gulp.task('bs-reload', () => {
  browserSync.reload();
});

gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });
});


// gulp.task("serve", ["css"], function() {
//   browserSync.init({
//     server: "./",
//     notify: false,
//     open: false
//   });
//   gulp.watch([PATHS.css, PATHS.config], ["css"]);
//   gulp.watch(PATHS.dist + "*.html").on("change", browserSync.reload);
// });

gulp.task('default', ['css', 'views', 'serve'], () => {
  gulp.watch([PATHS.views], ['views', 'bs-reload']);
  gulp.watch([PATHS.css], ['css', 'bs-reload']);
});