# Documentación del Super Admin Dashboard (Quantum Web)

Este documento contiene la información necesaria para que un desarrollador móvil pueda integrar las funcionalidades del dashboard administrativo del Super Admin.

---

## 📁 Estructura de Archivos

### Componentes Principales
```
src/app/pages/Quantum Web/dashboard-admin/
├── components-admin/
│   ├── layout-adm/          # Layout principal
│   ├── sidebar-adm/         # Menú lateral
│   └── navar-adm/           # Barra de navegación
└── views-admin/
    ├── inicio-adm/          # Dashboard principal
    ├── hoteles-adm/         # Gestión de hoteles
    ├── pagos-adm/           # Historial de pagos
    ├── premium-adm/         # Usuarios premium
    ├── vip-adm/             # Usuarios VIP
    ├── graficas-adm/        # Gráficos/Estadísticas
    ├── servicios-adm/      # Servicios
    └── config-adm/          # Configuración
```

---

## 🔗 Endpoints del Backend

### Hoteles
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/hotels/all` | Obtiene todos los hoteles |
| GET | `/api/hotels/{id}` | Obtiene un hotel por ID |
| POST | `/api/hotels/create` | Crea un hotel |
| PATCH | `/api/hotels/{id}` | Actualiza un hotel |

### Pagos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/payment-booking/all` | Obtiene todos los pagos |
| GET | `/api/payment-booking/premium` | Obtiene usuarios premium |
| GET | `/api/payment-booking/vip` | Obtiene usuarios VIP |

### Usuarios (Super Admin)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/super-admin/{id}` | Obtiene datos del super admin |

---

## 📊 Detalle de cada Vista

### 1. Inicio (Dashboard Principal)
**Archivo:** `inicio-adm.component.ts`

**Endpoints utilizados:**
- `GET /api/hotels/all`
- `GET /api/payment-booking/premium`
- `GET /api/payment-booking/vip`

**Datos que procesa:**
```typescript
hotel: hotels[] = [];           // Todos los hoteles
premiumUsers: any[] = [];       // Usuarios premium
vipUsers: any[] = [];           // Usuarios VIP
totalPriceVip: number = 0;       // Suma de precios VIP
totalPricePremium: number = 0;   // Suma de precios premium
```

**Datos que muestra:**
- Ingresos VIP (total de precios de usuarios VIP)
- Ingresos Premium (total de precios de usuarios premium)
- Hoteles Activos (total de hoteles en el sistema)

**Lógica:**
1. Carga todos los hoteles
2. Para cada usuario premium/VIP, busca el nombre del hotel usando `hotel_id`
3. Calcula el total sumando el campo `price` de cada usuario

---

### 2. Hoteles
**Archivo:** `hoteles-adm.component.ts`

**Endpoints utilizados:**
- `GET /api/hotels/all`

**Datos que procesa:**
```typescript
Hotels: hotels[] = [];
searchTerm: string = '';
itemsPerPage: number = 10;
currentPage: number = 1;
```

**Funcionalidades:**
- Listado de hoteles con paginación
- Búsqueda por: name, description, city, country, address, email, phone

**Interfaz hotels:**
```typescript
interface hotels {
  id: number;
  name: string;
  description?: string;
  type_accomodation?: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  image?: string;
}
```

---

### 3. Pagos
**Archivo:** `pagos-adm.component.ts`

**Endpoints utilizados:**
- `GET /api/payment-booking/all`

**Datos que procesa:**
```typescript
payments: paymentService[] = [];
balanceTotal: number = 0;
```

**Funcionalidades:**
- Muestra todos los pagos del sistema
- Calcula el balance total (suma de todos los `price`)

**Interfaz paymentService:**
```typescript
interface paymentService {
  id?: number;
  payment_date?: Date;
  status?: string;
  price?: number;
  payment_method?: string;
  reservationId?: number;
  [key: string]: any;
}
```

---

### 4. Premium
**Archivo:** `premium-adm.component.ts`

**Endpoints utilizados:**
- `GET /api/payment-booking/premium`

**Datos que procesa:**
```typescript
payments: paymentService[] = [];
totalBalance: number = 0;
itemsPerPage: number = 10;
currentPage: number = 1;
```

**Funcionalidades:**
- Lista de usuarios con membresía premium
- Paginación
- Calcula ingresos totales premium

---

### 5. VIP
**Archivo:** `vip-adm.component.ts`

**Endpoints utilizados:**
- `GET /api/payment-booking/vip`

**Funcionalidades:**
- Lista de usuarios con membresía VIP
- Paginación
- Calcula ingresos totales VIP

---

## 🔧 Servicios del Frontend

### HotelsService
```typescript
// src/app/service/hotels.service.ts
private apiUrl = "http://localhost:3000/api/hotels";

getHotels(): Observable<hotels[]>
getHotelById(id: number): Observable<hotels>
createHotel(hotel: hotels): Observable<hotels>
updateHotel(hotel: hotels, id: number): Observable<hotels>
```

### PaymentServiceService
```typescript
// src/app/service/payment-service.service.ts
private apiUrl = "http://localhost:3000/api/payment-booking";

findAll(): Observable<paymentService[]>
findPremiumUsers(): Observable<paymentService[]>
findVipUsers(): Observable<paymentService[]>
```

### SuperAdminService
```typescript
// src/app/service/super-admin.service.ts
apiUrl = "http://localhost:3000/api/super-admin";

findAllsuperAdminById(id: number): Observable<any>
```

---

## 📱 Para el Desarrollador Móvil

### Recomendaciones de Integración

1. **Autenticación:**
   - El Super Admin usa `POST /api/auth/login-super-admin`
   - Debe guardar el token y el ID del usuario

2. **Headers requeridos:**
   ```json
   {
     "Content-Type": "application/json",
     "Authorization": "Bearer {token}"
   }
   ```

3. **Estructura de respuesta típica:**
   ```json
   // Hoteles
   [
     {
       "id": 1,
       "name": "Hotel Dorado Plaza",
       "description": "...",
       "city": "Bogotá",
       "country": "Colombia",
       "address": "...",
       "phone": "...",
       "email": "..."
     }
   ]

   // Pagos
   [
     {
       "id": 1,
       "payment_date": "2026-05-15",
       "status": "confirmed",
       "price": 500000,
       "payment_method": "visa",
       "reservationId": 1
     }
   ]
   ```

4. **Errores comunes:**
   - 401 (Unauthorized): Token expirado o inválido
   - 404 (Not Found): El recurso no existe
   - 500 (Internal Server Error): Error en el servidor

---

## 🎯 Flujo de Datos General

```
1. Usuario se autentica como Super Admin
   POST /api/auth/login-super-admin

2. Carga el dashboard (inicio)
   GET /api/hotels/all          → Lista de hoteles
   GET /api/payment-booking/premium  → Usuarios premium
   GET /api/payment-booking/vip      → Usuarios VIP

3. El frontend procesa:
   - Asocia cada pago con su hotel (usando hotel_id)
   - Calcula totales de ingresos
   - Muestra paginación si es necesario
```

---

## 📋 Notas Importantes

1. **El dashboard muestra TODOS los hoteles del sistema** (no filtra por ningún admin)
2. **Los usuarios premium/VIP son aquellos con reservas activas** en el sistema
3. **El campo `price` es el valor del pago** (en la moneda configurada)
4. **La paginación se maneja en el frontend** para algunos componentes

---

## 🆘 Soporte

Si el desarrollador móvil tiene dudas sobre:
- **Autenticación:** Consultar el servicio de login
- **Estructura de datos:** Referirse a las interfaces en `src/app/interface/`
- **Endpoints:** Verificar que el backend esté corriendo en `localhost:3000`

---

*Documentación generada para el proyecto Quantum ProAula*
*Versión: 1.0 - Mayo 2026*