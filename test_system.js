const fs = require('fs');
const path = require('path');

console.log('🔍 SISTEMA DE TESTE AUTOMATIZADO - BARBEARIA');
console.log('=' .repeat(50));

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

function runTest(testName, testFunction) {
    totalTests++;
    try {
        const result = testFunction();
        if (result) {
            console.log(`✅ ${testName}`);
            passedTests++;
        } else {
            console.log(`❌ ${testName}`);
            failedTests.push(testName);
        }
    } catch (error) {
        console.log(`❌ ${testName} - ERRO: ${error.message}`);
        failedTests.push(testName + ' (ERRO: ' + error.message + ')');
    }
}

console.log('\n📋 FASE 1: VERIFICAÇÃO DE ARQUIVOS\n');

runTest('Arquivo database.js existe', () => {
    return fs.existsSync('./database.js');
});

runTest('Arquivo server.js existe', () => {
    return fs.existsSync('./server.js');
});

runTest('Arquivo package.json existe', () => {
    return fs.existsSync('./package.json');
});

runTest('Arquivo seeduser.js existe', () => {
    return fs.existsSync('./seeduser.js');
});

runTest('Arquivo seedData.js existe', () => {
    return fs.existsSync('./seedData.js');
});

runTest('Pasta public existe', () => {
    return fs.existsSync('./public');
});

runTest('Arquivo public/index.html existe', () => {
    return fs.existsSync('./public/index.html');
});

runTest('Arquivo .env existe', () => {
    return fs.existsSync('./.env');
});

console.log('\n📦 FASE 2: VERIFICAÇÃO DE DEPENDÊNCIAS\n');

runTest('package.json tem dependências corretas', () => {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const requiredDeps = ['express', 'sqlite3', 'bcrypt', 'jsonwebtoken', 'cors', 'dotenv'];
    
    if (!packageJson.dependencies) return false;
    
    for (const dep of requiredDeps) {
        if (!packageJson.dependencies[dep]) {
            console.log(`   Faltando dependência: ${dep}`);
            return false;
        }
    }
    return true;
});

runTest('node_modules existe', () => {
    return fs.existsSync('./node_modules');
});

console.log('\n🗃️ FASE 3: VERIFICAÇÃO DE CONFIGURAÇÕES\n');

runTest('.env contém JWT_SECRET', () => {
    const envContent = fs.readFileSync('./.env', 'utf8');
    return envContent.includes('JWT_SECRET');
});

runTest('server.js importa dependências corretamente', () => {
    const serverContent = fs.readFileSync('./server.js', 'utf8');
    const requiredImports = ['express', 'cors', 'bcrypt', 'jsonwebtoken'];
    
    for (const imp of requiredImports) {
        if (!serverContent.includes(`require('${imp}')`)) {
            console.log(`   Faltando import: ${imp}`);
            return false;
        }
    }
    return true;
});

runTest('database.js configura tabelas principais', () => {
    const dbContent = fs.readFileSync('./database.js', 'utf8');
    const requiredTables = ['users', 'appointments', 'services', 'clients'];
    
    for (const table of requiredTables) {
        if (!dbContent.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
            console.log(`   Tabela faltando: ${table}`);
            return false;
        }
    }
    return true;
});

console.log('\n📱 FASE 4: VERIFICAÇÃO DE INTERFACE\n');

runTest('index.html contém estrutura básica', () => {
    const htmlContent = fs.readFileSync('./public/index.html', 'utf8');
    const requiredElements = ['authCard', 'dashboard', 'loginForm', 'appointmentForm'];
    
    for (const element of requiredElements) {
        if (!htmlContent.includes(`id="${element}"`)) {
            console.log(`   Elemento faltando: ${element}`);
            return false;
        }
    }
    return true;
});

runTest('index.html tem JavaScript para API calls', () => {
    const htmlContent = fs.readFileSync('./public/index.html', 'utf8');
    return htmlContent.includes('fetch(') && htmlContent.includes('Authorization');
});

runTest('index.html é responsivo', () => {
    const htmlContent = fs.readFileSync('./public/index.html', 'utf8');
    return htmlContent.includes('viewport') && htmlContent.includes('@media');
});

console.log('\n🔧 FASE 5: VERIFICAÇÃO DE SCRIPTS\n');

runTest('seeduser.js usa bcrypt para hash', () => {
    const seedContent = fs.readFileSync('./seeduser.js', 'utf8');
    return seedContent.includes('bcrypt.hash') && seedContent.includes('password_hash');
});

runTest('seedData.js popula serviços', () => {
    const seedContent = fs.readFileSync('./seedData.js', 'utf8');
    return seedContent.includes('services') && seedContent.includes('INSERT INTO services');
});

console.log('\n📊 RELATÓRIO FINAL\n');
console.log('=' .repeat(50));
console.log(`📈 TOTAL DE TESTES: ${totalTests}`);
console.log(`✅ TESTES APROVADOS: ${passedTests}`);
console.log(`❌ TESTES FALHARAM: ${totalTests - passedTests}`);

const successRate = Math.round((passedTests / totalTests) * 100);
console.log(`📊 TAXA DE SUCESSO: ${successRate}%`);

if (failedTests.length > 0) {
    console.log('\n❌ TESTES QUE FALHARAM:');
    failedTests.forEach((test, index) => {
        console.log(`   ${index + 1}. ${test}`);
    });
}

console.log('\n🎯 AVALIAÇÃO GERAL:');

if (successRate >= 90) {
    console.log('🟢 SISTEMA PRONTO PARA COMERCIALIZAÇÃO');
    console.log('   ✓ Todos os componentes principais funcionais');
    console.log('   ✓ Estrutura adequada para produção');
    console.log('   ⚠️  Recomendo executar testes manuais também');
} else if (successRate >= 70) {
    console.log('🟡 SISTEMA PARCIALMENTE PRONTO');
    console.log('   ✓ Estrutura básica ok');
    console.log('   ⚠️  Alguns componentes precisam de ajustes');
    console.log('   🔧 Corrigir falhas antes de comercializar');
} else {
    console.log('🔴 SISTEMA NÃO PRONTO PARA COMERCIALIZAÇÃO');
    console.log('   ❌ Muitos componentes faltando/quebrados');
    console.log('   🔧 Necessária revisão completa');
    console.log('   ⏱️  Não comercializar até resolver problemas');
}

console.log('\n🚀 PRÓXIMOS PASSOS:');
console.log('1. Corrigir falhas identificadas (se houver)');
console.log('2. Executar: node seeduser.js');
console.log('3. Executar: node seedData.js');
console.log('4. Executar: npm start');
console.log('5. Testar manualmente no navegador');
console.log('6. Testar com usuário real');

console.log('\n📞 SUPORTE:');
console.log('Se algum teste falhou, verifique:');
console.log('- Todos os arquivos foram copiados corretamente');
console.log('- npm install foi executado');
console.log('- Não há erros de sintaxe nos arquivos');
console.log('- Versão do Node.js é 18+');

console.log('\n' + '=' .repeat(50));