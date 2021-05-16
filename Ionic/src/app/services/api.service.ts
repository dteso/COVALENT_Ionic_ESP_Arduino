import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router'


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
  ) { }

  getStatus(): Observable<any> {
    return this.http.get(`${environment.main_url}`,{responseType: 'text'});
  }

  post(path: string, body: {object}, headers?:any): Observable<any> {
    return this.http.post(`${environment.main_url}${path}`, body, headers);
  }
}