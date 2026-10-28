import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./e2e',use:{baseURL:'http://127.0.0.1:15173',headless:true},webServer:[
 {command:'../.venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 18000 --app-dir ..',url:'http://127.0.0.1:18000/api/health',reuseExistingServer:false},
 {env:{API_TARGET:'http://127.0.0.1:18000'},command:'npm run dev -- --port 15173 --strictPort',url:'http://127.0.0.1:15173',reuseExistingServer:false}
]});
