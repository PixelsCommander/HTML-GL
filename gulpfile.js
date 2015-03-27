var BUNDLE_NAME = 'htmlgl',
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs');

gulp.task('default', function() {
    gulp.src(['bower_components/promise-polyfill/Promise.min.js', 'bower_components/webcomponents.js/CustomElements.min.js', 'bower_components/pixi/bin/pixi.js', 'demo/js/vendor/html2canvas.js', 'demo/js/vendor/velocity.js', 'src/util.js', 'src/gl-element-resolver.js', 'src/gl-context.js','src/images-loaded.js' , 'src/gl-element.js'])
        .pipe(concat(BUNDLE_NAME + '.js'))
        .pipe(gulp.dest('dist'))
        .pipe(uglify(BUNDLE_NAME + '.min.js'))
        .pipe(gulp.dest('dist'))
});