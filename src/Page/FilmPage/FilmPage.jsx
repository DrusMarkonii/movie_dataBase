import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import {
  getFilmOfDescription,
  getRecommendedFilms,
  getTrailerOfFilm,
  IMAGE_API_PATH,
} from "../../service/endpoints";
import Header from "../../components/Header/Header";
import Spinner from "../../components/Spinner/Spinner";
import feature_false from "../../assets/img/feature_false.png";
import feature_true from "../../assets/img/feature_true.png";
import RecommendCard from "../../components/RecommendCard/RecommendCard";

import "./FilmPage.scss";

function FilmPage() {
  const [film, setFilm] = useState(null);
  const [recommended, setRecommended] = useState(null);
  const [idOfFilm, setIdOfFilm] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const [video, setVideo] = useState("");

  const { id } = useParams();

  useEffect(() => {
    setIdOfFilm(id);
  }, [id]);

  useEffect(() => {
    if (idOfFilm) {
      try {
        filmOfDescription(idOfFilm);
        recommendedFilms(idOfFilm);
      } catch (err) {
        console.log(err);
      }
    }
  }, [idOfFilm]);

  useEffect(() => {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (favorites.find((film) => film.id === +idOfFilm)) {
      setIsAdded(true);
    }
  }, []);

  const filmOfDescription = async (id) => {
    const film = await getFilmOfDescription(id);
    const video = await getTrailerOfFilm(id);
    setFilm(() => film);
    if (video.results[0].key) {
      setVideo(() => video.results[0].key);
    }
  };

  const addToFavorites = () => {
    setIsAdded(!isAdded);
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites.push(film);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  };

  const removeFromFavorites = (id) => {
    setIsAdded(!isAdded);
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter((film) => film.id !== id);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  };

  const recommendedFilms = async (id) => {
    const recommended = await getRecommendedFilms(id);
    setRecommended(recommended);
  };

  return (
    <>
      <Header />
      {film && idOfFilm && recommended ? (
        <div className="filmPage">
          <div className="filmOfDescription">
            <div className="filmOfDescription__imageBox">
              <img
                className="filmPage_img"
                src={`${IMAGE_API_PATH}${film.poster_path}`}
                alt={film.title}
              />
            </div>
            <div className="favoritesBtn">
              {isAdded ? (
                <img
                  src={feature_true}
                  alt="feature_true"
                  className="feature_true"
                  onClick={() => {
                    removeFromFavorites(film.id);
                  }}
                />
              ) : (
                <img
                  src={feature_false}
                  alt="feature_false"
                  className="feature_false"
                  onClick={() => {
                    addToFavorites(film.id);
                  }}
                />
              )}
            </div>
            <div className="filmOfDescription__descriptionBox">
              <h1 className="filmTitle">{film.title}</h1>
              <div className="dataBox">
                <p className="dataBox__item">
                  <b>Country:</b> <i>{film.production_countries[0].name}</i>
                </p>
                <p className="dataBox__item">
                  <b>Runtime:</b> <i>{film.runtime}</i>
                </p>
                <p className="dataBox__item">
                  <b>Genre:</b>{" "}
                  {film.genres.map(({ name }) => (
                    <i key={name}> {name}</i>
                  ))}
                </p>
                <p className="dataBox__item">
                  <b>Release:</b> <i>{film.release_date}</i>
                </p>
                <p className="dataBox__item">
                  <b>Rating:</b> <i>{film.vote_count}</i>
                </p>
                <p className="dataBox__item">
                  <b>Description:</b> <i> {film.overview}</i>
                </p>
              </div>
              <div className="VideoBox">
                <iframe
                  src={`https://www.youtube.com/embed/${video ? video : ""}`}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="video"
                />
              </div>
            </div>
          </div>
          <div className="recommendedBox">
            <p className="titleOfRecommendation">Recommended:</p>
            <div className="recommendedBox_list">
              {recommended.results.map(
                ({
                  id,
                  original_title,
                  overview,
                  poster_path,
                  original_language,
                  vote_average,
                  genre_ids,
                }) => (
                  <RecommendCard
                    key={id}
                    id={id}
                    original_title={original_title}
                    overview={overview}
                    poster_path={poster_path}
                    original_language={original_language}
                    vote_average={vote_average}
                    genre_ids={genre_ids}
                  />
                )
              )}
            </div>
          </div>
        </div>
      ) : (
        <Spinner />
      )}
    </>
  );
}

export default FilmPage;
