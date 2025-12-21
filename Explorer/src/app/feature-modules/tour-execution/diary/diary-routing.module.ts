import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiaryListComponent } from './pages/diary-list.component';
import { DiaryFormComponent } from './pages/diary-form.component';

const routes: Routes = [
  { path: '', component: DiaryListComponent },
  { path: 'new', component: DiaryFormComponent },
  { path: 'edit/:id', component: DiaryFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiaryRoutingModule {}
