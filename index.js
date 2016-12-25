var express = require('express');
//var Nightmare = require('nightmare'); // since nightmare is not working
var app = express();


// from http://stackoverflow.com/questions/32771609/how-to-click-on-selectbox-options-using-phantomjs
function selectOption(selector, optionIndex) {
    page.evaluate(function(selector, optionIndex) {
        var sel = document.querySelector(selector);
        sel.selectedIndex = optionIndex;
        var event = new UIEvent("change", {
            "view": window,
            "bubbles": true,
            "cancelable": true
        });
        sel.dispatchEvent(event);
    }, selector, optionIndex);
}

app.get('/', function (req, res) {
    res.sendFile(__dirname+'/'+'index.htm');
})

app.get('/search', function (req, res)  {
    console.log("Got a GET request for /search");
    res.sendFile(__dirname+'/'+'index.htm');
})

app.get('/process_get', function (req, res) {
    response = {
        numPass:req.query.numPassenger,
        sDate:req.query.startDate,
        eDate:req.query.endDate
    };
    // adapted from http://stackoverflow.com/questions/9246438/how-to-submit-a-form-using-phantomjs
    var steps = [
        function() {
            page.open("https://luckystarbus.com");
        }, 
        function() {
            page.evaluate(function() {
                var arr = document.getElementsByClassName("bus-form");
                var i;
                for (i = 0; i < arr.length; i++) {
                    if (arr[i].getAttribute('method') == "POST") {
                        arr[i].elements["MainContent_ddDepartureCity"].value="New York City, NY";
                        arr[i].elements["MainContent_ddArrivalCity"].value="22";
                        // need start and end dates
                        arr[i].elements["MainContent_ed"].value=req.endDate;
                        arr[i].elements["MainContent_sd"].value=req.startDate;
                        arr[i].elements["MainContent_numPassengers"].value=req.numPassenger;
                        return;
                    }
                }
            });
        }
    ];
/*
    var busInfo = new Nightmare()
        .viewport(1000, 1000)
        .useragent("Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36")
        .goto('http://luckystarbus.com')
        .click('MainContent_ddDepartureCity', "New York City, NY")
        .click('MainContent_ddArrivalCity', "2")
        .wait()
        .screenshot('luckystarbus.png')
        .run(function(err, nightmare) {
            if (err) return console.log(err);
            console.log('Done!');
        });
*/
    console.log(response);
    res.end(JSON.stringify(response));
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
   
    console.log("Example app listening at http://%s:%s", host, port)
})

