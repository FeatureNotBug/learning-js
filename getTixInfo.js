// HTMLParser() from https://developer.mozilla.org/en-US/Add-ons/Code_snippets/HTML_to_DOM#Using_a_hidden_browser_element_to_parse_HTML_to_a_window.27s_DOM
function HTMLParser(aHTMLString){
  var html = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null),
    body = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
  html.documentElement.appendChild(body);

  body.appendChild(Components.classes["@mozilla.org/feed-unescapehtml;1"]
    .getService(Components.interfaces.nsIScriptableUnescapeHTML)
    .parseFragment(aHTMLString, false, null, body));

  return body;
}

/* PART 1: Open the page and input the form */
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
//var DOMPars = HTMLParser(resultPageHTML);
/*
var div = document.createElement('div');
div.innerHTML = resultPageHTML;
var elements = div.childNodes;
console.log("elements");
console.log(elements);
*/
function parseHTML() {
    var regEx = /(<td align="center">(.*)M<\/td>)|(<td align="center" style="width:75px;">(.*)<\/td>)/g
    //var regEx = /(<td align="center">(.*)M<\/td>)|(\$(.*)\n<\/td>)/g
    // from http://stackoverflow.com/questions/7280586/javascript-regex-access-multiple-occurrences
/*
    var timeMatches = [];
    var match = [];
    while ((match = regEx.exec(resultPageHTML)) != null) {
        timeMatches.push(match[2]);         // since each match is of form <td align="center">07:00 AM</td>,<td align="center">07:00 AM</td>,07:00 A,, 
    }
    console.log(resultPageHTML);
    console.log('matches');
    console.log(timeMatches);
    var costRegEx = /<td align="center" style="width:75px;">(.*)<\/td>/mg;      // for some reason this part of regEx is never found, so I'm doing it separately 
    var costMatches = [];
    while ((match = costRegEx.exec(resultPageHTML)) != null) {
        console.log(match);
        console.log("got here");
        costMatches.push(match[0]);         // since each match is of form <td align="center">07:00 AM</td>,<td align="center">07:00 AM</td>,07:00 A,, 
    }
    console.log(costMatches);

    /*
        /////////
        doing it from the file as opposed to from the html as a var
    */
    var match = [];
    var timeRegEx = /<td align="center">(.*)M<\/td>/;

    fs.read('./luckystar.html').toString().split('\n').forEach(function(line) {
    //console.log(line);
        if ((match = line.match(timeRegEx)) != null) {
            timeMatches.push(match[1]);
        }
    });
    console.log(timeMatches);
/*
var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('luckystar.html')
});

lineReader.on('line', function (line) {
  console.log('Line from file:', line);
});

/*
    var lineReader = require('readline').createInterface({
        input:fs.createReadStream('luckystar.html')
    });
    lineReader.on('line', function(line) {
        match = timeRegEx(line);
        console.log(match);
    });
*/
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
        page.render('luckystar.png');
        // copy HTML to file
        fs.write('luckystar.html', page.content, 'w');
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
    console.log("afewfqef");
    phantom.exit();
  }
}, 500);

