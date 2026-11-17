import { spawn, execSync } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CLOUDFLARED_PATH = path.join(os.tmpdir(), 'cloudflared.exe');

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function ensureCloudflared() {
  if (fs.existsSync(CLOUDFLARED_PATH)) {
    return true;
  }
  console.log('⬇️  Đang tải công cụ Cloudflare Tunnel về máy...');
  try {
    execSync(
      `powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '${CLOUDFLARED_PATH}'"`,
      { stdio: 'inherit' }
    );
    return true;
  } catch (err) {
    console.error('❌ Không thể tải cloudflared:', err.message);
    return false;
  }
}

async function main() {
  console.log('\n🔍 Kiểm tra trạng thái hệ thống Gundam Autobot Store...');

  const isBackendUp = await isPortOpen(3000);
  const isFrontendUp = await isPortOpen(5173);

  if (!isBackendUp) {
    console.log('⚡ Đang khởi động Backend Server (Port 3000)...');
    spawn('cmd.exe', ['/c', 'npm', '--prefix', 'backend', 'run', 'start:dev'], {
      detached: true,
      stdio: 'ignore',
    });
  } else {
    console.log('✅ Backend Server đang chạy sẵn tại port 3000.');
  }

  if (!isFrontendUp) {
    console.log('⚡ Đang khởi động Frontend Server (Port 5173)...');
    spawn('cmd.exe', ['/c', 'npm', '--prefix', 'frontend', 'run', 'dev'], {
      detached: true,
      stdio: 'ignore',
    });
  } else {
    console.log('✅ Frontend Server đang chạy sẵn tại port 5173.');
  }

  // Chờ cho port 5173 sẵn sàng
  let ready = isFrontendUp;
  let attempts = 0;
  while (!ready && attempts < 15) {
    await new Promise((r) => setTimeout(r, 1000));
    ready = await isPortOpen(5173);
    attempts++;
  }

  await ensureCloudflared();

  console.log('\n🌐 Đang khởi tạo đường link công khai (Cloudflare Tunnel)...');

  const tunnel = spawn(CLOUDFLARED_PATH, ['tunnel', '--url', 'http://127.0.0.1:5173'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let foundUrl = false;

  const handleOutput = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && !foundUrl) {
      foundUrl = true;
      const publicUrl = match[0];

      // Copy link to Windows clipboard
      try {
        execSync(`powershell -Command "Set-Clipboard -Value '${publicUrl}'"`, { stdio: 'ignore' });
      } catch {
        // Ignored
      }

      console.log('\n======================================================================');
      console.log('🚀 GUNDAM AUTOBOT STORE - WEB CÔNG KHAI ĐÃ SẴN SÀNG!');
      console.log('======================================================================\n');
      console.log('👉 LINK TRUY CẬP CÔNG KHAI CỦA BẠN:');
      console.log(`   \x1b[36m\x1b[1m${publicUrl}\x1b[0m\n`);
      console.log('📋 ĐÃ TỰ ĐỘNG COPY LINK NÀY VÀO BỘ NHỚ TẠM (CLIPBOARD)!');
      console.log('📱 Gửi link trên cho bạn bè hoặc mở trên điện thoại 4G để vào web ngay.');
      console.log(`🔑 Link trang quản trị Admin: ${publicUrl}/admin\n`);
      console.log('======================================================================');
      console.log('💡 Giữ cửa sổ Terminal này mở để duy trì web. Nhấn [Ctrl + C] để dừng.');
      console.log('======================================================================\n');
    }
  };

  tunnel.stdout.on('data', handleOutput);
  tunnel.stderr.on('data', handleOutput);

  tunnel.on('close', (code) => {
    console.log(`\n🛑 Đường link công khai đã đóng (code: ${code}).`);
    process.exit(0);
  });

  process.on('SIGINT', () => {
    tunnel.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    tunnel.kill();
    process.exit(0);
  });
}

main().catch(console.error);
