const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🛠️  INSTALADOR AUTOMATIZADO - SISTEMA BARBEARIA');
console.log('='.repeat(50));

let step = 1;

function logStep(message) {
    console.log(`\n📋 PASSO ${step}: ${message}\n`);
    step++;
}

function runCommand(command, args, description) {
    return new Promise((resolve, reject) => {
        console.log(`⚡ Executando: ${command} ${args.join(' ')}`);
        
        const process = spawn(command, args, { 
            stdio: 'inherit',
            shell: true 
        });

        process.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${description} - Concluído`);
                resolve();
            } else {
                console.log(`❌ ${description} - Falhou (código: ${code})`);
                reject(new Error(`${description} falhou`));
            }
        });

        process.on('error', (error) => {
            console.log(`❌ Erro ao executar ${command}: ${error.message}`);
            reject(error);
        });
    });
}

function createFile(filePath, content) {
    try {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Arquivo criado: ${filePath}`);
        return true;
    } catch (error) {
        console.log(`❌ Erro ao criar arquivo ${filePath}: ${error.message}`);
        return false;
    }
}

async function install() {
    try {
        logStep('VERIFICAÇÃO DE PRÉ-REQUISITOS');
        
        // Verificar Node.js
        try {
            await runCommand('node', ['--version'], 'Verificação Node.js');
        } catch (error) {
            console.log('❌ Node.js não encontrado. Instale Node.js 18+ antes de continuar.');
            process.exit(1);
        }

        logStep('CRIAÇÃO DE ESTRUTURA DE PASTAS');
        
        if (!fs.existsSync('./public')) {
            fs.mkdirSync('./public');
            console.log('✅ Pasta public criada');
        } else {
            console.log('ℹ️  Pasta public já existe');
        }

        logStep('VERIFICAÇÃO DE ARQUIVOS ESSENCIAIS');
        
        const requiredFiles = [
            'database.js',
            'server.js',
            'seeduser.js', 
            'seedData.js',
            'package.json',
            'public/index.html'
        ];

        const missingFiles = [];
        
        for (const file of requiredFiles) {
            if (!fs.existsSync(file)) {
                missingFiles.push(file);
                console.log(`❌ Arquivo faltando: ${file}`);
            } else {
                console.log(`✅ Arquivo encontrado: ${file}`);
            }
        }

        if (missingFiles.length > 0) {
            console.log('\n❌ ARQUIVOS FALTANDO! Copie os seguintes arquivos:');
            missingFiles.forEach(file => console.log(`   - ${file}`));
            process.exit(1);
        }

        logStep('CRIAÇÃO DO ARQUIVO .env');
        
        if (!fs.existsSync('./.env')) {
            const envContent = `# Configurações do Sistema de Barbearia
JWT_SECRET=barbearia_jwt_secreto_${Date.now()}_muito_seguro
PORT=3000
NODE_ENV=production`;
            
            createFile('./.env', envContent);
        } else {
            console.log('ℹ️  Arquivo .env já existe');
        }

        logStep('INSTALAÇÃO DE DEPENDÊNCIAS');
        
        await runCommand('npm', ['install'], 'Instalação de dependências');

        logStep('INICIALIZAÇÃO DO BANCO DE DADOS');
        
        // Remover banco existente se for reinstalação
        if (fs.existsSync('./database.sqlite')) {
            const backup = `./database_backup_${Date.now()}.sqlite`;
            fs.copyFileSync('./database.sqlite', backup);
            console.log(`📁 Backup criado: ${backup}`);
        }

        await runCommand('node', ['seeduser.js'], 'Criação de usuário administrador');
        await runCommand('node', ['seedData.js'], 'População de dados iniciais');

        logStep('TESTE DE INICIALIZAÇÃO');
        
        console.log('🧪 Testando inicialização do servidor...');
        
        const testServer = spawn('node', ['server.js'], { stdio: 'pipe' });
        
        await new Promise((resolve, reject) => {
            let output = '';
            
            testServer.stdout.on('data', (data) => {
                output += data.toString();
            });

            testServer.stderr.on('data', (data) => {
                console.log(`Stderr: ${data}`);
            });

            setTimeout(() => {
                testServer.kill();
                
                if (output.includes('Servidor rodando')) {
                    console.log('✅ Servidor inicia corretamente');
                    resolve();
                } else {
                    console.log('❌ Servidor não inicia corretamente');
                    console.log('Output:', output);
                    reject(new Error('Servidor não inicia'));
                }
            }, 3000);
        });

        logStep('VERIFICAÇÃO FINAL');
        
        // Executar teste automatizado
        await runCommand('node', ['test_system.js'], 'Testes automatizados');

        console.log('\n' + '='.repeat(50));
        console.log('🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('='.repeat(50));
        
        console.log('\n📋 INFORMAÇÕES IMPORTANTES:');
        console.log('┌─────────────────────────────────────────┐');
        console.log('│  CREDENCIAIS DE LOGIN INICIAL:         │');
        console.log('│  Email: admin@barbershop.com            │');
        console.log('│  Senha: 123456                          │');
        console.log('│                                         │');
        console.log('│  ⚠️  MUDE A SENHA APÓS PRIMEIRO LOGIN!  │');
        console.log('└─────────────────────────────────────────┘');

        console.log('\n🚀 PARA INICIAR O SISTEMA:');
        console.log('   npm start');
        console.log('   Depois acesse: http://localhost:3000');

        console.log('\n📁 ARQUIVOS CRIADOS:');
        console.log('   📄 .env (configurações)');
        console.log('   📄 database.sqlite (banco de dados)');
        console.log('   📁 node_modules/ (dependências)');

        console.log('\n🔧 PRÓXIMOS PASSOS:');
        console.log('   1. Execute: npm start');
        console.log('   2. Abra navegador em: http://localhost:3000');  
        console.log('   3. Faça login com credenciais acima');
        console.log('   4. Mude a senha padrão');
        console.log('   5. Comece a usar o sistema!');

        console.log('\n📞 SUPORTE:');
        console.log('   Em caso de problemas, verifique:');
        console.log('   - Firewall/antivirus não está bloqueando');
        console.log('   - Porta 3000 está livre');
        console.log('   - Todos os arquivos estão presentes');

    } catch (error) {
        console.log('\n❌ ERRO DURANTE INSTALAÇÃO:');
        console.log(`   ${error.message}`);
        console.log('\n🔧 SOLUÇÕES POSSÍVEIS:');
        console.log('   - Verifique conexão com internet');
        console.log('   - Execute como administrador');
        console.log('   - Verifique se todos os arquivos estão presentes');
        console.log('   - Tente executar novamente');
        process.exit(1);
    }
}

// Executar instalação
install();