//User Configuration
const listID = "YOUR_LIST_ID";
const apiKey = "YOUR_API_KEY";
const port = 3000;

const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req, res) {
  const firstName = req.body.fname;
  const lastName = req.body.lname;
  const email = req.body.email;

  const data = {
    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    }]
  }

  const jsonData = JSON.stringify(data);

  const dataCenter = apiKey.split('-')[1]; //Grab this from the end of the API Key
  const url = "https://" + dataCenter + ".api.mailchimp.com/3.0/lists/" + listID;
  const options = {
    method: "POST",
    auth: "anystring:" + apiKey,

  };
  const request = https.request(url, options, function(response) {
    if(response.statusCode == 200) {
      //Success
      res.sendFile(__dirname + "/success.html");
    } else {
      //Fail
      res.sendFile(__dirname + "/failure.html");
    }
    response.on("data", function(data) {
      //console.log(JSON.parse(data));
    })
  });

  request.write(jsonData); //Send the data
  request.end(); // End the request
});

app.post("/failure",function(req,res){
  res.redirect("/");
});

app.listen(port, function() {
  console.log("Server started on port 3000");
})
