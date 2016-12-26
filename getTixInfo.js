var page = require('webpage').create()
var testindex = 0, loadInProgress = false;

page.onConsoleMessage = function(msg) {
  console.log(msg);
};

page.onLoadStarted = function() {
  loadInProgress = true;
  console.log("load started");
};

page.onLoadFinished = function() {
  loadInProgress = false;
  console.log("load finished");
};
/*
page.open('http://www.luckystarbus.com', function (status) {
    if (status !== 'success') {
        console.log('Unable to access network');
    } else {
        page.render('luckystar.png');
    }
    phantom.exit();
});
*/
var steps = [
    function() {
        page.open("http://luckystarbus.com");
    }, 
    function() {
        page.evaluate(function() {
            //var arr = document.forms[0];//.getElementsByClassName("form1");
            var arr = document.forms['form1'];//.getElementsByClassName("form1");
            console.log(arr);
            arr.MainContent_rbTripType_1.checked = "checked";
            arr.MainContent_numPassengers.value = 1;
            arr.MainContent_ddDepartureCity.value = "New York City, NY";
            arr.MainContent_ddArrivalCity.value="2";
            arr.MainContent_sd.value = "12/27/2016";
            //arr.MainContent_ed.value = "12/27/2016";
            arr.MainContent_rbFareType_0.checked = "checked";
        });
    },
    function() {        // submit the form
        page.evaluate(function() {
            page.sendEvent('click', document.forms['form1'].MainContent_btGo);
            document.forms['form1'].MainContent_btGo.click();
            //document.forms['form1'].submit();
        });
    },
    function() {    // take screenshot
        console.log("Step 4: taking the screenshot");
        page.render('luckystar.png');
    }
];

var interval = setInterval(function() {
  if (!loadInProgress && typeof steps[testindex] == "function") {
    console.log("step " + (testindex + 1));
    steps[testindex]();
    testindex++;
  }
  if (typeof steps[testindex] != "function") {
    console.log("test complete!");
    phantom.exit();
  }
}, 5000);
