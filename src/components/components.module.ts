import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { PipesModule } from '../pipes/pipes.module';

import { FeelSelectorComponent } from './feel-selector/feel-selector';
import { PageFooterComponent } from './page-footer/page-footer';
import { VoteFeedbackComponent } from './vote-feedback/vote-feedback';
import { CommentBoxComponent } from './comment-box/comment-box';
import { IntroductionComponent } from './introduction/introduction';
import { DonutChartComponent } from './donut-chart/donut-chart';
import { CommentsComponent } from './comments/comments';
import { TeamVotesCardComponent } from './team-votes-card/team-votes-card';
import { DateSelectorComponent } from './date-selector/date-selector';
import { WeekSelectorComponent } from './week-selector/week-selector';
import { BarChartComponent } from './bar-chart/bar-chart';
import { LineChartComponent } from './line-chart/line-chart';
import { ProfileChartComponent } from './profile-chart/profile-chart';

@NgModule({
  declarations: [
    FeelSelectorComponent,
    PageFooterComponent,
    VoteFeedbackComponent,
    CommentBoxComponent,
    IntroductionComponent,
    DonutChartComponent,
    CommentsComponent,
    TeamVotesCardComponent,
    DateSelectorComponent,
    WeekSelectorComponent,
    BarChartComponent,
    LineChartComponent,
    ProfileChartComponent,
  ],

  imports: [
    CommonModule,
    IonicModule,
    PipesModule,
  ],

  exports: [
    FeelSelectorComponent,
    PageFooterComponent,
    VoteFeedbackComponent,
    CommentBoxComponent,
    DonutChartComponent,
    IntroductionComponent,
    CommentsComponent,
    TeamVotesCardComponent,
    DateSelectorComponent,
    WeekSelectorComponent,
    BarChartComponent,
    LineChartComponent,
    ProfileChartComponent,
  ],

  entryComponents: [
    CommentBoxComponent,
    IntroductionComponent,
  ]
})
export class ComponentsModule {}
