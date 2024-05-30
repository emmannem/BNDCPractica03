import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Persona } from '../models/persona.model';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class PersonaService {
  private apiUrl = 'http://localhost:8080/api/persona';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  getPersonas(): Observable<Persona[]> {
    return this.http
      .get<Persona[]>(this.apiUrl)
      .pipe(catchError(this.handleError.bind(this)));
  }

  savePersona(data: Persona): Observable<Persona> {
    return this.http
      .post<Persona>(this.apiUrl, data, this.httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  deletePersona(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  updatePersona(id: string, data: Persona): Observable<Persona> {
    return this.http
      .put<Persona>(`${this.apiUrl}/${id}`, data, this.httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El servidor devolvió un código de error
      errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
    }
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 5000,
    });
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
