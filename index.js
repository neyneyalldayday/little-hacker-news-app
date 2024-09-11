// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const fs = require('fs')

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  // console.log("idk man lets see", await page.content())
  const articles = [];

  let moreButtonExists = true;

  while (moreButtonExists && articles.length < 100) {
    const titleSpans = await page.$$("span.titleline");  
    console.log("titleSpans count:", titleSpans.length);  
    const metaData = await page.$$("td.subtext");
    console.log("mettaData count:", metaData.length);


    if (titleSpans === 0 || metaData.length === 0) break;    

    const getTitle = async () => {
      const titles = [];
      for (let titleSpan of titleSpans) {
        const titleLink = await titleSpan.$("a");
        const title = await titleLink?.textContent();

        titles.push(title);
      }

      return titles;
    }

    const getTimeStamp = async () => {
      const timeStamps = []
      for (let timeStampEl of metaData) {
        const timestampCell = await timeStampEl.$("span.subline span.age");
        const timestamp = await timestampCell.getAttribute("title");

       timeStamps.push(timestamp);
      }
      return timeStamps;
    }

    const titles = await getTitle();
    const timeStamps = await getTimeStamp();

    // console.log("Titles:", titles);
    // console.log("Timestamps:", timeStamps);


      
    for (i = 0; i < Math.min(titles.length, timeStamps.length); i++) {
      if(articles.length < 100){
        articles.push(
          {
            title: titles[i],
            timestamp: timeStamps[i]
          }
        )
      }      
    }

    console.log(`Current article count:  ${articles.length}` )


     //gotta do something about the more button
     const moreButton = await page.$('table#hnmain tbody tr:last-child td.title a');

     if (moreButton) {           
         await moreButton.click();
         await page.waitForSelector('table#hnmain tbody tr:last-child', { timeout: 10000 });
       } else {
         console.log('no more button found');
         moreButtonExists = false;
       }
     await page.waitForTimeout(2000);


 
  }


  articles.sort((a,b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB.getTime() - dateA.getTime();
  })

  
  await browser.close();

  console.log(`final article count: ${articles.length}`);
  for(i =  0; i < Math.min(100, articles.length); i++){
    console.log(`article #${i + 1}: ${articles[i].title}  ${articles[i].timestamp}`);
  }
 

  fs.writeFileSync('sorted_articles.json', JSON.stringify(articles, null, 2))
  console.log("Sorting completed. Exiting...");
  process.exit(0)
}

(async () => {
    await sortHackerNewsArticles();
})();
