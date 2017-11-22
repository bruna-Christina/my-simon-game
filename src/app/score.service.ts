import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { environment } from '../environments/environment';

export interface Score{
  _id?: string;
  name: string;
  score: number;
}

@Injectable()
export class ScoreService {

  private static SERVICE_URL: string = environment.serviceUrl+'scores';

  constructor(private http: Http) { }

  public getScores():Promise<Score[]>{
    return this.http.get(ScoreService.SERVICE_URL)
      .toPromise()
      .then((response)=> {
        return response.json();
      })
      .catch((err) => {
        console.error('Error getting scores ', err);
      });
  }

  public addScore(score:Score):Promise<{msg:string}>{
    return this.http.post(ScoreService.SERVICE_URL, score)
      .toPromise()
      .then((response)=> {
        console.log('response', response)
        return response.json();
      })
      .catch((err) => {
        console.error('Error adding scores ', err);
      });
  }

}
