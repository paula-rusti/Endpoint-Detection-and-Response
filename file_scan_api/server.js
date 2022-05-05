const express = require('express')
const multiparty = require('multiparty');
const crypto = require('crypto');

const format = require('util').format;
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/file_scan', function(req, res, next){
    // create a form to begin parsing
    var form = new multiparty.Form();
    var file;
  
    form.on('error', next);
    form.on('close', function(){

      const hashSum = crypto.createHash('md5');
      hashSum.update(file.content);
      const hex = hashSum.digest('hex');

      console.log(hex);

      res.send(format('\nuploaded %s (%d Kb)'
        , file.filename
        , file.size / 1024 | 0));
    });
  
    // listen on field event for title
    form.on('field', function(name, val){
      return;
    });
  
    // listen on part event for image file
    form.on('part', function(part){
      if (!part.filename) return;
      if (part.name !== 'file') return part.resume();
      file = {};
      file.filename = part.filename;
      file.size = 0;
      part.on('data', function(buf){
        file.size += buf.length;
        // save buffer in obiectul image ca nu se salveaza bn cu += 
        console.log(`buffer ${buf}`)
        file.content += buf;

      });
    });
    // parse the form
    form.parse(req);
  });

// app.post('/file_scan', (req, res) => {
//     console.log(req.body);
//     res.send('Hello World!');
//   })


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})