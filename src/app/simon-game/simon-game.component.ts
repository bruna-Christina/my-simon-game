import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent, DialogResponse } from '../shared/dialog/dialog.component';
import { MatSnackBar } from '@angular/material';
import { ScoreService } from '../score.service';

@Component({
  selector: 'app-simon-game',
  templateUrl: './simon-game.component.html',
  styleUrls: ['./simon-game.component.scss']
})
export class SimonGameComponent {

  constructor(
    public dialog: MatDialog,
    public matSnackBar: MatSnackBar,
    private scoreService: ScoreService
  ) { }

  private gameMemory:string[] = null;
  private userMemory:string[] = null;
  
  public loading: boolean = false;
  public disableStartBtn:boolean = false;
  public disableColorBtn:boolean = true;
  public gameScore:number = 0;
  private static WAITING_TIME:number = 850;
  private static COLORS:string[] = ['green','red','blue','yellow'];
  private static WRONG_SOUND_ID:string = 'audio_sound_wrong';
  private static BTN_COLOR_MAP:{[color:string]:{btn:string,sound:string}} = {
    'green':{
      btn:'btn-green',
      sound:'simon_sound_green.mp3'
    },
    'red':{
      btn:'btn-red',
      sound:'simon_sound_red.mp3'
    },
    'blue':{
      btn:'btn-blue',
      sound:'simon_sound_blue.mp3'
    },
    'yellow':{
      btn:'btn-yellow',
      sound:'simon_sound_yellow.mp3'
    }
  };

  private getAnimationTime(level:number):number{
    let time = 600;
    if(level > 4){
      time = 450;
    }
    if(level > 8){
      time = 300;
    }
    return time;
  }

  private resetGame(){
    this.gameMemory = null;
    this.userMemory = null;
    this.gameScore = 0;
    this.disableColorBtn = true;
    this.disableStartBtn = false;
  }

  private addColorToMemory(){
    const index = Math.floor(Math.random() * SimonGameComponent.COLORS.length);
    if(this.gameMemory === null){
      this.gameMemory = [];
    }
    this.gameMemory.push(SimonGameComponent.COLORS[index]);
  }

  private playGameMemory(){
    console.log('Play Memory', this.gameMemory);
    if(this.gameMemory === null){
      return;
    }
    this.disableColorBtn = true;
    const animationTime = this.getAnimationTime(this.gameMemory.length);
    this.triggerAnimation(this.gameMemory, 0, animationTime);
  }

  private playSound(color:string): void{
    const soundId = this.getColorSoundId(color);
    const audioDom = document.getElementById(soundId) as HTMLAudioElement;
    audioDom.play();
  }

  private triggerAnimation(listBtn:string[], index:number,animationTime: number){
    if(index <= listBtn.length - 1){
      const color = listBtn[index];
      const btnId = this.getColorBtnId(color);
      document.getElementById(btnId).classList.add('btn-activated');
      this.playSound(color);
      setTimeout(()=>{
        document.getElementById(btnId).classList.remove('btn-activated');
        setTimeout(()=>{
          this.triggerAnimation(listBtn, index+1, animationTime);
        }, animationTime);
      }, 250);
    }else{
      this.disableColorBtn = false;
    }
  }

  private checkUserAnswer():boolean {
    let contGame = true;
    this.gameMemory.forEach((color, index)=>{
      if(this.userMemory[index] && color !== this.userMemory[index]){
        contGame = false;
      }
    });
    return contGame;
  }

  private playGame(){
    this.addColorToMemory();
    setTimeout(()=>{
      this.playGameMemory();
    }, SimonGameComponent.WAITING_TIME);
  }

  public onBtnStart(){
    this.disableStartBtn = true;
    this.playGame();
  }

  public onBtnColor(color:string){
    if(this.userMemory === null){
      this.userMemory = [];
    }
    this.userMemory.push(color);
    //check if user answer is correct
    const continueGame = this.checkUserAnswer();
    if(continueGame){
      this.playSound(color);
      // check if number of clicks (user memory length) = level
      if(this.userMemory.length === this.gameMemory.length){
        this.gameScore = this.gameMemory.length;
        // clean user array and next level
        this.userMemory = null;
        this.playGame();
      }
    }else{
      // game over
      const wrongAudioDom = document.getElementById(SimonGameComponent.WRONG_SOUND_ID) as HTMLAudioElement;
      wrongAudioDom.play();
      this.openDialog();
    }
  }

  public getColors():string[]{
    return SimonGameComponent.COLORS;
  }

  public getColorBtnId(color):string{
    return SimonGameComponent.BTN_COLOR_MAP[color].btn;
  }

  public getWrongAudioId(){
    return SimonGameComponent.WRONG_SOUND_ID;
  }

  public getColorSoundId(color):string{
    return 'audio_sound_'+color;
  }

  public getColorSound(color):string{
    return 'assets/' + SimonGameComponent.BTN_COLOR_MAP[color].sound;
  }

  public openDialog() {
    let dialogRef = this.dialog.open(DialogComponent, {
      data: {score:this.gameScore}
    });
    dialogRef.afterClosed().subscribe((dRes:DialogResponse) => {
      if(dRes && dRes.action){
        this.loading = true;
        this.scoreService.addScore({name:dRes.name, score:this.gameScore})
          .then((response)=>{
            this.matSnackBar.open('Score added.','Close', {
              duration: 2000,
            });
            this.loading = false;
            this.resetGame();
          })
          .catch((err) => {
            this.matSnackBar.open('Error on adding score.','Close', {
              duration: 2000,
            });
            this.loading = false;
            this.resetGame();
          });
      }else{
        this.resetGame();
      }
    });
  }

}
