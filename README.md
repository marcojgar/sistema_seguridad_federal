# 🛡️ S.I.A.I.P.
## Sistema Inteligente de Alerta e Intervención Policial

---

## 📌 Descripción General

El **Sistema Inteligente de Alerta e Intervención Policial (S.I.A.I.P.)** es una plataforma web basada en tecnologías IoT orientada al monitoreo, control y simulación de dispositivos de seguridad en tiempo real.

El sistema integra sensores, actuadores y mecanismos automatizados de respuesta ante eventos críticos, simulando el funcionamiento de un centro de comando y control policial.

Inspirado en el enfoque estratégico de la seguridad pública federal en México, S.I.A.I.P. permite detectar intrusiones, generar alertas automáticas, activar dispositivos de respuesta y registrar eventos críticos dentro de un dashboard dinámico.

---

## 🎯 Objetivo General

Desarrollar un sistema inteligente basado en tecnologías IoT que permita la supervisión, gestión y simulación de dispositivos de seguridad, integrando mecanismos automatizados de alerta y respuesta ante eventos críticos.

---

## 🎯 Objetivos Específicos

- Implementar una aplicación web para el monitoreo en tiempo real de dispositivos IoT.
- Simular eventos de intrusión mediante sensores inteligentes.
- Automatizar la activación de dispositivos de respuesta (sirena y cerradura).
- Registrar eventos críticos en un historial dinámico.
- Generar alertas basadas en condiciones como nivel de batería.
- Visualizar estadísticas operativas mediante gráficos.
- Integrar lógica de reacción automática ante eventos de seguridad.

---

## 🧠 Arquitectura del Sistema

El sistema sigue el modelo operativo:

Detección → Notificación → Intervención → Registro

### Componentes principales:

- **Frontend:** HTML, CSS (Bootstrap), JavaScript
- **Backend simulado:** MockAPI
- **Gráficos:** Chart.js
- **Base de datos:** MockAPI REST
- **Lógica IoT:** Simulación en JavaScript

---

## 🛠️ Funcionalidades

### 🔹 Administración de Dispositivos
- Crear dispositivos IoT
- Editar información
- Eliminar dispositivos
- Gestión de estados (Activo, Inactivo, Mantenimiento)

### 🔹 Monitoreo en Tiempo Real
- Visualización dinámica de dispositivos
- Indicador de batería
- Estado operativo
- Alertas activas

### 🔹 Simulación de Intrusión

Cuando el sensor de puerta se activa:

- 🚨 Se genera notificación visual
- 🔊 Se activa la sirena automáticamente
- 🔒 Se bloquea la cerradura inteligente
- 📜 Se registra un evento especial
- 📊 Se actualiza el dashboard

### 🔹 Sistema de Alertas

Regla implementada:

Si batería < 20% → Alerta activa

Las alertas afectan:
- Color de fila en tabla
- Indicador visual
- Conteo dinámico de dispositivos en estado crítico

### 🔹 Historial de Eventos

- Últimos 10 cambios registrados
- Eventos normales (cambio de estado)
- Eventos especiales (intrusión detectada)

---

## 📊 Dashboard

Incluye:

- Gráfico tipo Doughnut con distribución de estados
- Indicador de alertas activas
- Tarjetas dinámicas de monitoreo
- Registro cronológico de eventos

---

## 🔐 Dispositivos Simulados

- Sensor de Puerta Magnético
- Sirena de Alarma
- Cerradura Inteligente

---

## 🚨 Lógica de Seguridad Implementada

Cuando ocurre una intrusión:

1. Se activa el sensor.
2. Se genera una notificación automática.
3. Se activa la sirena.
4. Se bloquea la cerradura.
5. Se registra un evento especial.
6. Se actualiza el sistema completo.

---

## 📁 Estructura del Proyecto

/assets  
    /images  
/js  
    admin.js  
index.html  
README.md  

---

## 🚀 Instalación y Uso

1. Clonar o descargar el proyecto.
2. Configurar la URL de MockAPI en `admin.js`.
3. Abrir `index.html` en el navegador.
4. Simular eventos activando dispositivos.

---

## 🔮 Posibles Mejoras Futuras

- Sistema de autenticación de usuarios.
- Notificaciones push del navegador.
- Simulación automática periódica.
- Historial exclusivo de eventos críticos.
- Integración con WebSockets.
- Simulación de caída de red.
- Control por zonas geográficas.
- Panel de estadísticas avanzadas.

---

## 🏛️ Enfoque Institucional

El sistema toma como referencia conceptual los centros de comando y control utilizados en seguridad pública, reforzado visualmente mediante la identidad gráfica basada en el escudo de la Policía Federal Mexicana.

---

## 📌 Conclusión

S.I.A.I.P. demuestra la aplicabilidad de soluciones IoT en el ámbito de la seguridad pública, integrando monitoreo en tiempo real, automatización de respuestas y registro inteligente de eventos, ofreciendo una simulación funcional de un sistema moderno de intervención policial.
