// scripts/supervise.js
// Супервизор для стенда: держит server.js живым. Если процесс упал —
// логируем и поднимаем заново через секунду. Без внешних зависимостей
// (pm2 и т.п.), работает одинаково на macOS/Windows/Linux.
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntry = path.join(__dirname, '..', 'server.js');
const RESTART_DELAY_MS = 1000;
// server.js: порт занят — рестарт бесполезен (см. EXIT_PORT_IN_USE).
const EXIT_PORT_IN_USE = 2;

let child = null;
let stopping = false;

function start() {
    child = spawn(process.execPath, [serverEntry], { stdio: 'inherit' });
    child.on('exit', (code, signal) => {
        child = null;
        if (stopping) return;
        if (code === EXIT_PORT_IN_USE) {
            process.exitCode = EXIT_PORT_IN_USE;
            return;
        }
        console.error(`[supervisor] server.js zakończył się (code=${code}, signal=${signal}) — restart za ${RESTART_DELAY_MS} ms`);
        setTimeout(start, RESTART_DELAY_MS);
    });
}

// Ctrl+C / zamknięcie okna — gasimy dziecko i wychodzimy, bez restartu.
for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
        stopping = true;
        if (child) child.kill(sig);
        else process.exit(0);
    });
}

start();
