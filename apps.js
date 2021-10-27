//User Configuration
const listID = "YOUR_LIST_ID";
const apiKey = "YOUR_API_KEY";

//Define the port listening on
const port = 3000;

//Include our node modules
const express = require('express');
const bodyParser = require('body-parser');
const {
  body
} = require('express-validator');
const https = require('https');

//Initilize the express app
const app = express();

//Add the middleware to parse the body
app.use(bodyParser.urlencoded({
  extended: true
}));

//Define our static directory for css and images
app.use(express.static("public"));

//Route for site root
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

//Route to handle the input form on the root document
app.post("/",
  body('email').normalizeEmail(),
  body('fname').whitelist("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"),
  body('lname').whitelist("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"),
  function(req, res) {
    //Pull our sanatized data into easy to manipulate consts
    const firstName = req.body.fname;
    const lastName = req.body.lname;
    const email = req.body.email;

    //Create an object with our data for inclusion in the request body
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

    //Convert our object to JSON
    const jsonData = JSON.stringify(data);

    //Create our URL and setup the options for the request
    const dataCenter = apiKey.split('-')[1]; //Grab this from the end of the API Key
    const url = "https://" + dataCenter + ".api.mailchimp.com/3.0/lists/" + listID;
    const options = {
      method: "POST",
      auth: "anystring:" + apiKey,
    };

    //Submit the request
    const request = https.request(url, options, function(response) {
      if (response.statusCode == 200) {
        //Success
        res.sendFile(__dirname + "/success.html");
      } else {
        //Fail
        res.sendFile(__dirname + "/failure.html");
      }
      response.on("data", function(data) {
        //To debug the returned data, uncomment the following line
        //console.log(JSON.parse(data));
      })
    });

    //Error checking the request
    request.on('error', (e) => {
      //Trap any errors reaching the server
      console.error(e);
      res.sendFile(__dirname + "/failure.html");
    });

    request.write(jsonData); //Send the data
    request.end(); // End the request
  });

//Route for our button(form) on the failure message
app.post("/failure", function(req, res) {
  //Redirect back to the root document
  res.redirect("/");
});

//Spin up the app
app.listen(port, function() {
  console.log("Server started on port " + port);
})
