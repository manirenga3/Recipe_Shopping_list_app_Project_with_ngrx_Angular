import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { switchMap, map, withLatestFrom } from 'rxjs/operators';
import { HotToastService } from '@ngneat/hot-toast';

import * as fromAPP from '../../store/app.reducer';
import * as RecipesActions from './recipe.actions';

import { Recipe } from '../recipe-model';

@Injectable()
export class RecipesEffects {
  constructor(
    private action$: Actions,
    private http: HttpClient,
    private toast: HotToastService,
    private store: Store<fromAPP.AppState>
  ) {}

  fetchRecipes = createEffect(() => {
    return this.action$.pipe(
      ofType(RecipesActions.FETCH_RECIPES),
      switchMap(() => {
        return this.http
          .get<Recipe[]>(
            'https://angular-recipe-project-udemy-default-rtdb.firebaseio.com/recipes.json'
          )
          .pipe(
            this.toast.observe({
              loading: 'Fetching recipes...',
              success: 'Recipes fetched successfully',
              error: 'There was an error',
            })
          );
      }),
      map((recipes) => {
        return recipes.map((recipe) => {
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : [],
          };
        });
      }),
      map((recipes) => {
        return new RecipesActions.SetRecipes(recipes);
      })
    );
  });

  storeRecipes = createEffect(
    () => {
      return this.action$.pipe(
        ofType(RecipesActions.STORE_RECIPES),
        withLatestFrom(this.store.select('recipes')),
        switchMap(([actionData, recipesData]) => {
          return this.http
            .put(
              'https://angular-recipe-project-udemy-default-rtdb.firebaseio.com/recipes.json',
              recipesData.recipes
            )
            .pipe(
              this.toast.observe({
                loading: 'Saving recipes...',
                success: 'Recipes saved successfully',
                error: 'There was an error',
              })
            );
        })
      );
    },
    { dispatch: false }
  );
}
