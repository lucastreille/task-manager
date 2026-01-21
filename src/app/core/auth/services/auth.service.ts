import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, ROLE } from '../../models/auth.model';

const TOKEN_KEY = 'access_token';

type JwtPayload = {
  username?: string;
  sub?: string;
  preferred_username?: string;
  role?: string;
  roles?: string[];
  [key: string]: unknown;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;

    // base64url -> base64
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  token = this._token.asReadonly();

  isLoggedIn = computed(() => !!this._token());

  // username “dynamique” depuis le token
  username = computed(() => {
    const t = this._token();
    if (!t) return null;

    const payload = decodeJwtPayload(t);
    if (!payload) return null;

    // adapte selon TON JWT (souvent username ou sub)
    return (
      (payload.username as string | undefined) ??
      (payload.preferred_username as string | undefined) ??
      (payload.sub as string | undefined) ??
      null
    );
  });

  login(payload: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, payload)
      .pipe(tap((res) => this.setToken(res.access_token)));
  }

  register(payload: RegisterRequest) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, payload)
      .pipe(tap((res) => this.setToken(res.access_token)));
  }

  logout(): void {
    this.clearToken();
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }

  private clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
  }

  role = computed(() => {
    const t = this._token();
    if (!t) return null;

    const payload = decodeJwtPayload(t);
    if (!payload) return null;

    const raw =
      (payload.role as string | undefined) ??
      (Array.isArray(payload.roles) ? String(payload.roles[0]) : undefined) ??
      null;

    if (raw === ROLE.ADMIN) return ROLE.ADMIN;
    if (raw === ROLE.USER) return ROLE.USER;

    return null;
  });

  isAdmin = computed(() => this.role() === ROLE.ADMIN);

}
