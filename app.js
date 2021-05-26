// TMDB API
const API_KEY = "api_key=0f95b5a629ac36f83087e4c226934867";
const BASE_URL = "https://api.themoviedb.org/3";
const API_URL = BASE_URL + "/discover/movie?sort_by=popularity.desc&" + API_KEY;
const Image_URL = "https://image.tmdb.org/t/p/w500";
const searchURL = BASE_URL + "/search/movie?" + API_KEY;
const movie_URL = "https://www.themoviedb.org/movie/";
const genre_URL = BASE_URL + "/genre/movie/list?" + API_KEY;

// Variables

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const tagsEl = document.getElementById("tags");

// Get Movies

getMovies(API_URL);

function getMovies(url) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.results.length != 0) {
        showMovies(data.results);
      } else {
        main.innerHTML = `
                <h1 style="margin:20px; weight:bold">No Results Found!!</h1>
            `;
      }
      console.log(data);
    });
}
function showMovies(data) {
  main.innerHTML = "";

  data.forEach((movie) => {
    const { title, poster_path, vote_average, overview, id } = movie;

    var Title = title.replace(/\s+/g, "-").toLowerCase();

    const movieElement = document.createElement("div");
    movieElement.classList.add("card");
    movieElement.innerHTML = `
        <a href="${movie_URL + id + Title}">
         <img src="${
           poster_path
             ? Image_URL + poster_path
             : "http://via.placeholder.com/1080x1580"
         }" class="card-img-top" alt="${title}" />
        </a>
        <div id="" class="movie-info card-body">
          <h3 >${title}</h3>
          <span class="${getColor(vote_average)}">${vote_average}</span>
        </div>
        <div class="overview">
            <h3>Overview</h3>
            ${overview}
            </div>
        `;
    main.appendChild(movieElement);
  });
}

var selectedGenre = [];
function getMoviesList() {
  tagsEl.innerHTML = "";

  fetch(genre_URL)
    .then((res) => res.json())
    .then((data) => {
      data.genres.forEach((genre) => {
        const t = document.createElement("div");
        t.classList.add("tag");
        t.id = genre.id;
        t.innerText = genre.name;
        t.addEventListener("click", () => {
          if (selectedGenre.length == 0) {
            selectedGenre.push(genre.id);
          } else {
            if (selectedGenre.includes(genre.id)) {
              selectedGenre.forEach((id, idx) => {
                if (id == genre.id) {
                  selectedGenre.splice(idx, 1);
                }
              });
            } else {
              selectedGenre.push(genre.id);
            }
          }
          console.log(selectedGenre);
          getMovies(
            API_URL + "&with_genres=" + encodeURI(selectedGenre.join(","))
          );
          highlightSelection();
        });
        tagsEl.append(t);
      });

      console.log(data);
    });
}

function highlightSelection() {
  const tags = document.querySelectorAll(".tag");
  tags.forEach((tag) => {
    tag.classList.remove("highlight");
  });
  clearAll();
  if (selectedGenre.length != 0) {
    selectedGenre.forEach((id) => {
      const highlightedTag = document.getElementById(id);
      highlightedTag.classList.add("highlight");
    });
  }
}

getMoviesList();
function getColor(vote) {
  if (vote >= 8) {
    return "green";
  } else if (vote >= 5) {
    return "orange";
  } else {
    return "red";
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const searchTerm = search.value;
  selectedGenre = [];
  highlightSelection();
  if (searchTerm) {
    getMovies(searchURL + "&query=" + searchTerm);
  } else {
    getMovies(API_URL);
  }
});

function clearAll() {
  let clearBtn = document.getElementById("clear");
  if (clearBtn) {
    clearBtn.classList.add("highlight");
  } else {
    let clear = document.createElement("div");
    clear.classList.add("tag", "highlight");
    clear.id = "clear";
    clear.innerText = "Clear All";
    clear.addEventListener("click", () => {
      selectedGenre = [];
      getMoviesList();
      getMovies(API_URL);
    });
    tagsEl.append(clear);
  }
}
