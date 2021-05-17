import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailsViewComponent } from './details-view/details-view.component';
import { ListViewComponent } from './list-view/list-view.component';

const routes: Routes = [
  { path: '', component: ListViewComponent },
  { path: 'details/:id', component: DetailsViewComponent },
  { path: 'new-ticket', component: DetailsViewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
