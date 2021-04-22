// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newsService = (function (){
  const apiKey = '059cbedee9bf4aab872b3c8a13f157eb';
  const apiUrl = 'https://news-api-v2.herokuapp.com';

  return {
    topHeadlines(country = "us", category = "general", cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb);
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    }
  }
})();

// Elements
const form = document.forms["newsControls"];
const countrySelect = form.elements['country'];
const categorySelect = form.elements['category'];
const searchInput = form.elements['search'];
const newsContainer = document.querySelector(".news-container .row");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadNews();
});

//  init selects
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
});


// Load news
function loadNews() {
  showLoader();

  const country = countrySelect.value;
  const category = categorySelect.value;
  const searchText = searchInput.value;

  if (!searchText) {
    newsService.topHeadlines(country, category, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

// Function on get response
function onGetResponse(err, res) {
  removePreloader();

  if (err) {
    showAlert(err, 'error-msg');
    return;
  }

  if (!res.articles.length) {
    const emptyMessage = `
    <p class="empty s12">There's no news for your request :(</p>
    `;
    clearContainer(newsContainer);
    newsContainer.insertAdjacentHTML('afterbegin', emptyMessage);
    return;
  }

  renderNews(res.articles);
}

// Render news
function renderNews(news) {
  
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = '';
  news.forEach(newsItem => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

// Clear container function
function clearContainer(container) {
  let child = container.lastElementChild;
  while(child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

function newsTemplate({urlToImage, title, url, description}) {
  const defaultImageUrl = 'img/default.jpg'; 
  return `
  <div class="col s12 m12">
    <div class="card">
      <div class="card-image">
        <img src="${urlToImage || defaultImageUrl}" alt="News image" class="card-image-item">
        <span class="card-title">${title || ''}</span>
      </div>
      <div class="card-content">
        <p>${description || ''}</p>
      </div>
      <div class="card-action">
        <a href="${url}" target="_blank">Read more</a>
      </div>
    </div>
  </div>
  `;
}

function showAlert(msg, type = 'success') {
  M.toast({html: msg, classes: type});
}

// Preloader
function showLoader() {
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="progress">
    <div class="indeterminate"></div>
  </div>
  `);
}

// Remove preloader
function removePreloader() {
  const loader = document.querySelector('.progress');
  if(loader) {
    loader.remove();
  }
}