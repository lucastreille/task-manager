export interface Credentials {
    username: string;
    password: string;
    role: ROLE;
}

export enum ROLE {
    ADMIN = 'ADMIN',
    USER = 'USER'
}