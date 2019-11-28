import { Component } from '@angular/core';

import {NavController, Platform} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {AlertService} from './services/alert.service';
import {AuthService} from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: 'home'
    },
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'List',
      url: '/list',
      icon: 'list'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private navCtrl: NavController,
    private alertService: AlertService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.authService.getToken();
      this.splashScreen.hide();
    });
  }

  logout() {
    this.authService.logout();
    this.navCtrl.navigateRoot('/landing');
 /*   this.authService.logout().subscribe(
        data => {
          this.alertService.presentToast(data['message']);
        },
        error => {
          console.log(error);
        },
        () => {
          this.navCtrl.navigateRoot('/landing');
        }
    );*/
  }
}
