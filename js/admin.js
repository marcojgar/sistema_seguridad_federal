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
const ipInput = document.getElementById("ip");
const macInput = document.getElementById("mac");
const modeloInput = document.getElementById("modelo");
const numeroSerieInput = document.getElementById("numeroSerie");
const firmwareInput = document.getElementById("firmware");
const fechaInstalacionInput = document.getElementById("fechaInstalacion");
const bateria = document.getElementById("bateria");
const senal = document.getElementById("senal");
const consumoEnergia = document.getElementById("consumoEnergia");
const estado = document.getElementById("estado");

let statusChart;

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
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Distribución de Estados' }
            }
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

    const alertasCount = devices.filter(d => d.alerta).length;
    const alertasSection = document.getElementById("alertasSection");
    const alertasSpan = document.getElementById("alertasCount");

    if (alertasCount > 0) {
        alertasSection.classList.remove("d-none");
        alertasSpan.textContent = alertasCount;
    } else {
        alertasSection.classList.add("d-none");
    }

    table.innerHTML = devices.map(device => {
        let badgeClass =
            device.estado === 'Activo'
                ? 'bg-success'
                : device.estado === 'Mantenimiento'
                    ? 'bg-warning text-dark'
                    : 'bg-danger';

        return `
        <tr>
            <td>${device.nombre}</td>
            <td>${device.tipo}</td>
            <td>${device.modelo || ''}</td>
            <td>${device.numeroSerie || ''}</td>
            <td>${device.ubicacion}</td>
            <td>${device.ip || ''}</td>
            <td>${device.mac || ''}</td>
            <td><span class="badge ${badgeClass}">${device.estado}</span></td>
            <td>${device.bateria || 0}%</td>
            <td>${device.senal || 0}%</td>
            <td>${device.alerta ? '🔴' : '🟢'}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-warning btn-sm" onclick="editDevice('${device.id}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteDevice('${device.id}')">Eliminar</button>
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

// ================= LOGS PERSISTENTES =================
async function appendLogToDevice(device) {
    const newLog = {
        estado: device.estado,
        bateria: device.bateria,
        senal: device.senal,
        fecha: new Date().toISOString()
    };

    const updatedLogs = device.logs ? [...device.logs, newLog] : [newLog];

    if (updatedLogs.length > 10) updatedLogs.shift();

    await fetch(`${API_URL}/${device.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...device, logs: updatedLogs })
    });
}

// ================= SWITCH =================
async function handleSwitchClick(event, id) {
    const isChecked = event.target.checked;
    const nuevoEstado = isChecked ? "Activo" : "Inactivo";

    const res = await fetch(`${API_URL}/${id}`);
    const device = await res.json();

    if (device.estado === "Mantenimiento") {
        alert("No se puede modificar en mantenimiento");
        event.target.checked = false;
        return;
    }

    const updatedDevice = {
        ...device,
        estado: nuevoEstado,
        ultimaConexion: Date.now()
    };

    await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDevice)
    });

    await appendLogToDevice(updatedDevice);
    await renderMonitoring();
    updateStatusChart();
    loadDevices();
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

    statusCards.innerHTML = latestLogs.slice(0, 3).map(log => `
        <div class="col-md-4">
            <div class="card text-white ${log.estado === "Activo" ? "bg-success" : "bg-danger"} mb-3">
                <div class="card-body">
                    <h6>${log.nombre}</h6>
                    <p>Estado: ${log.estado}</p>
                    <p>Batería: ${log.bateria}%</p>
                </div>
            </div>
        </div>
    `).join('');

    logTable.innerHTML = latestLogs.map(log => `
        <tr>
            <td>${log.nombre}</td>
            <td>${log.estado}</td>
            <td>${log.bateria}%</td>
            <td>${log.senal}%</td>
            <td>${new Date(log.fecha).toLocaleString()}</td>
        </tr>
    `).join('');
}

// ================= CRUD =================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const baseData = {
        nombre: nombre.value,
        tipo: tipo.value,
        modelo: modeloInput.value,
        numeroSerie: numeroSerieInput.value,
        ubicacion: ubicacion.value,
        ip: ipInput.value,
        mac: macInput.value,
        bateria: Number(bateria.value),
        senal: Number(senal.value),
        consumoEnergia: Number(consumoEnergia.value),
        firmware: firmwareInput.value,
        fechaInstalacion: fechaInstalacionInput.value,
        estado: estado.value
    };

    if (deviceId.value) {
        await fetch(`${API_URL}/${deviceId.value}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...baseData })
        });
    } else {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...baseData,
                ultimaConexion: Date.now(),
                alerta: false,
                logs: []
            })
        });
    }

    clearForm();
    loadDevices();
    loadControlPanel();
    updateStatusChart();
});

async function editDevice(id) {
    const res = await fetch(`${API_URL}/${id}`);
    const device = await res.json();

    deviceId.value = device.id;
    nombre.value = device.nombre;
    tipo.value = device.tipo;
    ubicacion.value = device.ubicacion;
    ipInput.value = device.ip || '';
    macInput.value = device.mac || '';
    modeloInput.value = device.modelo || '';
    numeroSerieInput.value = device.numeroSerie || '';
    firmwareInput.value = device.firmware || '';
    fechaInstalacionInput.value = device.fechaInstalacion || '';
    bateria.value = device.bateria;
    senal.value = device.senal;
    consumoEnergia.value = device.consumoEnergia;
    estado.value = device.estado;

    submitBtn.textContent = "Actualizar Dispositivo";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteDevice(id) {
    if (!confirm("¿Eliminar dispositivo?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadDevices();
    loadControlPanel();
    updateStatusChart();
    renderMonitoring();
}

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
}, 2000);

setInterval(loadControlPanel, 10000);

window.addEventListener('load', () => {
    initChart();
    loadDevices();
    loadControlPanel();
    renderMonitoring();
});
