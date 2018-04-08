import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeamReportPage } from './team-report';

// app components module
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    TeamReportPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(TeamReportPage),
  ],
})
export class TeamReportPageModule {}
