import { Injectable } from '@angular/core';
import {ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {EnvService} from './env.service';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import {User} from '../model/user';
import * as Nano from 'nano';
import * as nano from 'nano';
import {Querystring} from 'request/lib/querystring.js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = false;
  token: any;
  _users: any;
  constructor(private http: HttpClient,
              private storage: NativeStorage,
              private env: EnvService,
              private router: Router,
              private toastController: ToastController) {
      Querystring.prototype.unescape = val => val;
      this._users = nano(this.env.API_URL).use('_users');

  }

  login(email: String, password: String) {
    return this.http.post(this.env.API_URL + 'auth/login',
        {email, password}
    ).pipe(
        tap(token => {
          this.storage.setItem('token', token)
              .then(
                  () => {
                    console.log('Token Stored');
                  },
                  error => console.error('Error storing item', error)
              );
          this.token = token;
          this.isLoggedIn = true;
          return token;
        }),
    );
  }

  register(fName: String, lName: String, email: String, password: String) {
      // create a new user
      const user = {
          name: email,
           password,
          roles: [],
          type: 'user'
      };

// add dummy user to db
      return this._users.insert(user, 'org.couchdb.user:' + email, (err, body) => {
          if (err) { console.log(err); }
          console.log(body);
          // {
          //   ok: true,
          //   id: 'org.couchdb.user:john',
          //   rev: '1-88146d8127296b34714569043cbac455'
          // }
      });


/*    const headers = new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded').set('Accept', 'application/json');
    const options = {
         headers
    };
    const username = email;
    const couchbody = {
      _id: 'org.couchdb.user:' + username,
      name: fName,
      type: 'user',
      roles: [],
      password
    };
    return this.http.post(this.env.API_URL + '_users/org.couchdb.user:' + username,
        // {fName, lName, email, password}
        couchbody, options
    );*/
  }

  logout() {
    const headers = new HttpHeaders({
      Authorization: this.token.token_type + ' ' + this.token.access_token
    });

    return this.http.get(this.env.API_URL + 'auth/logout', { headers })
        .pipe(
            tap(data => {
              this.storage.remove('token');
              this.isLoggedIn = false;
              delete this.token;
              return data;
            })
        );
  }

  user() {
    const headers = new HttpHeaders({
      Authorization: this.token.token_type + ' ' + this.token.access_token
    });

    return this.http.get<User>(this.env.API_URL + 'auth/user', { headers })
        .pipe(
            tap(user => {
              return user;
            })
        );
  }

  getToken() {
    return this.storage.getItem('token').then(
        data => {
          this.token = data;

          if (this.token != null) {
            this.isLoggedIn = true;
          } else {
            this.isLoggedIn = false;
          }
        },
        error => {
          this.token = null;
          this.isLoggedIn = false;
        }
    );
  }
}
