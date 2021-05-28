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
const prev= document.getElementById('prev');
const next= document.getElementById('next');
const current= document.getElementById('current');
var currentpage =1;
var nextpage=2;
var prevpage=3;
var lastUrl ='';
var totalPages=100;



// Get Movies

getMovies(API_URL);

function getMovies(url) {
  lastUrl = url
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.results.length != 0) {
        showMovies(data.results);
         currentpage =data.page;
         nextpage= currentpage +1 ;
         prevpage=currentpage  -1 ;
         totalPages=data.total_pages;

         current.innerText = currentpage;

         if(currentpage<= 1){
           prev.classList.add('disabled');
           next.classList.remove('disabled')
         }else if(currentpage>=totalPages){
          prev.classList.remove('disabled');
          next.classList.add('disabled')
         }else{
          prev.classList.remove('disabled');
          next.classList.remove('disabled')
         }

         tagsEl.scrollIntoView({behavior:'smooth'})

      } else {
        main.innerHTML = `<h1 style="margin:20px; weight:bold">No Results Found!!</h1>`;
      }
    });
}
function showMovies(data) {
  main.innerHTML = '';

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
            <br/>
            <button class="know-more" id="${id}">More Details</button>
 
            </div>
        `;
    main.appendChild(movieElement);

    document.getElementById(id).addEventListener('click',()=>{
      openNav(movie);
    })
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

const overlayContent = document.getElementById('overlay-contents');

function openNav(movie) {
  const{id}=movie
  fetch(BASE_URL+'/movie/'+id+'/videos?'+API_KEY).then(res=>res.json())
  .then((videoData)=>{
    if(videoData){
      document.getElementById("myNav").style.width = "100%";
      if(videoData.results.length > 0){
        var embed =[];
        var dots = [];
        videoData.results.forEach((video,idx)=>{
          let{name,key,site}=video
          if(site == 'YouTube'){
            embed.push(`
        <iframe
          class = "embed hide"
          width="340"
          height="315"
          src="https://www.youtube.com/embed/${key}"
          title="${name}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
            `)

            dots.push(`
            <span class="dot">${idx+1}</span>
            `)
          }
        })
        var content =`
        <h1 style="margin:20px; weight:bold;color:white">${movie.original_title}</h1>
        <br/>
        ${embed.join(``)}
        <br/>
        <div class="dots">${dots.join('')}</div>
        `
        
        overlayContent.innerHTML =content;
        activeSlide=0;
        showVideos();
      }else{
        overlayContent.innerHTML = `<h1 style="margin:20px; weight:bold">No Results Found!!</h1>`
      }
    }
  })
}
var activeSlide=0;
var totalVideos=0;
function showVideos(){
   let embedClasses = document.querySelectorAll('.embed');
   let dots = document.querySelectorAll('.dot');
   totalVideos = embedClasses.length;
   embedClasses.forEach((embedTag,idx)=>{
     if(activeSlide==idx){
       embedTag.classList.add('show');
       embedTag.classList.remove('hide');
     }else{
       
      embedTag.classList.remove('show');
      embedTag.classList.add('hide');
     }
   })
  
   dots.forEach((dot,indx)=>{
     if(activeSlide == indx){
       dot.classList.add('active')
     }else{
      dot.classList.remove('active')
     }
   })

 }

 const leftArrow = document.getElementById('left-arrow');
 const rightArrow = document.getElementById('right-arrow');
 
 leftArrow.addEventListener('click',()=>{
  if(activeSlide>0){
    activeSlide--;
  }else{
    activeSlide = totalVideos-1;
  }
  showVideos();
 })

 
 rightArrow.addEventListener('click',()=>{
  if(activeSlide< (totalVideos-1)){
    activeSlide++;
  }else{
    activeSlide = 0;
  }
  showVideos();
 })
function closeNav() {
  document.getElementById("myNav").style.width = "0%";
}


next.addEventListener('click',()=>{
  if(nextpage<=totalPages){
    pageCall(nextpage)
  }
})

prev.addEventListener('click',()=>{
  if(nextpage> 0){
    pageCall(prevpage)
  }
})

function pageCall(page){
  let urlSplit= lastUrl.split('?');
  let queryParams = urlSplit[1].split('&');
  let key = queryParams[queryParams.length -1].split('=');
  if(key[0] != 'page'){
    let url = lastUrl+'&page='+page;
    getMovies(url);
  }else{
    key[1] = page.toString();
    let a =key.join('=');
    queryParams[queryParams.length-1]=a;
    let b = queryParams.join('&');
    let url = urlSplit[0]+'?'+b;
    getMovies(url);
  }
}