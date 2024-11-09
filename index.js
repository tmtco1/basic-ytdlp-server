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

app.get("/", (req, res) => {
  res.send("System is up and running.");
});

app.post("/getDL", (req, res) => {
  var url = req.body.videoURL;
  function validateInput(input) {
    const regex = /^(https?:\/\/)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s'"]*)?$/;
    return regex.test(input);
  }
  if (validateInput(url)) {
    child.exec(`./yt-dlp -f b --get-url '${url}'`, (error, stdout, stderr) => {
      res.send(stdout);
    });
  } else {
    res.send("This is an invalid url");
  }
});

app.listen(port, () => {
  console.log(`yt-dlp server listening on port ${port}`);
});
