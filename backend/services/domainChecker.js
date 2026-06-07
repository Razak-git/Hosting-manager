const dns = require('dns').promises;
const axios = require('axios');

const isDomainValid = async (domain) => {
  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .trim()
    .toLowerCase();

  if (!cleanDomain) {
    return { valid: false, domain: cleanDomain, error: 'Domaine vide.' };
  }

  try {
    await dns.lookup(cleanDomain);
    return { valid: true, domain: cleanDomain };
  } catch {
    return {
      valid: false,
      domain: cleanDomain,
      error: `Le domaine "${cleanDomain}" n'existe pas.`,
    };
  }
};

const checkSiteStatus = async (domain) => {
  const options = {
    timeout: 10000,
    maxRedirects: 5,
    validateStatus: () => true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,*/*',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
    },
  };

  // Vérifie d'abord si le DNS répond
  try {
    await dns.lookup(domain);
  } catch {
    return 'offline'; // DNS mort = offline
  }

  // Essai HTTPS
  try {
    const res = await axios.get(`https://${domain}`, options);
    // Sites qui bloquent les bots renvoient 403/429/503 mais sont en ligne
    // Seuls 404 et erreurs réseau = offline
    if (res.status === 404) return 'offline';
    if (res.status >= 200 && res.status < 600) return 'online';
    return 'offline';
  } catch (e) {
    // Erreur réseau = essai HTTP
    try {
      const res = await axios.get(`http://${domain}`, options);
      if (res.status === 404) return 'offline';
      if (res.status >= 200 && res.status < 600) return 'online';
      return 'offline';
    } catch {
      return 'offline'; // Aucune réponse = offline
    }
  }
};

module.exports = { isDomainValid, checkSiteStatus };
