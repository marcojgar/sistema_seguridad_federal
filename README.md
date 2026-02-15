# 🌐 IoT Device Management System
## Implementación de Soluciones IoT

![Status](https://img.shields.io/badge/status-completed-success)
![Frontend](https://img.shields.io/badge/frontend-HTML%2C%20JS%2C%20Bootstrap%205-blue)
![API](https://img.shields.io/badge/API-MockAPI-orange)
![Architecture](https://img.shields.io/badge/architecture-REST-lightgrey)
![License](https://img.shields.io/badge/license-Academic-informational)

---

## 📌 Descripción General

Este proyecto implementa un sistema web completo para la **administración, control y monitoreo en tiempo real de dispositivos IoT**, utilizando una arquitectura REST con persistencia en MockAPI mediante una sola colección.

La solución permite:

- CRUD completo de dispositivos IoT
- Control de dispositivos mediante interruptores
- Registro persistente de eventos (logs)
- Monitoreo gráfico en tiempo real
- Tabla con los últimos 10 estados
- Refresco automático cada 2 segundos
- Diseño responsivo con Bootstrap 5

---

# 🎯 Objetivo Académico

Desarrollar una solución IoT funcional que cumpla con los siguientes requisitos:

- ✔ Mínimo 3 dispositivos IoT  
- ✔ Base de datos en MockAPI  
- ✔ Uso de una sola colección  
- ✔ CRUD completo  
- ✔ Control por interruptores  
- ✔ Sección gráfica de monitoreo  
- ✔ Tabla con últimos 10 estados  
- ✔ Refresco automático (2 segundos)  
- ✔ Uso de Bootstrap 5  
- ✔ Implementación de reglas lógicas reales  
- ✔ Proyecto original  

---

# 🏗 Arquitectura del Sistema

El sistema sigue una arquitectura cliente-servidor basada en REST


---

# 🧩 Componentes del Sistema

## 1️⃣ Administración (CRUD)

Permite:

- Crear dispositivos
- Editar dispositivos
- Eliminar dispositivos
- Listar dispositivos
- Validar campos obligatorios

---

## 2️⃣ Control de Dispositivos

Permite:

- Encender y apagar dispositivos mediante interruptores (switch)
- Visualizar el estado actual
- Generar automáticamente un log en cada cambio
- Actualizar el dispositivo en la base de datos

---

## 3️⃣ Monitoreo en Tiempo Real

Incluye:

- Indicadores gráficos dinámicos
- Tabla con los últimos 10 eventos por dispositivo
- Refresco automático cada 2 segundos
- Actualización sin recargar la página

---

# 🗄 Base de Datos (Una Sola Colección)

Se utiliza una única colección en MockAPI.

Cada documento representa un dispositivo y contiene su propio historial de eventos.

---

## 📦 Modelo de Datos

```json
{
  "id": "1",
  "nombre": "Sensor de Temperatura",
  "tipo": "Sensor",
  "ubicacion": "Laboratorio",
  "estado": true,
  "logs": [
    {
      "fecha": "2026-02-15T18:22:10.000Z",
      "estado": true
    },
    {
      "fecha": "2026-02-15T18:20:05.000Z",
      "estado": false
    }
  ]
}
