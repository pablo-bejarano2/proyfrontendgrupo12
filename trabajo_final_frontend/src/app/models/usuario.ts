export class Usuario {
  _id!: string;
  username!: string;
  password!: string;
  email!: string;
  nombres!: string;
  apellido!: string;
  rol!: string;

  constructor(
    id: string = '',
    username: string = '',
    password: string = '',
    email: string = '',
    nombres: string = '',
    apellido: string = '',
    rol: string = ''
  ) {
    this._id = id;
    this.username = username;
    this.password = password;
    this.email = email;
    this.nombres = nombres;
    this.apellido = apellido;
    this.rol = rol;
  }
}
