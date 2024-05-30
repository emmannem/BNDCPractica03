import { Component, OnInit, ViewChild } from '@angular/core';
import { Persona } from './models/persona.model';
import { PersonaService } from './services/persona.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { forkJoin } from 'rxjs';

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
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar personas',
        });
      },
    });
  }

  openNew() {
    this.persona = {
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
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar persona',
            });
          },
        });
      },
    });
  }

  deleteSelectedPersonas() {
    this.confirmationService.confirm({
      message:
        '¿Estás seguro de que deseas eliminar las personas seleccionadas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deleteRequests = this.selectedPersona.map((persona) =>
          this.personaService.deletePersona(persona.id!)
        );
        forkJoin(deleteRequests).subscribe({
          next: () => {
            this.personas = this.personas.filter(
              (val) => !this.selectedPersona.includes(val)
            );
            this.selectedPersona = [];
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Personas Eliminadas',
              life: 3000,
            });
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar personas',
            });
          },
        });
      },
    });
  }

  hideDialog() {
    this.personaDialog = false;
    this.submitted = false;
  }

  findIndexById(id: string): number {
    return this.personas.findIndex((persona) => persona.id === id);
  }

  savePersona() {
    this.submitted = true;
    console.log('Persona a guardar:', this.persona);
    if (this.persona.nombre?.trim()) {
      if (this.persona.id) {
        // Actualizar persona existente
        this.personaService
          .updatePersona(this.persona.id, this.persona)
          .subscribe({
            next: (data) => {
              console.log('Persona actualizada:', data);
              const index = this.findIndexById(this.persona.id!);
              if (index !== -1) {
                this.personas[index] = data;
              }
              console.log(
                'Lista de personas después de actualizar:',
                this.personas
              );
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Persona Actualizada',
                life: 3000,
              });
              this.personaDialog = false;
              this.persona = {} as Persona;
            },
            error: (err) => {
              console.error(err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al actualizar persona',
              });
            },
          });
      } else {
        // Crear nueva persona
        this.personaService.savePersona(this.persona).subscribe({
          next: (data) => {
            console.log('Persona creada:', data);
            this.personas.push(data);
            console.log('Lista de personas después de crear:', this.personas);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Persona Creada',
              life: 3000,
            });
            this.personaDialog = false;
            this.persona = {} as Persona;
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear persona',
            });
          },
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
