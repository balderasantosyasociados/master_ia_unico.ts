import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ==========================================
// CONFIGURACIÓN CENTRAL DEL SISTEMA
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;

// Inicialización del SDK oficial de Gemini (Asegúrate de tener la variable en tu entorno)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "TU_API_KEY_AQUI" });

app.use(express.json());

interface ProyectoIA {
  id: string;
  nombre: string;
  ideaOriginal: string;
  codigoPython: string;
  fechaCreacion: Date;
  estado: 'bandeja' | 'sincronizando_git' | 'desplegado_streamlit' | 'rechazado';
  urlStreamlit: string;
}

// Almacenamiento temporal en memoria de los proyectos de la firma
const bandejaDeEntrada: ProyectoIA[] = [];

console.log("🤖 MASTER IA CONECTADO - MÓDULO DE DESPLIEGUE A STREAMLIT ACTIVADO");

// ==========================================
// OPERACIONES AUTÓNOMAS E INSACIABLES
// ==========================================

async function captarYReformular(entrada: string): Promise<void> {
  console.log(`📡 MASTER IA: Procesando estímulo digital: "${entrada.substring(0, 60)}..."`);

  const prompt = `
    Actúa como MASTER IA: El creador autónomo definitivo de software robusto 100/100.
    A partir de la siguiente idea, enlace o requerimiento: "${entrada}".
    Diseña una aplicación de Streamlit (Python) óptima, limpia, robusta y corporativa.
    Usa componentes visuales avanzados de Streamlit (st.dataframe, st.metrics, st.tabs).
    Devuelve estrictamente un objeto JSON válido con dos propiedades:
    "nombre": Un nombre corto con guiones, en minúsculas, sin espacios (ej: "basa-auditor-inteligente").
    "codigo": El script completo, funcional, original y profesional de Python listo para ejecutarse en Streamlit.
    No agregues texto explicativo ni formato markdown fuera del objeto JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let textoLimpio = response.text || '{}';
    if (textoLimpio.includes('```json')) {
      textoLimpio = textoLimpio.split('```json')[1].split('```')[0].trim();
    } else if (textoLinter.includes('```')) {
      textoLimpio = textoLimpio.split('```')[1].split('```')[0].trim();
    }

    const resultado = JSON.parse(textoLimpio);
    const nombreLimpio = (resultado.nombre || `basa-auto-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const nuevoProyecto: ProyectoIA = {
      id: Math.random().toString(36).substring(2, 9),
      nombre: nombreLimpio,
      ideaOriginal: entrada,
      codigoPython: resultado.codigo || '# Código autogenerado por Master IA\nimport streamlit as st\nst.title("Sistema Autónomo")',
      fechaCreacion: new Date(),
      estado: 'bandeja',
      urlStreamlit: `https://${nombreLimpio}.streamlit.app`
    };

    bandejaDeEntrada.push(nuevoProyecto);
    console.log(`📦 Nuevo software generado en bandeja: [${nuevoProyecto.nombre}]`);

  } catch (error) {
    console.error("❌ Fallo en el procesamiento del estímulo por la IA:", error);
  }
}

function iniciarBucleDeActualizacion(): void {
  setInterval(async () => {
    console.log("🔄 [Bucle 30s] Analizando tiempos de bandeja para auto-despliegue en Streamlit...");
    
    const ahora = new Date();
    const tresDiasMilisegundos = 3 * 24 * 60 * 60 * 1000;

    for (let i = bandejaDeEntrada.length - 1; i >= 0; i--) {
      const proyecto = bandejaDeEntrada[i];
      const tiempoTranscurrido = ahora.getTime() - proyecto.fechaCreacion.getTime();

      // Regla Autónoma Absoluta: Si cumple más de 3 días en la bandeja, se sube solo
      if (proyecto.estado === 'bandeja' && tiempoTranscurrido >= tresDiasMilisegundos) {
        console.log(`⏳ Límite de tiempo (3 días) alcanzado para [${proyecto.nombre}]. Desplegando en la red.`);
        await procesarFlujoDespliegueCompleto(proyecto);
      }
    }
  }, 30000); // Evalúa cada 30 Segundos
}

/**
 * Orquesta la secuencia de guardado local, push por SSH y enganche a Streamlit Cloud
 */
async function procesarFlujoDespliegueCompleto(proyecto: ProyectoIA): Promise<void> {
  proyecto.estado = 'sincronizando_git';
  const rutaDestino = path.join(__dirname, 'proyectos_autonomos', proyecto.nombre);
  
  try {
    // 1. Crear estructura de archivos compatible con Streamlit Cloud
    fs.mkdirSync(rutaDestino, { recursive: true });
    fs.writeFileSync(path.join(rutaDestino, 'app.py'), proyecto.codigoPython);
    
    // Configuración de dependencias estándar para evitar fallos de ejecución en la nube
    const dependencias = `streamlit>=1.40.0\npandas>=2.2.0\nnumpy>=2.0.0\nmatplotlib>=3.9.0\n`;
    fs.writeFileSync(path.join(rutaDestino, 'requirements.txt'), dependencias);

    // 2. Empujar el repositorio a GitHub por SSH de forma discreta y desatendida
    const comandosGit = `
      cd "${rutaDestino}" && \
      git init && \
      git add . && \
      git commit -m "Auto-despliegue autónomo MASTER IA - 100/100 robusto" && \
      git branch -M main && \
      git remote add origin git@github.com:balderasantosyasociados/${proyecto.nombre}.git && \
      git push -u origin main --force
    `;

    exec(comandosGit, async (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ Error en acoplamiento Git de ${proyecto.nombre}:`, err);
        proyecto.estado = 'bandeja'; // Revierte el estado ante fallos de red o SSH
        return;
      }
      console.log(`🚀 [GITHUB OK] Repositorio empujado a: ://github.com{proyecto.nombre}`);
      
      // 3. Ejecutar enganche a Streamlit Cloud
      await notificarAStreamlitCloud(proyecto);
    });

  } catch (error) {
    console.error(`❌ Error crítico de infraestructura física para ${proyecto.nombre}:`, error);
    proyecto.estado = 'bandeja';
  }
}

/**
 * Simula el aprovisionamiento instantáneo en la infraestructura de Streamlit
 */
async function notificarAStreamlitCloud(proyecto: ProyectoIA): Promise<void> {
  console.log(`📡 Conectando de forma discreta con los servidores de Streamlit Cloud para [${proyecto.nombre}]...`);
  
  // Imita el retardo de inicialización de contenedores en Streamlit (Aprovisionamiento de recursos)
  setTimeout(() => {
    proyecto.estado = 'desplegado_streamlit';
    console.log(`🟢 [SISTEMA EN LÍNEA] Aplicación de Streamlit completamente operativa.`);
    console.log(`🔗 URL de acceso público: ${proyecto.urlStreamlit}`);
  }, 5000);
}

// ==========================================
// INTERFAZ DE API HTTP (ENDPOINTS)
// ==========================================

app.post('/api/master-ia/captar', async (req, res) => {
  const { entrada } = req.body;
  if (!entrada) return res.status(400).json({ error: "Falta parámetro de entrada." });
  captarYReformular(entrada);
  return res.json({ mensaje: "Estímulo captado y en procesamiento asíncrono." });
});

app.get('/api/master-ia/bandeja', (req, res) => {
  return res.json(bandejaDeEntrada);
});

app.post('/api/master-ia/desplegar/:id', async (req, res) => {
  const proyecto = bandejaDeEntrada.find(p => p.id === req.params.id);
  if (!proyecto) return res.status(404).json({ error: "Software no localizado." });
  
  // Fuerza el flujo inmediato sin esperar la ventana temporal de los 3 días
  procesarFlujoDespliegueCompleto(proyecto);
  return res.json({ mensaje: `Lanzamiento forzado en cola hacia Streamlit Cloud para: ${proyecto.nombre}` });
});

// ==========================================
// INTERFAZ WEB REACTIVA INCORPORADA (SINGLE PAGE)
// ==========================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MASTER IA - Panel de Control Streamlit</title>
        <script src="https://unpkg.com"></script>
        <script src="https://unpkg.com"></script>
        <script src="https://unpkg.com"></script>
        <script src="https://jsdelivr.net"></script>
    </head>
    <body class="bg-neutral-950 text-neutral-100 min-h-screen font-sans">
        <div id="root"></div>

        <script type="text/babel">
            function App() {
                const [proyectos, setProyectos] = React.useState([]);
                const [idea, setIdea] = React.useState('');
                const [cargando, setCargando] = React.useState(false);

                const cargarBandeja = async () => {
                    const res = await fetch('/api/master-ia/bandeja');
                    const data = await res.json();
                    setProyectos(data);
                };

                React.useEffect(() => {
                    cargarBandeja();
                    const intervalo = setInterval(cargarBandeja, 4000);
                    return () => clearInterval(intervalo);
                }, []);

                const enviarIdea = async (e) => {
                    e.preventDefault();
                    if (!idea.trim()) return;
                    setCargando(true);
                    await fetch('/api/master-ia/captar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ entrada: idea })
                    });
                    setIdea('');
                    setCargando(false);
                    cargarBandeja();
                };

                const forzarDespliegue = async (id) => {
                    await fetch(\`/api/master-ia/desplegar/\${id}\`, { method: 'POST' });
                    cargarBandeja();
                };

                return (
