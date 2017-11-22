import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ScoreService, Score } from '../score.service';

@Component({
  selector: 'app-game-scores',
  templateUrl: './game-scores.component.html',
  styleUrls: ['./game-scores.component.scss']
})
export class GameScoresComponent implements OnInit {

  constructor(
    private scoreService:ScoreService,
    public matSnackBar:MatSnackBar
  ) { }

  public loading: boolean = false;
  public scores:Score[] = null;

  ngOnInit() {
    this.loading = true;
    this.scoreService.getScores()
      .then((response)=>{
        response.sort((a,b) =>{
          return b.score - a.score;
        });
        this.loading = false;
        this.scores = response;
      })
      .catch((err) => {
        this.matSnackBar.open('Error getting scores.','Close', {
          duration: 2000,
        });
        this.loading = false;
      });
  }

}
