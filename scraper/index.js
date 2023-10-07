const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://www.imdb.com/chart/top';
const logFilePath = 'top250movies.log'

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
};

axios.get(url, { headers })
  .then(response => {
    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);

      const movies = [];
      $('.ipc-metadata-list-summary-item').each((index, element) => {
        const title = $(element).find('h3.ipc-title__text').text().trim().replace(/^\d+\.\s/, '');
        const rating = parseFloat($(element).find('span.ipc-rating-star[aria-label]').text().trim());

        movies.push({ title, rating });
      });
      const logContent = movies.map(movie => `${movie.title}: ${movie.rating}`).join('\n');
      fs.writeFileSync(logFilePath, logContent);
      //console.log(movies);
    }
  })
  .catch(error => console.error('Error:', error));
