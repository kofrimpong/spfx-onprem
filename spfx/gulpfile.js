'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');
build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

/* suppress warning in prod build */
const argv = build.rig.getYargs().argv;
const isProductionBundle = argv._.indexOf('bundle') !== -1 && (argv.ship || argv.production || argv.p);

if (isProductionBundle) {
  // build.addSuppression(/Warning - \[sass\] The local CSS class/gi);
  // OR
   build.addSuppression(/Warning/gi);
}

build.tslint.enabled = false;
build.sass.enabled = false;

const externalsFolder = "external";
const copyStaticFilesSubtask = build.subTask('copy-static-files', function (gulp, buildOptions, done) {
  this.log('Copying static files...');

  gulp.src(`../${externalsFolder}/dist/*.{png,jpg,svg,gif,woff,eot,ttf}`)
  .pipe(gulp.dest("./dist"))
  .pipe(gulp.dest("./temp/deploy"));

  done();
});
build.rig.addPostBuildTask(copyStaticFilesSubtask);

/* deploy azure */
let syncVersionsSubtask = build.subTask('version-sync', function (gulp, buildOptions, done) {
  const fs = require("fs");
  this.log('Synching versions');

  // import gulp utilits to write error messages
  const gutil = require('gulp-util');

  // read package.json
  var pkgConfig = require('./package.json');

  // read configuration of web part solution file
  var pkgSolution = require('./config/package-solution.json');

  // log old version
  this.log('package-solution.json version:\t' + pkgSolution.solution.version);

  // Generate new MS compliant version number
  var newVersionNumber = pkgConfig.version.split('-')[0] + '.0';

  if (pkgSolution.solution.version !== newVersionNumber) {
    // assign newly generated version number to web part version
    pkgSolution.solution.version = newVersionNumber;

    // log new version
    this.log('New package-solution.json version:\t' + pkgSolution.solution.version);

    // write changed package-solution file
    fs.writeFile('./config/package-solution.json', JSON.stringify(pkgSolution, null, 4), function (err, result) {
      if (err) this.log('error', err);
    });
  }
  else {
    this.log('package-solution.json version is up-to-date');
  }

  //Azure deploy
  var deployJson = require('./config/deploy-azure-storage.default.json');
  // log old container
  this.log('azure-deploy container:\t' + deployJson.container);

  var newContainer = pkgConfig.name + '-v' + pkgConfig.version.split('-')[0].replace(/\./g, '-');
  deployJson.container = newContainer;
  deployJson.accessKey = process.env.AZURE_STORAGE_ACCESS_KEY;
  // log new container
  this.log('New deploy-azure-storage container:\t' + deployJson.container);
  // write changed package-solution file
  fs.writeFile('./config/deploy-azure-storage.json', JSON.stringify(deployJson, null, 4), function (err, result) {
    if (err) this.log('error', err);
  });

  var writePkg = require('./config/write-manifests.default.json');
  writePkg.cdnBasePath = `https://${deployJson.account}.azureedge.net/${newContainer}/`;
  // log new url
  this.log('New write-manifests cdnBasePath:\t' + writePkg.cdnBasePath);
  fs.writeFile('./config/write-manifests.json', JSON.stringify(writePkg, null, 4), function (err, result) {
    if (err) this.log('error', err);
  });

  done();
});
if (isProductionBundle) {
  let syncVersionTask = build.task('version-sync', syncVersionsSubtask);
  build.rig.addPreBuildTask(syncVersionTask);
}

/* fast-serve */
const { addFastServe } = require("spfx-fast-serve-helpers");
addFastServe(build);
/* end of fast-serve */
build.initialize(require('gulp'));

