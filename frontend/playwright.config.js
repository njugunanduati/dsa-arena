import {defineConfig} from '@playwright/test';
const apiPort=process.env.DSA_E2E_API_PORT || '18000';
const webPort=process.env.DSA_E2E_WEB_PORT || '15173';
const apiUrl=`http://127.0.0.1:${apiPort}`;
const webUrl=`http://127.0.0.1:${webPort}`;
export default defineConfig({testDir:'./e2e',use:{baseURL:webUrl,headless:true},webServer:[
 {command:`../.venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port ${apiPort} --app-dir ..`,url:`${apiUrl}/api/health`,reuseExistingServer:false},
 {env:{API_TARGET:apiUrl},command:`npm run dev -- --port ${webPort} --strictPort`,url:webUrl,reuseExistingServer:false}
]});
