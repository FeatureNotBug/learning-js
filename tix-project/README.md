# First project using javascript!

## Files:
- getTixInfo.js: given a departure date (right now needs to be manually changed in code), enter the data into the form on luckystarbus.com. Output the times and costs for buses from New York to Boston on that day, and take a screenshot of the page, as well.
    - keep a record of this data and every time program is run, compare against old data
    - if data has changed, send (using sSMTP) a message to me with the old and new data
    - now setup on my computer as a crontab job (@hourly phantomjs path+getTixInfo.js)

- index.js, index.html: trying out making a page with links in node

## Using:
- node v7.2.1
- npm v3.10.10
- sSMTP 2.64

Other dependencies can be found in package.json

## To run: 
- download the files
- run "npm i"

1) getTixInfo.js
- run "phantomjs getTixInfo.js"

2) index.js
- run "npm install node-phantom"
- run "node index.js"

