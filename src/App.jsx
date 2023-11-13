import React, {useEffect, useState } from "react";
import StarRating from "./StarRating";

function Navbar({ children }) {
  return <div className="nav-bar">{children}</div>;
}

function Logo() {
  return (
    <div className="logo">
      <span className="img">🍿</span>
      <h1>UseIMDB</h1>
    </div>
  );
}

function Search({ setQuery }) {
  const [search, setSearch] = useState("");
  function handleSearch(e) {
    if(e.key === 'Enter') setQuery(search); 
  }
  return (
    <>
      <input
        className="search"
        type="text"
        placeholder="Search for Movies"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleSearch}
      />
      <button className="new-btn" onClick={()=> setQuery(search)}>
        🔍
      </button>
    </>
  );
}

function NumResult({movies}) {
  return (
    <div className="num-results">
      <p>
        Found <strong>{movies}</strong> results
      </p>
    </div>
  );
}

function Main({ children }) {
  return <div className="main">{children}</div>;
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  function handleToggle() {
    setIsOpen((isOpen) => !isOpen);
  }
  return (
    <div className="box">
      <button className="btn-toggle" onClick={handleToggle}>
        {isOpen ? "-" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  // console.log(movies)
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  // console.log(movie);
  return (
    <>
      <li onClick={() => onSelectMovie(movie.imdbID)}>
        <img src={movie.Poster} alt="photo" />
        <h3>{movie.Title}</h3>
        <div>
          <p>
            <span>🗓</span>
            <span>{movie.Year}</span>
          </p>
        </div>
      </li>
    </>
  );
}
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function WatchedSummary({watched}) {
  console.log(watched) ;
  const avgImdbRating = average(watched.map((i)=>  i.imdbRating)
  )
  const avgRating = average(watched.map((i)=>  i.rating)
  )
  const avgRuntime = average(watched.map((i)=>  i.runtime)
  )


   return(
    <div className="summary">
    <h2>Movies you watched</h2>
    <div>
      <p>
        <span>#️⃣</span>
        <span>{watched.length} movies</span>
      </p>
      <p>
        <span>⭐️</span>
        <span>{avgImdbRating.toFixed(2)}</span>
      </p>
      <p>
        <span>🌟</span>
        <span>{avgRating.toFixed(2)}</span>
      </p>
      <p>
        <span>⏳</span>
        <span>{avgRuntime.toFixed()} min</span>
      </p>
    </div>
  </div>
   )
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <>
      <ul className="list">
        {watched?.map((movie) => (
          <WatchedMovie
            movie={movie}
            key={movie.imdbID}
            onDeleteWatched={onDeleteWatched}
          />
        ))}
      </ul>
    </>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <>
      <li>
        <img src={movie.poster} alt={`${movie.Title} poster`} />
        <h3>{movie.title}</h3>
        <div>
          <p>
            <span>⭐️</span>
            <span>{movie.imdbRating}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{movie.rating}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{movie.runtime} min</span>
          </p>
          <button
            className="btn-delete"
            onClick={() => onDeleteWatched(movie.imdbID)}
          >
            X
          </button>
        </div>
      </li>
    </>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatchedMovie }) {
  const [movie, setMovie] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?i=${selectedId}&apikey=605218fa`
      );

      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedId]);

  function handleAdd() {
    const runtimeMinutes = parseInt(movie.Runtime.split(" ")[0], 10) || 0;

    const newWatchedMovie = {
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster,
      imdbRating: movie.imdbRating,
      runtime: runtimeMinutes,
      imdbID: movie.imdbID,
      rating: rating,
    };
    onAddWatchedMovie(newWatchedMovie);
    onCloseMovie();
  }

  return (
    <div className="details">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              ⬅️
            </button>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <div className="details-overview">
              <h2>{movie.Title}</h2>

              <p>
                {movie.Released} &bull; {movie.Runtime}
              </p>
              <p>{movie.Genre}</p>
              <p>
                <span>⭐</span>
                {movie.imdbRating} IMDB Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              <StarRating setRating={setRating} rating={rating} />
              <button className="btn-add" onClick={handleAdd}>
                + Add to list
              </button>
            </div>
            <p>
              <em>{movie.Plot}</em>
            </p>
            <p>Starring: {movie.Actors}</p>
            <p>Directed by: {movie.Director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("iron man");
  const [selectedId, setSelectedId] = useState("");
  const [watched, setWatched] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=605218fa&s=${query}`
        );

        if (!res.ok) throw new Error("Something went Wrong");

        const apiData = await res.json();
        setData(apiData.Search);
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, [query]);

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }
  function handleAddWatchedMovie(movie) {
    const isAlreadyAdded = watched.some((watchedMovie) => watchedMovie.imdbID === movie.imdbID);

    if (isAlreadyAdded) {
      // Update user rating for the existing movie
      setWatched((prevWatched) =>
        prevWatched.map((watchedMovie) =>
          watchedMovie.imdbID === movie.imdbID ? { ...watchedMovie, rating: movie.rating } : watchedMovie
        )
      );
    } else {
      // Add the movie to the watched list
      setWatched((prevWatched) => [...prevWatched, movie]);
    }

  }
  function handleDeleteWatched(id) {
    console.log(id);
    setWatched((prevwatched) => 
      prevwatched.filter((movie) => movie.imdbID !== id)
    );
  }

  return (
    <div>
      <Navbar>
        <Logo />
        <Search setQuery={setQuery} />
        <NumResult movies={data.length} />
      </Navbar>
      <Main>
        <Box>
          <MovieList movies={data} onSelectMovie={handleSelectMovie} />
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatchedMovie={handleAddWatchedMovie}
            />
          ) : (
            <>
            <WatchedSummary watched={watched}/>
            <WatchedMovieList
              watched={watched}
              onDeleteWatched={handleDeleteWatched}
            />
          </>
          )}
        </Box>
      </Main>
    </div>
  );
}

export default App;
