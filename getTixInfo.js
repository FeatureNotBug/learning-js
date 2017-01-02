/* PART 1: Open the page and input the form */
var path = '/home/ychinlee/Documents/scraper/';
var page = require('webpage').create();
var fs = require('fs');
var testindex = 0, loadInProgress = false;
var resultPageHTML;
page.onError = function(msg, trace) {

  var msgStack = ['ERROR: ' + msg];

  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    });
  }

  console.error(msgStack.join('\n'));

};

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

/* PART 2: Want to parse HTML output to get the times and prices. */
function parseHTML() {
    var timeMatches = [];
    var costMatches = [];
    var match = [];
    var timeRegEx = /<td align="center">(.*)M<\/td>/;

    var timeFound = false; // flag set so I know price is on next line
    fs.read('./luckystar.html').toString().split('\n').forEach(function(line) {
        if ((match = line.match(timeRegEx)) != null) {
            timeMatches.push(match[1]);
            timeFound = true;
        } else if (timeFound) {
            timeFound = false;
            costMatches.push(line.trim());
        }
    });
    console.log('timematches', timeMatches);
    console.log('costmatches', costMatches);
    // write it to csv
    var child_process = require('child_process');
    var i;
    var toWrite;
    const fname = path+'data.csv';
    // read from the current data.csv and check if it is the same as the new data
    if (fs.exists(fname)) {
        // process the csv
        var timeData = [];
        var costData = [];
        fs.read(fname).toString().split('\n').forEach(function(line) {
            timeData.push(line.split(',')[0]);
            costData.push(line.split(',')[1]);
        });
        timeData.pop();         // get rid of the ending comma
        costData.pop();         // get rid of the ending comma
        console.log('timedata', timeData);
        console.log('costdata', costData);
        
        // compare this to the new data
        var timeDiff = timeData.filter(function(x) { return timeMatches.indexOf(x) < 0});
        var costDiff = costData.filter(function(x) { return costMatches.indexOf(x) < 0});
        console.log('timediff', timeDiff);
        console.log('costdiff', costDiff);
        if (timeDiff.length > 0 || costDiff.length > 0) {
            // the information has changed. Alert user
            const msgFname = path+'msg.txt';
            const address = 'ychinlee@ubuntu';
            var body = "Original status:\n"+timeData+"\n"+costData+"\n\nCurrent status:\n"
                        +timeMatches+"\n"+costMatches
            
            fs.write(msgFname, body, 'w');
            var child_process = require('child_process');
            child_process.spawn(path+'mail.sh', [msgFname, address], 
            function(error, stdout, stderr){
                if (error != null) {
                    console.log('spawn error: ', error);
                } 
            });

            fs.write(fname, '', 'w');
            // write the new data into the file
            for (i = 0; i < timeMatches.length; i++) {
                toWrite = timeMatches[i]+","+costMatches[i]+"\n";
                fs.write(fname, toWrite, 'a');
            }
        }
    } else {
        console.log("Initial run; data.csv is now being written.");
        fs.write(fname, '', 'w');
        for (i = 0; i < timeMatches.length; i++) {
            toWrite = timeMatches[i]+","+costMatches[i]+"\n";
            fs.write(fname, toWrite, 'a');
        }
    }
}

var steps = [
    function() {
        page.open("http://luckystarbus.com");
    }, 
    function() {
        page.evaluate(function() {
            var arr = document.forms['form1'];
            console.log(arr);
            document.getElementById("__VIEWSTATEGENERATOR").value = "C7C53EDD";
            document.getElementById("__EVENTVALIDATION").value = "/wEdADZWaEXOOe7T5nCnLyAX6KrvaG2wOEvcJO7kzjj/QzScSdhijYc0x/muySSrOthlZAUovNgXMeDuof7j4bDcmOThFuq0YxdLr4dbUgtiAxrMvLaLWH2R03Og21aLB0JAgBeAm2upkN3eWr7aqLitf2rejrVTguiIeGHGNDEBI8fQjbdczThzqzTlBffGfZ9I4iJdU6YkBiKUYx5z+Jhn5kumPFoRWsN7uizH7HS/oiySpfE9ig9Uu/ZcsKjWoqUWDKCz8Py9Y6bGQ/H5TB8jdqeqvlp7pzWaC5besxr+cPXN90eOYW/p0DvIz8mDC4DIirIavJv0/8lnSOelZ1e+pEGQPs9ahPsZkjavrQCDxd1KvFMQQTcWnmGRI9Y3D4AD7NZjAkxjDLaF/YEmxx8pkikp0dcJfjL23sI5qOHk8L1lxN3EXpsNycLsTDKLev6uqz2XZnALgkk3rzdCK6UbVUWCh1fOr9emNqDLYoYyI6QNHc3zJwX3Blr/a2Ns8h6ru3bcpIsbqxWo1cZkHfMq+wz88NmCU9+f/gK3LSYmEBX7MYp5GY0hq++fweO9VjobB9jqIaQqf1B+7RnrCZQQftxWWZS4wB+QHY0xdkLpUcFmOlcRv/FwkW8Imk353DNI9Z1glAmSF9o+MJge2VVeUEDXu4eFfyc8iYTDKiAzOgYGZ2SBpSNKU8J+PVBLFGKlhcs6g8fVng5g3rkLdJEqlxVGYT3bXf7Dtj//TzkYvaD0Q+Dpa07YnRshk2cZjuSbgMzp/yJE8K1Cjfxn5hCwDOljGgHXo/P/clHBgZWuAaCIe5TbxTMOs/B5vIdEx4y13aBxwkgdWMTW3/5zOjGiLw2JRWaE+kvfwH+74u7dlPDFcm5QwZ3Ya/cmoRWt+1GrQGE1cSJZQTx9NZ51d58E9V2eqXN7mLIi5f6v1Qb8fjrI3uG1kYZlARbsM8IYLtcuQj9UuqlD0FB5ysr/1KlJAF2pwZIMdrMfiAPKcrU18cd6Z1mgHuafxcrdB+lTyfOROnycYEvtSl4ChgNkl7BTnKuJGBFJeRTdN/nEk6eYFv95d0PiylQgLr0Y1Of1Rzu+sVHkpLmZQSCXBMr2UV75mBXfGJO8q6fm+VTi8Wh720XM9pQ7WI+Wj8fZP4V+JpaHODQViDHOYHzypY0bLf2oysRMSdShJw==";
            document.getElementById("__VIEWSTATE").value = "/wEPDwUJMzcyMTg0Mjk0D2QWAmYPZBYCAgMPZBYGAgMPDxYCHgtOYXZpZ2F0ZVVybAUdL1B1cmNoYXNlLmFzcHg/TGFuZ3VhZ2U9ZXMtTVhkZAIGDw8WAh4EVGV4dAX5BjxGT05UIENPTE9SPSMxRjQ1RkMgU0laRT0zPipPbmxpbmUgdGlja2V0cyBtdXN0IGJlIHB1cmNoYXNlZCBhdCBsZWFzdCAxIGhvdXIgYmVmb3JlIHRoZSBkZXBhcnR1cmUgdGltZS4gQW55dGltZSB3aXRoaW4gdGhpcywgeW91IGNhbiBwdXJjaGFzZSBzYW1lIGRheSB0aWNrZXRzIGF0IG91ciBjb3VudGVyKjwvRk9OVD48QlI+DQoNCjxCUj48Rk9OVCBDT0xPUj1GRjAwMDAgU0laRT0zPipEaXNjb3VudCBUaWNrZXRzIGFyZSBzdWJqZWN0IHRvIG91ciBEaXNjb3VudCBUaWNrZXQgUG9saWN5LiBUaWNrZXQgRGF0ZSBhbmQgVGltZSBjYW5ub3QgYmUgY2hhbmdlZCBhZnRlciBwdXJjaGFzZSBhbmQgdGhleSBhcmUgbm9ucmVmdW5kYWJsZSo8L0ZPTlQ+PEJSPg0KDQo8QlI+PHAgc3R5bGU9ImJvcmRlci1zdHlsZTogZ3Jvb3ZlO2JvcmRlci13aWR0aDogMnB4O2JvcmRlci1jb2xvcjogZ3JlZW47cGFkZGluZzogNXB4OyI+IDxGT05UIENPTE9SPTE1MUI1NCBTSVpFPTM+ICBEdWUgdG8gcmVjZW50IHJlY2FsbHMgb2YgdGhlIDxzcGFuIHN0eWxlPSJmb250LXdlaWdodDpib2xkOyI+U2Ftc3VuZyBHYWxheHkgTm90ZSA3PC9zcGFuPiwgd2UgYXNrIHRoYXQgYWxsIHBhc3NlbmdlcnMgd2hvIGludGVuZCB0byBjYXJyeSB0aGUgZGV2aWNlIHRvIHBsZWFzZTogdHVybiBpdCBvZmY7IGRpc2Nvbm5lY3QgaXQgZnJvbSBhbnkgY2hhcmdpbmcgZXF1aXBtZW50OyBkaXNhYmxlIGFsbCBhcHBzIHRoYXQgY291bGQgaW5hZHZlcnRlbnRseSBhY3RpdmF0ZSB0aGUgcGhvbmU7IHByb3RlY3QgcG93ZXIgc3dpdGNoIHRvIHByZXZlbnQgdW5pbnRlbnRpb25hbCBhY3RpdmF0aW9uIGFuZCBrZWVwIGRldmljZSBpbiBjYXJyeS1vbiBvciBvbiB5b3VyIHBlcnNvbi48L0ZPTlQ+PC9wPg0KDQpkZAIHD2QWDAIBDxBkZBYBAgFkAgUPEGQQFSgBMQEyATMBNAE1ATYBNwE4ATkCMTACMTECMTICMTMCMTQCMTUCMTYCMTcCMTgCMTkCMjACMjECMjICMjMCMjQCMjUCMjYCMjcCMjgCMjkCMzACMzECMzICMzMCMzQCMzUCMzYCMzcCMzgCMzkCNDAVKAExATIBMwE0ATUBNgE3ATgBOQIxMAIxMQIxMgIxMwIxNAIxNQIxNgIxNwIxOAIxOQIyMAIyMQIyMgIyMwIyNAIyNQIyNgIyNwIyOAIyOQIzMAIzMQIzMgIzMwIzNAIzNQIzNgIzNwIzOAIzOQI0MBQrAyhnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZGQCCQ8QDxYCHgtfIURhdGFCb3VuZGdkDxYCAgECAhYCEAUKQm9zdG9uLCBNQQUKQm9zdG9uLCBNQWcQBRFOZXcgWW9yayBDaXR5LCBOWQURTmV3IFlvcmsgQ2l0eSwgTllnZGQCDQ8QDxYCHwJnZBAVAQpCb3N0b24sIE1BFQEBMhQrAwFnZGQCFQ8PFggeCUJhY2tDb2xvcgo0HwFlHgdFbmFibGVkaB4EXyFTQgIIZGQCHw8PZA8QFgFmFgEWAh4OUGFyYW1ldGVyVmFsdWUFEU5ldyBZb3JrIENpdHksIE5ZFgFmZGQYAQUeX19Db250cm9sc1JlcXVpcmVQb3N0QmFja0tleV9fFgEFFmN0bDAwJE1haW5Db250ZW50JGJ0R2+8OY2OdDEEKpvYkwG3EmE4/MryAQ==";
            arr.MainContent_rbTripType_1.checked = "checked";
            arr.MainContent_numPassengers.value = 1;
            arr.MainContent_ddDepartureCity.value = "New York City, NY";
            arr.MainContent_ddArrivalCity.value="2";
            arr.MainContent_sd.value = "1/28/2017";
//setTimeout(function(){}, 2000);
            //arr.MainContent_ed.value = "12/27/2016";
            arr.MainContent_rbFareType_0.checked = "checked";
        });
    },
    function() {        // submit the form
        page.evaluate(function() {
            function eventFire(el, etype) {
                if (el.fireEvent) {
                    (el.fireEvent('on' + etype));
                }
                else {
                    var evObj = document.createEvent('Events');
                    evObj.initEvent(etype, true, false);
                    el.dispatchEvent(evObj);
                }
            }
            eventFire(document.querySelector("#MainContent_btGo"), 'click');
        });
    },
    function() {    // take screenshot
        console.log("Step 4: taking the screenshot");
        page.render(path+'luckystar.png');
        // copy HTML to file
        fs.write(path+'luckystar.html', page.content, 'w');
        resultPageHTML = page.content;
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
    parseHTML();
    phantom.exit();
  }
}, 500);

