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

// Inicialización del SDK oficial de Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "TU_API_KEY_AQUI" });

app.use(express.json());

interface ProyectoIA {
  id: string;
  nombre: string;
  ideaOriginal: string;
  codigoPython: string;
  fechaCreacion: Date;
  estado: 'bandeja' | 'desplegado' | 'rechazado';
}

// Repositorio volátil de almacenamiento de proyectos
const bandejaDeEntrada: ProyectoIA[] = [];

console.log("🤖 MASTER IA CONECTADO - ORQUESTADOR INTEGRADO CON INTERFAZ WEB");

// ==========================================
// OPERACIONES AUTÓNOMAS E INSACIABLES
// ==========================================

async function captarYReformular(entrada: string): Promise<void> {
  console.log(`📡 MASTER IA: Procesando estímulo digital: "${entrada.substring(0, 60)}..."`);

  const prompt = `
    Actúa como MASTER IA: El creador autónomo definitivo de software robusto 100/100.
    A partir de la siguiente idea u objetivo: "${entrada}".
    Diseña una aplicación de Streamlit (Python) óptima, autogestionable y altamente competitiva.
    Supera esquemas tradicionales de Meta o Google. Devuelve estrictamente un objeto JSON válido con dos propiedades:
    "nombre": Un nombre corto sin espacios ni caracteres especiales adecuado para un repositorio de GitHub (ej: "basa-sistema-automatizado").
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
    } else if (textoLimpio.includes('```')) {
      textoLimpio = textoLimpio.split('```')[1].split('```')[0].trim();
    }

    const resultado = JSON.parse(textoLimpio);

    const nuevoProyecto: ProyectoIA = {
      id: Math.random().toString(36).substring(2, 9),
      nombre: resultado.nombre || `basa_auto_${Date.now()}`,
      ideaOriginal: entrada,
      codigoPython: resultado.codigo || '# Código autogenerado por Master IA',
      fechaCreacion: new Date(),
      estado: 'bandeja'
    };

    bandejaDeEntrada.push(nuevoProyecto);
    console.log(`📦 Nuevo software generado con éxito: [${nuevoProyecto.nombre}]`);

  } catch (error) {
    console.error("❌ Fallo en el procesamiento del estímulo por la IA:", error);
  }
}

function iniciarBucleDeActualizacion(): void {
  setInterval(async () => {
    console.log("🔄 [Bucle 30s] Analizando estado de la bandeja y sincronía con GitHub...");
    
    const ahora = new Date();
    const tresDiasMilisegundos = 3 * 24 * 60 * 60 * 1000;

    for (let i = bandejaDeEntrada.length - 1; i >= 0; i--) {
      const proyecto = bandejaDeEntrada[i];
      const tiempoTranscurrido = ahora.getTime() - proyecto.fechaCreacion.getTime();

      // Regla de Despliegue Ininterrumpido: Publicación automática tras 3 días sin interacción
      if (proyecto.estado === 'bandeja' && tiempoTranscurrido >= tresDiasMilisegundos) {
        console.log(`⏳ Límite de tiempo excedido para [${proyecto.nombre}]. Iniciando automatización Git.`);
        proyecto.estado = 'desplegado';
        await ejecutarDespliegueGitHub(proyecto);
      }
    }
  }, 30000); // 30 Segundos
}

async function ejecutarDespliegueGitHub(proyecto: ProyectoIA): Promise<void> {
  const rutaDestino = path.join(__dirname, 'proyectos_autonomos', proyecto.nombre);
  
  try {
    fs.mkdirSync(rutaDestino, { recursive: true });
    fs.writeFileSync(path.join(rutaDestino, 'app.py'), proyecto.codigoPython);
    fs.writeFileSync(path.join(rutaDestino, 'requirements.txt'), 'streamlit>=1.40.0\nnumpy>=2.0.0\npandas>=2.2.0\n');

    // Despliegue transparente usando claves SSH dirigidas a la organización balderasantosyasociados
    const comandosGit = `
      cd "${rutaDestino}" && \
      git init && \
      git add . && \
      git commit -m "Auto-despliegue autónomo MASTER IA - 100/100 robusto" && \
      git branch -M main && \
      git remote add origin git@github.com:balderasantosyasociados/${proyecto.nombre}.git && \
      git push -u origin main
    `;

    exec(comandosGit, (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ Error en acoplamiento Git de ${proyecto.nombre}:`, err);
        return;
      }
      console.log(`🚀 [PUBLICADO] Sincronización SSH exitosa con ://github.com{proyecto.nombre}`);
    });

  } catch (error) {
    console.error(`❌ Error crítico de infraestructura física para ${proyecto.nombre}:`, error);
  }
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
  proyecto.estado = 'desplegado';
  await ejecutarDespliegueGitHub(proyecto);
  return res.json({ mensaje: `Lanzamiento manual SSH forzado para ${proyecto.nombre}` });
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
        <title>MASTER IA - Panel Autónomo</title>
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
                    const intervalo = setInterval(cargarBandeja, 5000); // Refresco visual cada 5s
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
                    <div class="max-w-6xl mx-auto p-6">
                        <header class="flex justify-between items-center border-b border-neutral-800 pb-4 mb-8">
                            <div>
                                <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                                    🤖 MASTER IA <span class="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono animate-pulse">AUTÓNOMO</span>
                                </h1>
                                <p class="text-sm text-neutral-400">Orquestador de Software Continuo 100/100</p>
                            </div>
                            <div class="text-right text-xs font-mono text-neutral-500">
                                Sincronización activa: git@github.com:balderasantosyasociados/
                            </div>
                        </header>

                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <!-- Columna Formulario -->
                            <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-5 h-fit">
                                <h2 class="text-lg font-semibold text-white mb-4">Inyectar Estímulo</h2>
                                <form onSubmit={enviarIdea} class="space-y-4">
                                    <textarea 
                                        value={idea}
                                        onChange={(e) => setIdea(e.target.value)}
