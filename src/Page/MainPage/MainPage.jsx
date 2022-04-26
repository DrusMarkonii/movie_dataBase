import { useEffect, useState, useMemo } from "react";
import { API_KEY } from "../../service/endpoints";

import "./MainPage.scss";
import Header from "../../components/Header/Header";

import { useDispatch } from "react-redux";
import {
  fetchGenres,
  addPopularFilms,
  loadFavorites,
  addToFavoritesAction,
} from "../../store/action-creators/filmsActions";
import {DEFAULT_URL} from "../../service/endpoints"

import FilmCard from "../../components/FilmCard/FilmCard";
import axios from "axios";
import Spinner from "../../components/Spinner/Spinner";
import loupe from "../../assets/img/loupe.png";
import multiply from "../../assets/img/multiply.png";

function MainPage() {
  const [filmsList, setFilmsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [fetching, setFetching] = useState(true);
  const [totalPage, setTotalPage] = useState(0);
  const [inputValue, setInputValue] = useState("");

  const dispatch = useDispatch();

  const getFilms = (page) => {
    
  }

  useMemo(() => {
    if (fetching) {
      axios
        .get(
          `${DEFAULT_URL}popular?api_key=${API_KEY}&language=en-US&page=${currentPage}`
        )
        .then((response) => {
          setFilmsList(() => [...filmsList, ...response.data.results]);
          dispatch(addPopularFilms(response.data));
          setCurrentPage((currentPage) => currentPage + 1);
          setTotalPage(response.data.total_pages);
        })
        .finally(() => setFetching(false));
    }
  }, [fetching]);

  useEffect(() => {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (favorites) {
      dispatch(loadFavorites(favorites));
    };
    dispatch(fetchGenres());
  }, []);

  useEffect(() => {
    search(inputValue);
  }, [inputValue]);

  useEffect(() => {

    if (filmsList) {
      document.addEventListener("scroll", scrollHandler);
    };
    
    return function () {
      document.removeEventListener("scroll", scrollHandler);
    };
  }, [filmsList]);

  const search = async (string) => {
    if (string) {
      await axios
        .get(
          `https://api.themoviedb.org/3/search/movie?api_key=cec84349983050a0e6e65380ebeca52a&language=en-US&query=${string}&page=1&include_adult=false`
        )
        .then((response) => {
          setFilmsList(() => [...response.data.results]);
          dispatch(addPopularFilms(response.data));
          setCurrentPage((currentPage) => currentPage + 1);
          setTotalPage(response.data.total_pages);
        })
        .finally(() => setFetching(false));
    } else {
      setCurrentPage(1);
      axios
        .get(
          `${DEFAULT_URL}popular?api_key=${API_KEY}&language=en-US&page=1`
        )
        .then((response) => {
          setFilmsList(() => [...response.data.results]);
          dispatch(addPopularFilms(response.data));
          setCurrentPage((currentPage) => currentPage + 1);
          setTotalPage(response.data.total_pages);
        })
        .finally(() => setFetching(false));
    };
  };

  const scrollHandler = (e) => {
    if (
      e.target.documentElement.scrollHeight -
        (e.target.documentElement.scrollTop + window.innerHeight) <
        100 &&
      currentPage < totalPage
    ) {
      setFetching(true);
    }
  };

  return (
    <div className="mainPage">
      <Header />
      {filmsList.length ? (
        <div className="filmsBox">
          <div className="searchPanel">
            <input
              value={inputValue}
              type="text"
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter film..."
            />
            <img src={loupe} alt="loupe" className="loupe" />
            <img
              src={multiply}
              alt="multiply"
              className="multiply"
              onClick={() => setInputValue("")}
            />
          </div>
          <div className="filmList">
            {filmsList.map(
              ({
                id,
                original_title,
                overview,
                poster_path,
                original_language,
                vote_average,
                genre_ids,
              }) => (
                <FilmCard
                  key={id}
                  original_title={original_title}
                  overview={overview}
                  poster_path={poster_path}
                  original_language={original_language}
                  vote_average={vote_average}
                  genre_ids={genre_ids}
                  id={id}
                />
              )
            )}
          </div>
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
}

export default MainPage;
