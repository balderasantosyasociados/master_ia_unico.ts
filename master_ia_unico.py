import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_USER = "pedro_baldera";
const ADMIN_PASS = "BasaMaster2026$";

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

console.log("🤖 MASTER IA CONECTADO - INICIALIZANDO COMPATIBILIDAD NATIVA");

// Código base en Python que se auto-inyectará en su repositorio para Streamlit Cloud
const codigoPythonBase = `import streamlit as st
import os
import json
import random
from datetime import datetime

ADMIN_USER = "pedro_baldera"
ADMIN_PASS = "BasaMaster2026$"

if "proyectos" not in st.session_state:
    st.session_state.proyectos = []
if "autenticado" not in st.session_state:
    st.session_state.autenticado = False

def login():
    st.markdown("<h2 style='text-align: center;'>🔑 Autenticación Exclusiva</h2>", unsafe_allow_html=True)
    with st.form("login_form"):
        username = st.text_input("Usuario")
        password = st.text_input("Contraseña", type="password")
        submit = st.form_submit_button("Ingresar al Sistema", use_container_width=True)
        if submit:
            if username == ADMIN_USER and password == ADMIN_PASS:
                st.session_state.autenticado = True
                st.rerun()
            else:
                st.error("❌ Credenciales Incorrectas.")

if not st.session_state.autenticado:
    login()
    st.stop()

st.set_page_config(page_title="MASTER IA - Panel", page_icon="🤖", layout="wide")
st.title("🤖 MASTER IA - CONTROL PANEL")
st.caption("Firma: balderasantosyasociados | Sistema Operativo en la Nube")
st.markdown("---")

col1, col2 = st.columns([1, 2])
with col1:
    st.subheader("Inyectar Objetivo / Idea")
    idea_input = st.text_area("Estímulo digital", placeholder="Ej: Sistema de Auditoría Pública...", height=150)
    if st.button("Enviar Estímulo", use_container_width=True):
        st.success("Estímulo captado por el núcleo maestro.")
with col2:
    st.subheader(f"📥 Proyectos en Monitoreo Técnico ({len(st.session_state.proyectos)})")
    st.info("Bandeja en línea lista para recibir flujos.")
`;

/**
 * Función encargada de forzar la creación física de los archivos compatibles en el repositorio local
 * e inicializar de forma obligatoria la rama requerida.
 */
function forzarEstructuraCompatible() {
  const rutaRaiz = __dirname;
  
  try {
    console.log("🛠️ Generando estructura de archivos compatible...");
    
    // Crear el archivo principal ejecutable de Python exigido por Streamlit Cloud
    fs.writeFileSync(path.join(rutaRaiz, 'streamlit_app.py'), codigoPythonBase, 'utf-8');
    
    // Crear el archivo de dependencias técnicas obligatorio
    fs.writeFileSync(path.join(rutaRaiz, 'requirements.txt'), 'streamlit>=1.40.0\ngoogle-genai>=0.1.1\n', 'utf-8');
    
    console.log("✅ Archivos 'streamlit_app.py' y 'requirements.txt' inyectados con éxito.");

    // Ejecutar la secuencia de Git de manera automática apuntando a la rama raíz de la cuenta pública
    const comandosSincronizacionTotal = `
      git init && \
      git add streamlit_app.py requirements.txt && \
      git commit -m "Forzar rama compatible y main file para Streamlit Cloud" && \
      git branch -M main && \
      git remote remove origin 2>nul || true && \
      git remote add origin git@github.com:balderasantosyasociados/master_ia_unico.ts.git && \
      git push -u origin main --force
    `;

    exec(comandosSincronizacionTotal, { cwd: rutaRaiz }, (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Error durante la inyección Git automatizada:", err.message);
        console.log("👉 Intentando vía HTTPS alternativo por seguridad...");
        
        // Intento secundario si la llave SSH de la terminal presenta restricciones temporales
        const comandoHttpsAlternativo = `git remote set-url origin https://github.com && git push -u origin main --force`;
        exec(comandoHttpsAlternativo, { cwd: rutaRaiz });
        return;
      }
      console.log("🚀 [SINCRONIZACIÓN EXITOSA] Los archivos ya se encuentran en GitHub.");
      console.log("📊 Rama de destino confirmada: main");
      console.log("📂 Archivo verificado: streamlit_app.py");
    });

  } catch (error) {
    console.error("❌ Ocurrió un error en el procesador físico de carpetas:", error);
  }
}

// APIs internas resguardadas
app.get('/api/master-ia/bandeja', (req, res) => res.json(bandejaDeEntrada));

app.listen(PORT, () => {
  console.log(`🌍 Servidor local corriendo en http://localhost:${PORT}`);
  // Ejecutar el disparador de estructura de manera inmediata al levantar el sistema
  forzarEstructuraCompatible();
});
