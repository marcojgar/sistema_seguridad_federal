// ================= CONFIG =================
const API_URL = "https://698a177bc04d974bc6a15352.mockapi.io/api/v1/devices";

// ================= ELEMENTOS =================
const form = document.getElementById("deviceForm");
const table = document.getElementById("deviceTable");
const submitBtn = document.getElementById("submitBtn");
const clearBtn = document.getElementById("clearBtn");
const deviceId = document.getElementById("deviceId");

const nombre = document.getElementById("nombre");
const tipo = document.getElementById("tipo");
const ubicacion = document.getElementById("ubicacion");
const modeloInput = document.getElementById("modelo");
const numeroSerieInput = document.getElementById("numeroSerie");
const bateria = document.getElementById("bateria");
const consumoEnergia = document.getElementById("consumoEnergia");
const estado = document.getElementById("estado");

let statusChart;
// ================= LOCKDOWN =================

let sistemaBloqueado = false;
// ================= INTENTOS =================
let intentosGuardados =
    localStorage.getItem("intentosRestantes");

let intentosRestantes =
    intentosGuardados !== null
        ? Number(intentosGuardados)
        : 3;



const PASSWORD_SEGURIDAD = "1234";

function mostrarNotificacion(mensaje, tipo = "danger") {

    const container = document.getElementById("notificationContainer");

    const notif = document.createElement("div");
    notif.className = `alert alert-${tipo} shadow`;
    notif.style.minWidth = "300px";
    notif.style.transition = "opacity 0.5s ease";

    notif.innerHTML = `
        <strong>🚨 Alerta:</strong> ${mensaje}
    `;

    container.appendChild(notif);

    // Sonido
    const audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
    audio.play();

    // Desaparece en 20 segundos
    setTimeout(() => {
        notif.style.opacity = "0";
        setTimeout(() => notif.remove(), 4000);
    }, 20000);
}

let cameraStream = null;

// ================= ACTIVAR CAMARA =================
async function activarCamara() {

    const video = document.getElementById("liveCamera");
    const status = document.getElementById("cameraStatus");

    try {

        // Webcam PC (modo simulación real)
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        video.srcObject = cameraStream;

        status.textContent = "🔴 Grabando en Vivo...";
        status.classList.remove("text-danger");
        status.classList.add("text-success");

    } catch (error) {

        console.error("No se pudo activar cámara", error);

        status.textContent = "❌ Error al acceder a la cámara";

    }
}


// ================= APAGAR CAMARA =================
function apagarCamara() {

    const video = document.getElementById("liveCamera");
    const status = document.getElementById("cameraStatus");

    if (cameraStream) {

        cameraStream.getTracks().forEach(track => track.stop());

        video.srcObject = null;

        status.textContent = "Cámara Inactiva";

        status.classList.remove("text-success");
        status.classList.add("text-danger");

        cameraStream = null;
    }
}

function bloquearSistema() {

    sistemaBloqueado = true;

    localStorage.setItem(
        "sistemaBloqueado",
        "true"
    );

    document.getElementById("lockScreen")
        .style.display = "flex";

}


function desbloquearSistema() {

    const pass =
        document.getElementById("passwordInput").value;

    const input =
        document.getElementById("passwordInput");


    // SIN INTENTOS

    if (intentosRestantes <= 0) {

        alert("Sistema bloqueado permanentemente");

        return;

    }


    // CONTRASEÑA CORRECTA

    if (pass === PASSWORD_SEGURIDAD) {

        sistemaBloqueado = false;

        localStorage.removeItem(
            "sistemaBloqueado"
        );

        localStorage.removeItem(
            "intentosRestantes"
        );

        document.getElementById("lockScreen")
            .style.display = "none";

        input.value = "";

        intentosRestantes = 3; // reinicia

        mostrarNotificacion(
            "✅ Sistema desbloqueado",
            "success"
        );

        return;

    }


    // CONTRASEÑA INCORRECTA

    intentosRestantes--;

    localStorage.setItem(
        "intentosRestantes",
        intentosRestantes
    );

    input.value = "";


    if (intentosRestantes > 0) {

        alert(
            "Contraseña incorrecta. Intentos restantes: "
            + intentosRestantes
        );

    } else {

        alert(
            "🚨 Acceso bloqueado. Contacte administrador."
        );

        mostrarNotificacion(
            "🚨 3 intentos fallidos",
            "danger"
        );

    }

}


// ================= ALERTA =================
function calcularAlerta(bateriaValor) {
    return bateriaValor < 20;
}

async function registrarEventoEspecial(mensaje) {

    const res = await fetch(API_URL);
    const devices = await res.json();

    const fechaActual = new Date().toISOString();

    for (let device of devices) {

        const nuevoLog = {
            evento: mensaje,
            fecha: fechaActual
        };

        const updatedLogs = device.logs ? [...device.logs, nuevoLog] : [nuevoLog];

        await fetch(`${API_URL}/${device.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...device,
                logs: updatedLogs
            })
        });
    }

    console.log("📜 Evento especial registrado");
}


// ================= GRÁFICO =================
function initChart() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Activo', 'Inactivo', 'Mantenimiento'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
                borderWidth: 0
            }]
        }
    });
}

async function updateStatusChart() {
    const res = await fetch(API_URL);
    const devices = await res.json();

    const activos = devices.filter(d => d.estado === 'Activo').length;
    const inactivos = devices.filter(d => d.estado === 'Inactivo').length;
    const mantenimiento = devices.filter(d => d.estado === 'Mantenimiento').length;

    statusChart.data.datasets[0].data = [activos, inactivos, mantenimiento];
    statusChart.update();
}

// ================= CARGAR TABLA =================
async function loadDevices() {
    const res = await fetch(API_URL);
    const devices = await res.json();

    const alertasCount = devices.filter(d => calcularAlerta(d.bateria)).length;
    const alertasSection = document.getElementById("alertasSection");
    const alertasSpan = document.getElementById("alertasCount");

    if (alertasCount > 0) {
        alertasSection.classList.remove("d-none");
        alertasSpan.textContent = alertasCount;
    } else {
        alertasSection.classList.add("d-none");
    }

    table.innerHTML = devices.map(device => {

        const alerta = calcularAlerta(device.bateria);

        let badgeClass =
            device.estado === 'Activo'
                ? 'bg-success'
                : device.estado === 'Mantenimiento'
                    ? 'bg-warning text-dark'
                    : 'bg-danger';

        return `
        <tr class="${alerta ? 'table-danger' : ''}">
            <td>${device.nombre}</td>
            <td>${device.tipo}</td>
            <td>${device.modelo || ''}</td>
            <td>${device.numeroSerie || ''}</td>
            <td>${device.ubicacion}</td>
            <td><span class="badge ${badgeClass}">${device.estado}</span></td>
            <td>${device.bateria || 0}%</td>
            <td>${alerta ? '🔴' : '🟢'}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-warning btn-sm"
                        onclick="editDevice('${device.id}')">
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm"
                        onclick="deleteDevice('${device.id}')">
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

// ================= PANEL CONTROL =================
async function loadControlPanel() {
    const res = await fetch(API_URL);
    const devices = await res.json();
    const controlSection = document.getElementById("controlSection");

    controlSection.innerHTML = devices.map(device => `
        <div class="col-md-4 mb-3">
            <div class="card border-primary">
                <div class="card-body text-center">
                    <h5>${device.nombre}</h5>
                    <p><strong>${device.estado}</strong></p>
                    <div class="form-check form-switch d-flex justify-content-center">
                        <input class="form-check-input"
                            type="checkbox"
                            ${device.estado === "Activo" ? "checked" : ""}
                            ${device.estado === "Mantenimiento" ? "disabled" : ""}
                            onclick="handleSwitchClick(event, '${device.id}')">
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ================= SWITCH =================
async function handleSwitchClick(event, id) {

    if (sistemaBloqueado) {

        alert("Sistema bloqueado");

        event.preventDefault();

        event.target.checked =
            !event.target.checked;

        return;

    }

    const isChecked = event.target.checked;
    const nuevoEstado = isChecked ? "Activo" : "Inactivo";

    const res = await fetch(`${API_URL}/${id}`);
    const device = await res.json();

    if (device.estado === "Mantenimiento") {
        alert("No se puede modificar en mantenimiento");
        event.target.checked = false;
        return;
    }

    // 🔹 Crear log normal SIEMPRE
    const nuevoLog = {
        estado: nuevoEstado,
        bateria: device.bateria,
        fecha: new Date().toISOString()
    };

    const updatedLogs = device.logs ? [...device.logs, nuevoLog] : [nuevoLog];
    if (updatedLogs.length > 10) updatedLogs.shift();

    const updatedDevice = {
        ...device,
        estado: nuevoEstado,
        alerta: calcularAlerta(device.bateria),
        ultimaConexion: Date.now(),
        logs: updatedLogs
    };

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDevice)
    });

    // ================= CAMARA SWITCH =================

    if (
        device.nombre.includes("Camara") ||
        device.nombre.includes("Cámara")
    ) {

        if (nuevoEstado === "Activo") {

            activarCamara();

        } else {

            apagarCamara();

        }

    }

    // 🚨 SI ES SENSOR Y SE ACTIVA
    if (device.nombre.includes("Sensor de Puerta") && nuevoEstado === "Activo") {

        mostrarNotificacion("🚨 Intrusión detectada en Puerta Trasera");
        bloquearSistema();

        const resAll = await fetch(API_URL);
        const devices = await resAll.json();

        // 🔊 Sirena
        const sirena = devices.find(d => d.nombre.includes("Sirena"));

        if (sirena) {

            await fetch(`${API_URL}/${sirena.id}`, {

                method: "PUT",
                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({

                    ...sirena,
                    estado: "Activo",
                    alerta: true,
                    ultimaConexion: Date.now(),

                    logs: [
                        ...(sirena.logs || []),
                        {
                            estado: "Activo",
                            bateria: sirena.bateria,
                            fecha: new Date().toISOString()
                        }
                    ]

                })

            });
        }


        // 🔒 Cerradura
        const cerradura = devices.find(d => d.nombre.includes("Cerradura"));

        if (cerradura) {

            await fetch(`${API_URL}/${cerradura.id}`, {

                method: "PUT",
                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({

                    ...cerradura,
                    estado: "Activo",
                    ultimaConexion: Date.now(),

                    logs: [
                        ...(cerradura.logs || []),
                        {
                            estado: "Activo",
                            bateria: cerradura.bateria,
                            fecha: new Date().toISOString()
                        }
                    ]

                })

            });
        }


        // 📷 CAMARA
        const camara = devices.find(d =>
            d.nombre.includes("Camara") ||
            d.nombre.includes("Cámara")
        );

        if (camara) {

            await fetch(`${API_URL}/${camara.id}`, {

                method: "PUT",
                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({

                    ...camara,
                    estado: "Activo",
                    alerta: true,
                    ultimaConexion: Date.now(),

                    logs: [
                        ...(camara.logs || []),
                        {
                            estado: "Activo",
                            bateria: camara.bateria,
                            fecha: new Date().toISOString()
                        }
                    ]

                })

            });

            // ⭐ ACTIVAR VIDEO EN VIVO
            activarCamara();

        }

        await registrarEventoEspecial("🚨 Evento Especial: Intrusión Detectada");

    }

    loadDevices();
    loadControlPanel();
    updateStatusChart();
    renderMonitoring();
}



// ================= MONITOREO =================
async function renderMonitoring() {
    const res = await fetch(API_URL);
    const devices = await res.json();

    let allLogs = [];

    devices.forEach(device => {
        if (device.logs) {
            const logsWithName = device.logs.map(log => ({
                nombre: device.nombre,
                ...log
            }));
            allLogs = [...allLogs, ...logsWithName];
        }
    });

    allLogs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const latestLogs = allLogs.slice(0, 10);

    const statusCards = document.getElementById("statusCards");
    const logTable = document.getElementById("logTable");

    statusCards.innerHTML = "";

    logTable.innerHTML = latestLogs.map(log => {

        // 🔴 Si es evento especial
        if (log.evento) {
            return `
                <tr class="table-danger">
                    <td>${log.nombre}</td>
                    <td colspan="2"><strong>${log.evento}</strong></td>
                    <td>${new Date(log.fecha).toLocaleString()}</td>
                </tr>
            `;
        }

        // 🔹 Log normal
        return `
            <tr>
                <td>${log.nombre}</td>
                <td>${log.estado}</td>
                <td>${log.bateria}%</td>
                <td>${new Date(log.fecha).toLocaleString()}</td>
            </tr>
        `;
    }).join('');
}

// ================= CRUD =================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const bateriaValor = Number(bateria.value);

    // VALIDAR BATERIA

    if (bateriaValor < 0 || bateriaValor > 100) {

        alert("La batería debe estar entre 0 y 100%");

        return;

    }

    const baseData = {
        nombre: nombre.value,
        tipo: tipo.value,
        modelo: modeloInput.value,
        numeroSerie: numeroSerieInput.value,
        ubicacion: ubicacion.value,
        bateria: bateriaValor,
        consumoEnergia: Number(consumoEnergia.value),
        estado: estado.value,
        alerta: calcularAlerta(bateriaValor)
    };

    if (deviceId.value) {

        const res = await fetch(`${API_URL}/${deviceId.value}`);
        const currentDevice = await res.json();

        const updatedDevice = {
            ...currentDevice,
            ...baseData
        };

        await fetch(`${API_URL}/${deviceId.value}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedDevice)
        });

    } else {

        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...baseData,
                ultimaConexion: Date.now(),
                logs: []
            })
        });
    }

    clearForm();
    loadDevices();
    loadControlPanel();
    updateStatusChart();
    renderMonitoring();
});

// ================= EDIT =================
async function editDevice(id) {
    const res = await fetch(`${API_URL}/${id}`);
    const device = await res.json();

    deviceId.value = device.id;
    nombre.value = device.nombre;
    tipo.value = device.tipo;
    ubicacion.value = device.ubicacion;
    modeloInput.value = device.modelo || '';
    numeroSerieInput.value = device.numeroSerie || '';
    bateria.value = device.bateria;
    consumoEnergia.value = device.consumoEnergia;
    estado.value = device.estado;

    submitBtn.textContent = "Actualizar Dispositivo";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ================= DELETE =================
async function deleteDevice(id) {
    if (!confirm("¿Eliminar dispositivo?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadDevices();
    loadControlPanel();
    updateStatusChart();
    renderMonitoring();
}

// ================= LIMPIAR =================
function clearForm() {
    form.reset();
    deviceId.value = "";
    submitBtn.textContent = "Agregar Dispositivo";
}

clearBtn.addEventListener("click", clearForm);

// ================= INTERVALOS =================
setInterval(() => {
    loadDevices();
    updateStatusChart();
    renderMonitoring();
}, 8000);

setInterval(loadControlPanel, 10000);

// ================= START =================
window.addEventListener('load', () => {
    initChart();
    loadDevices();
    loadControlPanel();
    renderMonitoring();

    const intentosGuardados =
        localStorage.getItem("intentosRestantes");

    if (intentosGuardados !== null) {

        intentosRestantes =
            Number(intentosGuardados);

    }

    if (localStorage.getItem(
        "sistemaBloqueado"
    ) === "true"
    ) {

        bloquearSistema();

    }

});

// ================= ADMIN RESET =================

function desbloqueoAdmin() {

    localStorage.removeItem(
        "sistemaBloqueado"
    );

    localStorage.removeItem(
        "intentosRestantes"
    );

    sistemaBloqueado = false;

    intentosRestantes = 3;

    document.getElementById("lockScreen")
        .style.display = "none";

    mostrarNotificacion(
        "✅ Desbloqueo administrador",
        "success"
    );

}
