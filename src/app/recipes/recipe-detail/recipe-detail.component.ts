import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs/operators';

import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../store/recipe.actions';
import * as ShoppingListActions from '../../shopping-list/store/shopping-list.actions';

import { Recipe } from '../recipe-model';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css'],
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toast: HotToastService,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        map((params: Params) => +params['id']),
        switchMap((id: number) => {
          this.id = id;
          return this.store.select('recipes');
        }),
        map((recipesData) => recipesData.recipes)
      )
      .subscribe((recipes: Recipe[]) => {
        this.recipe = recipes.find((recipe, index) => {
          return index === this.id;
        });
      });
  }

  onAddToShoppingList() {
    this.toast.loading('Adding to shopping list...', { duration: 1000 });
    setTimeout(() => {
      this.store.dispatch(
        new ShoppingListActions.AddIngredients(this.recipe.ingredients)
      );
      this.toast.success('Added to shopping list successfully');
    }, 1000);
  }

  onEditRecipe() {
    this.router.navigate(['edit'], { relativeTo: this.route });
    // this.router.navigate(['../', this.id, 'edit'], { relativeTo: this.route });
  }

  onDeleteRecipe() {
    this.toast.loading('Deleting recipe...', { duration: 1000 });
    setTimeout(() => {
      this.store.dispatch(new RecipesActions.DeleteRecipe(this.id));
      this.router.navigate(['/recipes']);
      this.toast.success('Recipe deleted successfully');
    }, 1000);
  }
}
