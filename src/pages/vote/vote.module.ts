import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { VotePage } from './vote';

// app components module
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    VotePage,
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    IonicPageModule.forChild(VotePage),
  ],
  entryComponents: [
    VotePage,
  ]
})
export class VotePageModule {}
