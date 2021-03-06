import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
// import { connect } from 'react-redux';
import './Details.css';
import ReactPlayer from 'react-player/youtube';
import { fetchMealDetailsAPI, fetchCocktailAPI } from '../../services/ApiRequest';
import FavoriteButton from '../../Components/FavoriteButton';
import Share from '../../Components/Share';
// import { addObj } from '../../redux/actions';

class DetailsFood extends React.Component {
  constructor() {
    super();
    this.recomendar = this.recomendar.bind(this);
    this.createList = this.createList.bind(this);
    this.favoriteOk = this.favoriteOk.bind(this);
    this.buttonStartOrContinue = this.buttonStartOrContinue.bind(this);
    this.state = {
      meal: {},
      igredients: [],
      pounds: [],
      cooktails: [],
      ok: false,
    };
  }

  componentDidMount() {
    const { match } = this.props;
    const { params } = match;
    const { id } = params;
    fetchMealDetailsAPI(id)
      .then(({ meals }) => {
        this.setState({ meal: meals[0], ok: true });

        const ing = Object.keys(meals[0]).filter((key) => key.includes('strIngredient'))
          .filter((value) => meals[0][value] !== ' '
            && meals[0][value] !== '' && meals[0][value] !== null);
        this.setState({ igredients: ing });

        const pou = Object.keys(meals[0]).filter((key) => key.includes('strMeasure'))
          .filter((value) => meals[0][value] !== ' '
            && meals[0][value] !== '' && meals[0][value] !== null);
        this.setState({ pounds: pou });
      });
    fetchCocktailAPI()
      .then(({ drinks }) => {
        this.setState({ cooktails: drinks });
      });
  }

  recomendar() {
    const { cooktails } = this.state;
    const num = 5;
    return (
      <div className="Card">
        {cooktails.filter((_, i) => i <= num)
          .map((value, index) => (
            <div
              className="recomendationCard"
              key={ index }
              data-testid={ `${index}-recomendation-card` }
            >
              <img
                src={ value.strDrinkThumb }
                alt={ value.strDrink }
                className="Imagem"
              />
              <h5
                data-testid={ `${index}-recomendation-title` }
              >
                {value.strDrink}
              </h5>
              <p>{value.strAlcoholic}</p>
            </div>
          ))}
      </div>
    );
  }

  createList() {
    const { meal, pounds, igredients } = this.state;
    return (
      <ol>
        {igredients.map((value, index) => (
          <li
            key={ index }
            data-testid={ `${index}-ingredient-name-and-measure` }
          >
            {`${meal[value]} - ${meal[pounds[index]]}`}
          </li>
        ))}
      </ol>
    );
  }

  favoriteOk() {
    const { ok, meal } = this.state;
    if (ok === true) {
      return (
        <div className="detailsBtnContainer">
          <Share />
          <FavoriteButton
            obj={ {
              id: meal.idMeal,
              type: 'comida',
              area: meal.strArea,
              category: meal.strCategory,
              alcoholicOrNot: '',
              name: meal.strMeal,
              image: meal.strMealThumb,
            } }
            test="favorite-btn"
          />
        </div>
      );
    }
    return null;
  }

  buttonStartOrContinue() {
    const { meal, ok } = this.state;
    let response = '';
    if (ok === true) {
      const doneRecipes = JSON.parse(localStorage.getItem('doneRecipes'));
      const inProgressRecipes = JSON.parse(localStorage.getItem('inProgressRecipes'));
      if (doneRecipes !== null) {
        response = doneRecipes.some((recipe) => recipe.id === meal.idMeal);
        if (response === true) {
          return (
            <button
              className="invisible"
              data-testid="start-recipe-btn"
              type="button"
            >
              Continuar Receita
            </button>
          );
        }
      }
      if (inProgressRecipes !== null) {
        const keysFood = Object.keys(inProgressRecipes.meals)
          .some((key) => key === meal.idMeal);
        if (keysFood === true) {
          return (
            <Link to={ `/comidas/${meal.idMeal}/in-progress` }>
              <button
                className="fix"
                data-testid="start-recipe-btn"
                type="button"
              >
                Continuar Receita
              </button>
            </Link>
          );
        }
      }
      return (
        <Link to={ `/comidas/${meal.idMeal}/in-progress` }>
          <button
            className="fix"
            data-testid="start-recipe-btn"
            type="button"
          >
            Iniciar Receita
          </button>
        </Link>
      );
    }
  }

  render() {
    const { meal } = this.state;
    const { strCategory, strMealThumb, strMeal, strInstructions, strYoutube } = meal;
    return (
      <div className="detailsContainer">
        <h1>Detalhes</h1>
        {this.favoriteOk()}
        <img
          className="detailsIMG"
          data-testid="recipe-photo"
          src={ strMealThumb }
          alt={ strMeal }
        />
        <h2 data-testid="recipe-title">{strMeal}</h2>
        <h3 data-testid="recipe-category">{strCategory}</h3>
        {this.createList()}
        <p className="instructions" data-testid="instructions">{strInstructions}</p>
        <ReactPlayer url={ strYoutube } data-testid="video" width="100vw" height="auto" />
        {this.recomendar()}
        {this.buttonStartOrContinue()}
      </div>
    );
  }
}

DetailsFood.propTypes = {
  match: PropTypes.objectOf.isRequired,
  params: PropTypes.objectOf.isRequired,
  id: PropTypes.string.isRequired,
};

export default (DetailsFood);
