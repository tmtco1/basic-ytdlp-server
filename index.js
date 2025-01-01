const express = require("express");
const app = express();
const port = 3100;
var bodyParser = require("body-parser");
const child = require("child_process");
const { stdout } = require("process");

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
  res.send("v0.2.0");
});

app.post("/getDL", (req, res) => {
  var url = req.body.videoURL;

  function validateInput(input) {
    const regex = /^(https?:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s'"]*)?$/;
    return regex.test(input);
  }

  if (validateInput(url)) {
    child.exec(`./yt-dlp -f b --get-url '${url}'`, (error, stdout, stderr) => {
      var matches = stdout.match(/\bhttps?:\/\/\S+/gi);
      if (matches) {
        if(matches.length==1) {
          var resp = {
            urls: matches,
          };
          res.json(resp);
        }   
      } else if (stderr) {
        child.exec(`./yt-dlp -f "bestvideo+bestaudio" --get-url '${url}'`, (error, stdout, stderr) => {
          var matches = stdout.match(/\bhttps?:\/\/\S+/gi);
          if(matches) {
            if (matches.length == 2) {
              var resp = {
                urls: matches,
              };
              res.json(resp);
            } else {
              res.send("unsupported");
            }
          }
        });
      }
    });
  } else if (stderr) {
      res.send("invalid");
  }
});

app.listen(port, () => {
  console.log(`yt-dlp server listening on port ${port}`);
});
