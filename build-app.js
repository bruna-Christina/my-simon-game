var fs = require('fs');
var path = require('path');

// https://stackoverflow.com/questions/11293857/fastest-way-to-copy-file-in-node-js
function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

copyFile('server/package.json','dist/package.json',(err)=>{
  if(!err){
    console.log('copied package.json');
    copyFile('server/server.js','dist/server.js',(err)=>{
      if(!err){
        console.log('copied server.js');
        copyFile('server/manifest.yml','dist/manifest.yml',(err)=>{
          if(!err){
            console.log('copied manifest.yml');
            // copyFile('server/vcap-local.json','dist/vcap-local.json',(err)=>{
            //   if(!err){
            //     console.log('copied vcap-local.json');
            //   }
            // });
          }
        });
      }
    });
  }
});