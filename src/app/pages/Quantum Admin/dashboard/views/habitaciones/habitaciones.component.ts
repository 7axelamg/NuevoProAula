import { Component } from "@angular/core";
import { rooms } from "../interfaces/rooms.interface";
import { RoomsService } from "../../../../../service/rooms.service";

@Component({
  selector: "app-habitaciones",
  standalone: false,
  templateUrl: "./habitaciones.component.html",
  styleUrl: "./habitaciones.component.css",
})
export class HabitacionesComponent {
  Rooms: rooms[] = [];
  filteredRooms: rooms[] = [];
  totalRooms: number = 0;
  freeRooms: number = 0;
  busyRooms: number = 0;
  bookedRooms: number = 0;
  isModalOpen: boolean = false;
  isModalDetailsOpen: boolean = false;
  isEditing: boolean = false;
  selectedRoom: any = null;
  newRoom: Partial<rooms> = {};
  selectedFile: File | null = null;
  AdminId = Number(localStorage.getItem("token"));
  currentPage = 1;
  pageSize = 15; // Puedes ajustar esto según tus necesidades
  public Math = Math;

  constructor(private roomServices: RoomsService) {}

  ngOnInit() {
    //this.findAll();
    console.log(localStorage.getItem("hotel"));
    this.findAllRooms();
  }

  findAllRooms() {
    const hotelId = Number(localStorage.getItem("hotel"));
    this.roomServices.getRoomByHotel(hotelId).subscribe({
      next: (rooms) => {
        this.Rooms = rooms;
        this.filteredRooms = [...this.Rooms];
        this.calculateRoomStats();
      },
      error: (err) => {
        console.error("Error al obtener las habitaciones:", err);
        this.Rooms = [];
        this.filteredRooms = [];
        this.resetRoomStats();
        alert("Error al obtener las habitaciones");
      },
    });
  }

  findAll() {
    this.roomServices.getRooms().subscribe({
      next: (rooms) => {
        this.Rooms = rooms;
        this.filteredRooms = [...this.Rooms];
        this.calculateRoomStats();
      },
      error: (err) => {
        console.error("Error al obtener las habitaciones:", err);
        this.Rooms = [];
        this.filteredRooms = [];
        this.resetRoomStats();
        alert("Error al obtener las habitaciones");
      },
    });
  }

  findByName(name: string): void {
    this.roomServices.getRoomByName(name).subscribe({
      next: (room) => {
        this.filteredRooms = [room];
        console.log(this.filteredRooms);
      },
      error: (err) => {
        console.error("Error al obtener la habitación:", err);
        this.filteredRooms = [];
      },
    });
  }

  onSearch(event: Event): void {
    const input = (event.target as HTMLInputElement).value.trim();

    if (!input) {
      this.filteredRooms = [...this.Rooms];
      return;
    }

    this.filteredRooms = [];

    const isName = /^[a-zA-Z0-9\s]+$/.test(input);

    if (isName) {
      this.findByName(input);
    }
  }

  onFilterByStatus(event: Event): void {
    const selectedStatus = (event.target as HTMLSelectElement).value;
    if (!selectedStatus) {
      this.filteredRooms = [...this.Rooms];
      return;
    }
    this.roomServices.getRoomByStatus(selectedStatus).subscribe({
      next: (rooms) => {
        this.filteredRooms = rooms;
        console.log(this.filteredRooms);
      },
      error: (err) => {
        console.error("Error al filtrar habitaciones por estado:", err);
        this.filteredRooms = [];
      },
    });
  }

  calculateRoomStats(): void {
    this.totalRooms = this.Rooms.length;
    this.freeRooms = this.Rooms.filter((room) => room.status === "free").length;
    this.busyRooms = this.Rooms.filter((room) => room.status === "busy").length;
    this.bookedRooms = this.Rooms.filter(
      (room) => room.status === "booked",
    ).length;
  }

  resetRoomStats(): void {
    this.totalRooms = 0;
    this.freeRooms = 0;
    this.busyRooms = 0;
    this.bookedRooms = 0;
  }

  openModal(): void {
    this.isModalOpen = true;
    console.log("Abriendo modal de creación de habitación");
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.newRoom = {};
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log("Archivo seleccionado:", this.selectedFile);
    }
  }

  createRoom(): void {
    const hotelId = Number(localStorage.getItem("hotel"));
    if (!hotelId) {
      console.error("Hotel ID is missing");
      alert("No se puede crear la habitación porque falta el ID del hotel.");
      return;
    }

    // Construir payload "limpio"
    const payload: Record<string, string> = {
      name: String(this.newRoom.name || ""),
      description: String(this.newRoom.description || ""),
      price:
        this.newRoom.price !== undefined && this.newRoom.price !== null
          ? String(this.newRoom.price)
          : "",
      ability:
        this.newRoom.ability !== undefined && this.newRoom.ability !== null
          ? String(this.newRoom.ability)
          : "",
      status: String((this.newRoom as any).status || "free"),
      hotelId: String(hotelId),
    };

    const formData = new FormData();
    Object.keys(payload).forEach((k) => formData.append(k, payload[k]));

    if (this.selectedFile) {
      formData.append("image", this.selectedFile, this.selectedFile.name);
    }

    // DEBUG: imprimir pares del FormData para verificar lo que llega al servidor
    for (const pair of formData.entries()) {
      console.log("formData ->", pair[0], pair[1]);
    }

    // Llamar al servicio para crear la habitación
    this.roomServices.createRoom(formData).subscribe({
      next: (room) => {
        console.log("Habitación creada:", room);
        this.closeModal();
        this.findAllRooms(); // Actualiza la lista de habitaciones
      },
      error: (err) => {
        console.error("Error al crear la habitación:", err);
        if (err?.error?.message) {
          console.error(
            "Mensajes de validación del backend:",
            err.error.message,
          );
          alert(
            "Errores:\n" +
              (Array.isArray(err.error.message)
                ? err.error.message.join("\n")
                : err.error.message),
          );
        }
      },
    });
  }

  showDeatils(roomId: number): void {
    this.roomServices.getRoomById(roomId).subscribe({
      next: (room) => {
        this.selectedRoom = room;
        console.log(this.selectedRoom);
        if (
          this.selectedRoom.image &&
          !this.selectedRoom.image.startsWith("http")
        ) {
          const baseUrl = "http://localhost:3000/uploads/rooms";
          this.selectedRoom.image = `${baseUrl}/${this.selectedRoom.image}`;
        }
        this.openDetaislModal();
      },
      error: (err) => {
        console.error("Error al obtener la habitación:", err);
        this.selectedRoom = null;
      },
    });
  }

  openDetaislModal(): void {
    this.isModalDetailsOpen = true;
    console.log("Abriendo modal de detalles de habitación");
  }

  closeDetaislModal(): void {
    this.isModalDetailsOpen = false;
    this.selectedRoom = null;
  }

  editRoom(): void {
    if (!this.selectedRoom) {
      console.error("No hay habitación seleccionada para editar");
      return;
    }

    const formData = new FormData();
    formData.append("name", this.selectedRoom.name || "");
    formData.append("description", this.selectedRoom.description || "");
    formData.append("price", this.selectedRoom.price?.toString() || "");
    formData.append("ability", this.selectedRoom.ability?.toString() || "");

    if (this.selectedFile) {
      formData.append("image", this.selectedFile);
    }

    this.roomServices.updateRoom(this.selectedRoom.id, formData).subscribe({
      next: (udpdateRoom) => {
        this.Rooms = this.Rooms.map((room) =>
          room.id === udpdateRoom.id ? udpdateRoom : room,
        );
        this.filteredRooms = this.Rooms;
        console.log("Habitación actualizada:", udpdateRoom);
        this.closeEditModal();
        this.findAll();
      },
      error: (err) => {
        console.error("Error al actualizar la habitación:", err);
        this.filteredRooms = this.Rooms;
      },
    });
  }

  openEditModal(roomId: number): void {
    this.roomServices.getRoomById(roomId).subscribe({
      next: (room) => {
        this.selectedRoom = room;

        if (
          this.selectedRoom.image &&
          !this.selectedRoom.image.startsWith("http")
        ) {
          const baseUrl = "http://localhost:3000/uploads/rooms";
          this.selectedRoom.image = `${baseUrl}/${this.selectedRoom.image}`;
        }

        this.isEditing = true;
        console.log("Datos de la habitación cargados para edición:", room);
      },
      error: (err) => {
        console.error("Error al obtener los datos de la habitación:", err);
      },
    });
  }

  closeEditModal(): void {
    this.isEditing = false;
    this.selectedRoom = null;
  }

  onPageChange(page: number): void {
    console.log("Cambiando a página:", page);
    this.currentPage = page;
  }

  // Este método es opcional, puedes usarlo en lugar del pipe slice
  get pagedClients(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const result = this.Rooms.slice(start, Math.min(end, this.Rooms.length));
    console.log(
      `Mostrando ${result.length} Habitaciones de ${this.Rooms.length} (página ${this.currentPage})`,
    );
    return result;
  }

  get totalPages(): number {
    return Math.ceil(this.Rooms.length / this.pageSize);
  }
}
