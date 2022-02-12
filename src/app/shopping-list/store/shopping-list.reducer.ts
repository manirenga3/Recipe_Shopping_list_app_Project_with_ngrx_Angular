import * as ShoppingListActions from './shopping-list.actions';

import { Ingredient } from 'src/app/shared/ingredient.model';

export interface State {
  ingredients: Ingredient[];
  editingIngredient: Ingredient;
  editingIngredientIndex: number;
}

const initialState: State = {
  // ingredients: [new Ingredient('Apples', 5), new Ingredient('Tomatoes', 10)],
  ingredients: [],
  editingIngredient: null,
  editingIngredientIndex: -1,
};

export function shoppingListReducer(
  state: State = initialState,
  action: ShoppingListActions.ShoppingListActions
) {
  switch (action.type) {
    case ShoppingListActions.ADD_INGREDIENT:
      return {
        ...state,
        ingredients: [...state.ingredients, action.payload],
      };

    case ShoppingListActions.ADD_INGREDIENTS:
      return {
        ...state,
        ingredients: [...state.ingredients, ...action.payload],
      };

    case ShoppingListActions.START_EDIT:
      return {
        ...state,
        editingIngredient: { ...state.ingredients[action.payload] },
        editingIngredientIndex: action.payload,
      };

    case ShoppingListActions.STOP_EDIT:
      return {
        ...state,
        editingIngredient: null,
        editingIngredientIndex: -1,
      };

    case ShoppingListActions.UPDATE_INGREDIENT:
      const ingredient = state.ingredients[state.editingIngredientIndex];
      const updatedIngredient = {
        ...ingredient,
        ...action.payload,
      };
      const updatedIngredients = [...state.ingredients];
      updatedIngredients[state.editingIngredientIndex] = updatedIngredient;
      return {
        ...state,
        ingredients: updatedIngredients,
        editingIngredient: null,
        editingIngredientIndex: -1,
      };

    case ShoppingListActions.DELETE_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.filter((ing, index) => {
          return index !== state.editingIngredientIndex;
        }),
        editingIngredient: null,
        editingIngredientIndex: -1,
      };

    default:
      return state;
  }
}
