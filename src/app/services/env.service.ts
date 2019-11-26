import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  API_URL = 'http://admin:admin@localhost:5984';

  constructor() { }
}
