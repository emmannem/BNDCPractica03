import { Component, OnInit, ViewChild } from '@angular/core';
import { Persona } from './models/persona.model';
import { PersonaService } from './services/persona.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  personaDialog!: boolean;
  personas: Persona[] = [];
  persona!: Persona;
  selectedPersona: Persona[] = [];
  submitted!: boolean;

  @ViewChild('dt') dt: Table | undefined;

  constructor(
    private personaService: PersonaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadPersonas();
  }

  loadPersonas(): void {
    this.personaService.getPersonas().subscribe({
      next: (data: Persona[]) => (this.personas = data),
      error: (err) => console.error(err),
    });
  }

  openNew() {
    this.persona = {
      id: '',
      nombre: '',
      direccion: '',
      telefono: '',
    };

    this.submitted = false;
    this.personaDialog = true;
  }

  editPersona(persona: Persona) {
    this.persona = { ...persona };
    this.personaDialog = true;
  }

  deletePersona(persona: Persona) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar a ' + persona.nombre + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.personaService.deletePersona(persona.id!).subscribe({
          next: () => {
            this.personas = this.personas.filter(
              (val) => val.id !== persona.id
            );
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Persona Eliminada',
              life: 3000,
            });
          },
          error: (err) => console.error(err),
        });
      },
    });
  }

  deleteSelectedPersonas() {
    this.confirmationService.confirm({
      message:
        '¿Estás seguro de que deseas eliminar las personas seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.selectedPersona.forEach((persona) => {
          this.personaService.deletePersona(persona.id!).subscribe({
            next: () => {
              this.personas = this.personas.filter(
                (val) => val.id !== persona.id
              );
            },
            error: (err) => console.error(err),
          });
        });
        this.selectedPersona = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Personas Eliminadas',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.personaDialog = false;
    this.submitted = false;
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.personas.length; i++) {
      if (this.personas[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  savePersona() {
    this.submitted = true;

    if (this.persona.nombre?.trim()) {
      if (this.persona.id) {
        // Actualizar persona existente
        this.personaService
          .updatePersona(this.persona.id, this.persona)
          .subscribe({
            next: (data) => {
              const index = this.findIndexById(this.persona.id!);
              if (index !== -1) {
                this.personas[index] = data;
              }
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Persona Actualizada',
                life: 3000,
              });
              this.personaDialog = false;
              this.persona = {} as Persona;
            },
            error: (err) => console.error(err),
          });
      } else {
        // Crear nuevo persona
        this.personaService.savePersona(this.persona).subscribe({
          next: (data) => {
            this.personas.push(data);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Persona Creada',
              life: 3000,
            });
            this.personaDialog = false;
            this.persona = {} as Persona;
          },
          error: (err) => console.error(err),
        });
      }
    }
  }

  filterGlobal(event: Event) {
    if (this.dt) {
      this.dt.filterGlobal(
        (event.target as HTMLInputElement).value,
        'contains'
      );
    }
  }
}
