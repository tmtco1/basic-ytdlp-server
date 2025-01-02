const express = require("express");
const app = express();
const port = 3100;
var bodyParser = require("body-parser");
const child = require("child_process");
const { stdout, stderr } = require("process");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.get("/", (req, res) => {
  res.send("v0.3.0");
});

app.post("/getDL", (req, res) => {
  var url = req.body.videoURL;

  function validateInput(input) {
    return /^(https?:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s'"]*)?$/.test(input);
  }

  if (validateInput(url)) {
    //youtube-specific patch
    if(url.includes("youtu.be") || url.includes("yt.be") || url.includes("youtube.com")) {
      child.exec(`./yt-dlp -f "bestvideo+bestaudio" --get-url '${url}'`, (err, stdout, stderr) => {
        var matches = stdout.match(/\bhttps?:\/\/\S+/gi);
        if(!matches) return res.json({
          "err": "unsupported"
        });

        if(matches.length>0) {
          res.json({
            "urls": matches
          })
        } 
      });
    } else {
      //anything other than youtube
      child.exec(`./yt-dlp -f b --get-url '${url}'`, (err, stdout, stderr) => {
        var matches = stdout.match(/\bhttps?:\/\/\S+/gi);
        if(!matches) return res.json({
          "err": "notfound"
        });

        if(matches.length>0) {
          res.json({
            "urls": matches
          })
        } 
      });
    }
  }
});

app.listen(port, () => {
  console.log(`yt-dlp server listening on port ${port}`);
});
