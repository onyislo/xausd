const Parser = require('rss-parser');
const parser = new Parser();
async function run() {
  try {
    const feed = await parser.parseURL('https://www.youtube.com/feeds/videos.xml?user=Bloomberg');
    console.log("Bloomberg:", feed.items[0].title);
  } catch (e) {
    console.log("Bloomberg error", e.message);
  }
  try {
    const feed2 = await parser.parseURL('https://www.youtube.com/feeds/videos.xml?user=yahoofinance');
    console.log("Yahoo:", feed2.items[0].title);
  } catch (e) {
    console.log("Yahoo error", e.message);
  }
}
run();
