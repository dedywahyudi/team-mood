import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { TeamsPage } from './teams';

// app components module
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    TeamsPage,
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    IonicPageModule.forChild(TeamsPage),
  ],
})
export class TeamsPageModule {}
