import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  loadAll() {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }
}
