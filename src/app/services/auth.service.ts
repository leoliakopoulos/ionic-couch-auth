import { Injectable } from '@angular/core';
import {Platform, ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {EnvService} from './env.service';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import { Storage } from '@ionic/storage';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import {User} from '../model/user';
import * as Nano from 'nano';
import * as nano from 'nano';
import {Querystring} from 'request/lib/querystring.js';
import * as cookie from 'cookie';
import {Observable} from 'rxjs';
import {CookieService} from 'ngx-cookie-service';
import {createConsoleLogger} from '@angular-devkit/core/node';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = false;
  token: any;
  _users: any;
  myCookie: any;
  constructor(private http: HttpClient,
             // private storage: NativeStorage,
              private env: EnvService,
              private router: Router,
              private toastController: ToastController,
              private cookieService: CookieService,
              private platform: Platform,
              private storage: Storage) {
      Querystring.prototype.unescape = val => val;
      const nano = Nano(this.env.API_URL);
      this._users = nano.use('_users');

  }



     login(email: String, password: String)  {
                        const headers = new HttpHeaders({
                            'Content-Type': 'application/json',
                             observe: 'response'
                            });

                        return this.http.post(this.env.API_URL + '/_session' , { username : email,  password}, { observe: 'response' , withCredentials: true} )
                                    .pipe(tap(response =>  {

                                       // this.myCookie = response.headers.keys;
                                        this.myCookie = response.headers.get('set-cookie');
                                        console.log('cookie :' +  JSON.stringify(response.headers.get('set-cookie')));
                                        this.storage.set('token', this.myCookie)
                                            .then(
                                                () => {
                                                    console.log('Token Stored : ' + this.myCookie);
                                                },
                                                error => console.error('Error storing item', error)
                                            );
                                        this.token = this.myCookie;
                                        this.isLoggedIn = true;


                                      //  console.log(JSON.stringify('all the headers :' + response.headers.getAll));
                                        response = this.myCookie;

                                        return this.myCookie;


                    }));
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
      return new Observable( this._users.insert(user, 'org.couchdb.user:' + email, (err, body) => {
          if (err) { console.log(err); }
          console.log(body);
          // {
          //   ok: true,
          //   id: 'org.couchdb.user:john',
          //   rev: '1-88146d8127296b34714569043cbac455'
          // }
      }));


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
      this.storage.remove('token');
      this.isLoggedIn = false;
      delete this.token;
  /*  const headers = new HttpHeaders({
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
        );*/
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
    return this.storage.get('token').then(
        data => {
          this.token = data;

          if (this.token != null) {
            this.isLoggedIn = true;
            console.log('token on start up:' + JSON.stringify(this.token));
          } else {
            this.isLoggedIn = false;
          }
        },
        error => {
          console.log('token on start up error: ' + JSON.stringify(this.token));
          this.token = null;
          this.isLoggedIn = false;
        }
    );
  }
}
