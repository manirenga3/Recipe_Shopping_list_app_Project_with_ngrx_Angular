import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { HotToastService } from '@ngneat/hot-toast';
import { Store } from '@ngrx/store';

import * as fromApp from '../../store/app.reducer';
import * as RecipesActions from '../store/recipe.actions';

import { Recipe } from '../recipe-model';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css'],
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  id: number;
  editMode: boolean = false;
  recipeForm: FormGroup;
  private storeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toast: HotToastService,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.editMode = params['id'] != null;
      this.initForm();
    });
  }

  onSubmit() {
    this.toast.loading(`${this.editMode ? 'Updating' : 'Saving'} recipe...`, {
      duration: 1000,
    });
    setTimeout(() => {
      if (this.editMode) {
        this.store.dispatch(
          new RecipesActions.UpdateRecipe({
            index: this.id,
            newRecipe: this.recipeForm.value,
          })
        );
      } else {
        this.store.dispatch(
          new RecipesActions.AddRecipe(this.recipeForm.value)
        );
      }
      this.toast.success(
        `Recipe ${this.editMode ? 'updated' : 'saved'} successfully`
      );
      this.onClear();
      this.onCancel();
    }, 1000);
  }

  onClear() {
    this.recipeForm.reset();
    this.editMode = false;
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  get controls() {
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

  onAddIngredient() {
    const newControl = new FormGroup({
      name: new FormControl(null, Validators.required),
      amount: new FormControl(null, [Validators.required, Validators.min(1)]),
    });
    (<FormArray>this.recipeForm.get('ingredients')).push(newControl);
  }

  onDeleteIngredient(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
  }

  private initForm() {
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    let recipeIngredients = new FormArray([]);

    if (this.editMode) {
      this.storeSub = this.store
        .select('recipes')
        .pipe(
          map((recipesData) => {
            return recipesData.recipes.find((recipe, index) => {
              return index === this.id;
            });
          })
        )
        .subscribe((recipe: Recipe) => {
          recipeName = recipe.name;
          recipeImagePath = recipe.imagePath;
          recipeDescription = recipe.description;
          if (recipe['ingredients']) {
            for (let ingredient of recipe.ingredients) {
              recipeIngredients.push(
                new FormGroup({
                  name: new FormControl(ingredient.name, Validators.required),
                  amount: new FormControl(ingredient.amount, [
                    Validators.required,
                    Validators.min(1),
                  ]),
                })
              );
            }
          }
        });
    }

    this.recipeForm = new FormGroup({
      name: new FormControl(recipeName, Validators.required),
      imagePath: new FormControl(recipeImagePath, Validators.required),
      description: new FormControl(recipeDescription, Validators.required),
      ingredients: recipeIngredients,
    });
  }

  ngOnDestroy(): void {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }
}
