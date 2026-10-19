// Первичная настройка локального WordPress (запускать один раз после `npm run start`).
require('./dns-fix.cjs');
const { execFileSync } = require('child_process');
const path = require('path');
const wpEnv = path.join(__dirname, '..', 'node_modules', '@wordpress', 'env', 'bin', 'wp-env');

const commands = [
  ['language', 'core', 'install', 'ru_RU', '--activate'],
  ['theme', 'activate', 'biart-mono'],
  ['option', 'update', 'blogname', 'BIART'],
  ['option', 'update', 'blogdescription', 'Школа креативных индустрий в Астане'],
  ['option', 'update', 'timezone_string', 'Asia/Almaty'],
  ['option', 'update', 'permalink_structure', '/%postname%/'],
  ['rewrite', 'flush', '--hard'],   // --hard пишет .htaccess: без него на чистой среде все страницы, кроме главной, отдают 404
];

for (const args of commands) {
  console.log('> wp ' + args.join(' '));
  execFileSync(process.execPath, ['-r', path.join(__dirname, 'dns-fix.cjs'), wpEnv, 'run', 'cli', 'wp', ...args], { stdio: 'inherit' });
}
