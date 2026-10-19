// wp-env использует dns.resolve() (c-ares), который на этой машине упирается
// в локальный DNS-стаб 127.0.0.1 и получает ECONNREFUSED -> wp-env думает, что офлайн.
// Подставляем публичные резолверы только для процесса wp-env.
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
dns.promises.setServers(['1.1.1.1', '8.8.8.8']);
