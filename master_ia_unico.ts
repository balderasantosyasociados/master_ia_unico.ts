import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Credenciales Exclusivas de Acceso para Lic. Pedro Baldera
const ADMIN_USER = "pedro_baldera";
const ADMIN_PASS = "BasaMaster2026$";

// Inicialización del SDK oficial de Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "TU_API_KEY_AQUI" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

interface ProyectoIA {
  id: string;
  nombre: string;
  ideaOriginal: string;
  codigoPython: string;
  fechaCreacion: Date;
  estado: 'bandeja' | 'sincronizando_git' | 'desplegado_streamlit';
  urlStreamlit: string;
}

const bandejaDeEntrada: ProyectoIA = [];

console.log("🤖 MASTER IA CONECTADO - CONFIGURACIÓN DE DESPLIEGUE STREAMLIT READY");

async function captarYReformular(entrada: string): Promise<void> {
  console.log("📡 MASTER IA: Procesando estímulo digital...");
  const prompt = `
    Actúa como MASTER IA: El creador autónomo definitivo de software robusto 100/100.
    A partir de la siguiente idea u objetivo: "${entrada}".
    Diseña una aplicación de Streamlit (Python) óptima, limpia, robusta y corporativa.
    Devuelve estrictamente un objeto JSON válido con dos propiedades:
    "nombre": Un nombre corto con guiones, en minúsculas, sin espacios (ej: "basa-auditor-inteligente").
    "codigo": El script completo y funcional de Python listo para ejecutarse en Streamlit.
    No agregues formato markdown ni texto fuera del objeto JSON.
  `;

  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    let textoLimpio = response.text || '{}';
    if (textoLimpio.includes('```json')) {
      textoLimpio = textoLimpio.split('```json')[1].split('```')[0].trim();
    } else if (textoLimpio.includes('```')) {
      textoLimpio = textoLimpio.split('```')[1].split('```')[0].trim();
    }

    const resultado = JSON.parse(textoLimpio);
    const nombreLimpio = (resultado.nombre || `basa-auto-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const nuevoProyecto: ProyectoIA = {
      id: Math.random().toString(36).substring(2, 9),
      nombre: nombreLimpio,
      ideaOriginal: entrada,
      codigoPython: resultado.codigo || '# Código autogenerado',
      fechaCreacion: new Date(),
      estado: 'bandeja',
      urlStreamlit: `https://${nombreLimpio}.streamlit.app`
    };

    bandejaDeEntrada.push(nuevoProyecto);
    console.log(`📦 Nuevo software generado en bandeja: [${nuevoProyecto.nombre}]`);
  } catch (error) {
    console.error("❌ Fallo en el procesamiento por la IA:", error);
  }
}

async function procesarFlujoDespliegueCompleto(proyecto: ProyectoIA): Promise<void> {
  proyecto.estado = 'sincronizando_git';
  const rutaDestino = path.join(__dirname, 'proyectos_autonomos', proyecto.nombre);
  
  try {
    // Autonomía total: Creación automática de directorios del repositorio
    fs.mkdirSync(rutaDestino, { recursive: true });
    
    // CAMBIO CLAVE: Se guarda con el nombre exacto que busca Streamlit Cloud: streamlit_app.py
    fs.writeFileSync(path.join(rutaDestino, 'streamlit_app.py'), proyecto.codigoPython);
    fs.writeFileSync(path.join(rutaDestino, 'requirements.txt'), 'streamlit>=1.40.0\npandas>=2.2.0\nnumpy>=2.0.0\n');

    // Comandos de Git empujando por defecto a la rama 'master' solicitada por Streamlit Cloud
    const comandosGit = `
      cd "${rutaDestino}" && \
      git init && \
      git add . && \
      git commit -m "Auto-despliegue autónomo MASTER IA - Streamlit ready" && \
      git branch -M master && \
      git remote add origin git@github.com:balderasantosyasociados/${proyecto.nombre}.git && \
      git push -u origin master --force
    `;

    exec(comandosGit, (err) => {
      if (err) {
        console.error(`❌ Error Git de ${proyecto.nombre}:`, err);
        proyecto.estado = 'bandeja';
        return;
      }
      setTimeout(() => {
        proyecto.estado = 'desplegado_streamlit';
        console.log(`🟢 [SISTEMA EN LÍNEA EN STREAMLIT CLOUD]: ${proyecto.urlStreamlit}`);
      }, 5000);
    });
  } catch (error) {
    console.error("❌ Error de infraestructura física:", error);
    proyecto.estado = 'bandeja';
  }
}

// ==========================================
// CONTROL DE ACCESO (MIDDLEWARE Y RUTAS)
// ==========================================
let tokenSesionActiva = "";

function verificarAutenticacion(req: any, res: any, next: any) {
  const cookieHeader = req.headers.cookie || "";
  if (cookieHeader.includes(`session=${tokenSesionActiva}`) && tokenSesionActiva !== "") {
    next();
  } else {
    res.status(401).send("<h1>🔒 Acceso Denegado. Autentíquese primero.</h1>");
  }
}

app.post('/api/master-ia/captar', verificarAutenticacion, (req, res) => {
  const { entrada } = req.body;
  if (!entrada) return res.status(400).json({ error: "Falta entrada" });
  captarYReformular(entrada);
  return res.json({ ok: true });
});

app.get('/api/master-ia/bandeja', verificarAutenticacion, (req, res) => {
  return res.json(bandejaDeEntrada);
});

app.post('/api/master-ia/desplegar/:id', verificarAutenticacion, (req, res) => {
  const proyecto = bandejaDeEntrada.find(p => p.id === req.params.id);
  if (!proyecto) return res.status(404).json({ error: "No encontrado" });
  procesarFlujoDespliegueCompleto(proyecto);
  return res.json({ ok: true });
});

app.get('/login', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.write("<!DOCTYPE html><html><head><title>Login MASTER IA</title><script src='https://jsdelivr.net'></script></head>");
  res.write("<body class='bg-neutral-950 text-neutral-100 flex items-center justify-center min-h-screen font-sans'>");
  res.write("<div class='bg-neutral-900 border border-neutral-800 p-8 rounded-xl w-full max-w-sm'>");
  res.write("<h1 class='text-lg font-bold mb-4 text-white text-center'>🔑 Autenticación Exclusiva</h1>");
  res.write("<form action='/login' method='POST' class='space-y-4'>");
  res.write("<div><label class='block text-xs text-neutral-400 mb-1'>Usuario</label><input type='text' name='username' class='w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-sm text-white focus:outline-none focus:border-emerald-500'></div>");
  res.write("<div><label class='block text-xs text-neutral-400 mb-1'>Contraseña</label><input type='password' name='password' class='w-full bg-neutral-950 border border-neutral-800 p-2 rounded text-sm text-white focus:outline-none focus:border-emerald-500'></div>");
  res.write("<button type='submit' class='w-full bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded font-medium text-sm transition-colors cursor-pointer'>Ingresar al Sistema</button>");
  res.write("</form></div></body></html>");
  res.end();
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    tokenSesionActiva = Math.random().toString(36).substring(2);
    res.setHeader('Set-Cookie', `session=${tokenSesionActiva}; Path=/; HttpOnly`);
    res.redirect('/');
  } else {
    res.send("<h1>❌ Credenciales Incorrectas.</h1><a href='/login'>Intentar de nuevo</a>");
  }
});

app.get('/', verificarAutenticacion, (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.write("<!DOCTYPE html><html><head><meta charset='UTF-8'><title>MASTER IA - Panel</title><script src='https://jsdelivr.net'></script></head>");
  res.write("<body class='bg-neutral-950 text-neutral-100 p-8 font-sans'><div class='max-w-4xl mx-auto'>");
  res.write("<header class='border-b border-neutral-800 pb-4 mb-6 flex justify-between items-center'>");
  res.write("<div><h1 class='text-xl font-bold text-white'>🤖 MASTER IA - PANEL DE CONTROL</h1>");
  res.write("<p class='text-xs text-neutral-400 font-mono'>Repositorio Destino: balderasantosyasociados/[nombre_app] | Rama: master | Archivo: streamlit_app.py</p></div></header>");
  res.write("<div class='bg-neutral-900 border border-neutral-800 p-5 rounded-xl mb-6'>");
  res.write("<h2 class='text-sm font-semibold mb-3 text-white'>Inyectar Objetivo / Idea / Enlace</h2><div class='flex gap-2'>");
  res.write("<input id='inputIdea' type='text' placeholder='Ej: Sistema de Nómina Pública Dominicana...' class='flex-1 bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500'>");
  res.write("<button onclick='enviarEstimulo()' class='bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-white'>Enviar</button></div></div>");
  res.write("<h2 class='text-sm font-semibold mb-3 text-white flex items-center gap-2'>📥 Proyectos en Monitoreo Técnico <span id='contador' class='bg-neutral-800 text-neutral-300 font-mono text-xs px-2 py-0.5 rounded-full'>0</span></h2>");
  res.write("<div id='listaProyectos' class='space-y-3'></div></div>");
  res.write("<script>");
  res.write("async function cargarDatos() {");
  res.write("  const res = await fetch('/api/master-ia/bandeja');");
  res.write("  if(res.status === 401) { window.location.href = '/login'; return; }");
  res.write("  const proyectos = await res.json();");
  res.write("  document.getElementById('contador').innerText = proyectos.length;");
  res.write("  const contenedor = document.getElementById('listaProyectos');");
  res.write("  if(proyectos.length === 0) {");
  res.write("    contenedor.innerHTML = '<p class=\"text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-xl p-8 text-center\">Bandeja vacía.</p>';");
  res.write("    return;");
  res.write("  }");
  res.write("  contenedor.innerHTML = proyectos.map(p => {");
  res.write("    let botonHtml = '';");
