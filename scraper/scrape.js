const https = require("https");
const fs = require("fs");
const xml2js = require("xml2js");
var parser = new xml2js.Parser();
let queue = [];
let files = [];

function scrapeURL() {
  let url = queue.pop();
  console.log(url);
  https
    .get(url, function(res) {
      //   res.setEncoding("utf8");

      var body = "";
      res.on("data", function(chunk) {
        body += chunk;
      });
      res.on("end", function() {
        parser.parseString(body, function(err, result) {
          console.log(err);
          if (result) {
            let audio_files = result["audio_files"];
            console.dir(JSON.stringify(result));
            if (audio_files) {
              let list = audio_files["audio_file"];
              console.log(list);
              files = files.concat(list);
            }
          }

          if (queue.length > 0) {
            scrapeURL();
          } else {
            let data = JSON.stringify(files);
            fs.writeFileSync("ambient_sounds.json", data);
          }

          console.log("Done");
        });
      });
    })
    .on("error", function(e) {
      console.log("Got error: " + e.message);
    });
}

let url_stem = "https://xml.ambient-mixer.com/get-audio?id_category=";
for (var i = 0; i < 300; i++) {
  let url = url_stem + i;
  queue.push(url);
}
console.log(queue);
scrapeURL();
