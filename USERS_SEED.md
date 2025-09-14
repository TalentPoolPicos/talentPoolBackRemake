# TalentPool - Usuários de Seed

Este documento descreve os usuários criados no seed do banco de dados para testes e desenvolvimento.

## 📊 Resumo dos Dados

- **6 Estudantes** com perfis completos e tags diversificadas
- **5 Empresas** com diferentes especialidades tecnológicas
- **2 Usuários Administrativos** (admin e moderador)
- **Vagas de emprego** relacionadas às especialidades
- **Candidaturas** e **likes** entre usuários

## 👨‍🎓 Estudantes

### João Silva
- **Username:** `joao_silva`
- **Email:** joao.silva@ufpi.edu.br
- **Curso:** Ciência da Computação
- **Tags:** JavaScript, React, Node.js, Python, Machine Learning
- **Descrição:** Estudante apaixonado por desenvolvimento web e inteligência artificial

### Maria Santos
- **Username:** `maria_santos`
- **Email:** maria.santos@ufpi.edu.br
- **Curso:** Sistemas de Informação
- **Tags:** React, Vue.js, TypeScript, Figma, UX/UI Design
- **Descrição:** Desenvolvedora frontend com foco em React e UX/UI Design

### Pedro Costa
- **Username:** `pedro_costa`
- **Email:** pedro.costa@ifpi.edu.br
- **Curso:** Análise e Desenvolvimento de Sistemas
- **Tags:** Python, Django, FastAPI, Docker, Kubernetes, PostgreSQL
- **Descrição:** Especialista em backend com Python e Django, interessado em arquitetura de microsserviços

### Ana Oliveira
- **Username:** `ana_oliveira`
- **Email:** ana.oliveira@ufpi.edu.br
- **Curso:** Ciência da Computação
- **Tags:** Python, Machine Learning, TensorFlow, Pandas, Data Science, R
- **Descrição:** Data Scientist em formação, trabalha com Machine Learning e análise de dados

### Carlos Lima
- **Username:** `carlos_lima`
- **Email:** carlos.lima@uespi.br
- **Curso:** Engenharia de Software
- **Tags:** DevOps, AWS, Docker, Terraform, Ansible, Jenkins
- **Descrição:** DevOps enthusiast, ama automação e infraestrutura como código

### Lúcia Ferreira
- **Username:** `lucia_ferreira`
- **Email:** lucia.ferreira@ufpi.edu.br
- **Curso:** Ciência da Computação
- **Tags:** Flutter, Dart, React Native, Firebase, Mobile Development
- **Descrição:** Mobile developer focada em Flutter e desenvolvimento multiplataforma

### Bruna Martins (Novo)
- **Username:** `bruna_martins`
- **Email:** bruna.martins@ufpi.edu.br
- **Curso:** Engenharia Elétrica
- **Tags:** IoT, Automação, Arduino, C++, Eletrônica
- **Descrição:** Estudante de Engenharia Elétrica com interesse em IoT e automação residencial

### Rafael Gomes (Novo)
- **Username:** `rafael_gomes`
- **Email:** rafael.gomes@ifpi.edu.br
- **Curso:** Sistemas de Informação
- **Tags:** Java, Spring Boot, PostgreSQL, APIs, Microservices
- **Descrição:** Backend developer focado em Java, Spring Boot e bancos de dados

## 🏢 Empresas

### TechPicos Startup
- **Username:** `techpicos_startup`
- **Email:** contato@techpicos.com.br
- **Tags:** Agronegócio, IoT, Sustentabilidade, Inovação
- **Descrição:** Startup focada em soluções tecnológicas para o agronegócio piauiense

### InnovaTech PI
- **Username:** `innovatech_pi`
- **Email:** rh@innovatech.com.br
- **Tags:** Software Corporativo, Consultoria, ERP, CRM
- **Descrição:** Empresa de desenvolvimento de software corporativo e consultoria em TI

### DataCenter Nordeste
- **Username:** `datacenter_nordeste`
- **Email:** vagas@datacenter-ne.com.br
- **Tags:** Cloud Computing, Infraestrutura, Hosting, DevOps
- **Descrição:** Provedora de serviços de cloud computing e infraestrutura digital

### Software House PI
- **Username:** `software_house_pi`
- **Email:** contato@swhouse-pi.com.br
- **Tags:** Desenvolvimento Web, Mobile, Agile, Startups
- **Descrição:** Casa de software especializada em desenvolvimento web e mobile

### AI Solutions Brasil
- **Username:** `ai_solutions_br`
- **Email:** careers@aisolutions.com.br
- **Tags:** Inteligência Artificial, Machine Learning, Deep Learning, NLP
- **Descrição:** Empresa pioneira em soluções de inteligência artificial para diversos setores

### IoT Solutions Nordeste (Nova)
- **Username:** `iot_solutions`
- **Email:** contato@iotsolutions.com.br
- **Tags:** IoT, Automação, Smart Home, Arduino, Cloud
- **Descrição:** Empresa referência em automação residencial e soluções IoT

### Backend Experts Ltda. (Nova)
- **Username:** `backend_experts`
- **Email:** contato@backendexperts.com.br
- **Tags:** Java, Spring Boot, Microservices, APIs, Consultoria
- **Descrição:** Consultoria especializada em arquitetura de microsserviços e APIs Java

## 👑 Usuários Administrativos

### Admin
- **Username:** `admin`
- **Email:** admin@admin.com
- **Password:** MinhaSenh@123
- **Role:** admin

### Moderador
- **Username:** `moderador`
- **Email:** moderador@talentpool.com
- **Password:** MinhaSenh@123
- **Role:** moderator

## 🔐 Senha Padrão

Todos os usuários têm a mesma senha: `MinhaSenh@123`

## 🎯 Cenários de Teste de Recomendações

### Recomendações para Estudantes

#### Ana Oliveira (Data Science)
- **Tags:** Python, Machine Learning, TensorFlow, Pandas, Data Science, R
- **Recomendação Esperada:** AI Solutions Brasil (match perfeito com Machine Learning)

#### Carlos Lima (DevOps)
- **Tags:** DevOps, AWS, Docker, Terraform, Ansible, Jenkins
- **Recomendação Esperada:** DataCenter Nordeste (match perfeito com DevOps)

#### Lúcia Ferreira (Mobile)
- **Tags:** Flutter, Dart, React Native, Firebase, Mobile Development
- **Recomendação Esperada:** Software House PI (match com Mobile)

#### Bruna Martins (IoT)
- **Tags:** IoT, Automação, Arduino, C++, Eletrônica
- **Recomendação Esperada:** IoT Solutions Nordeste (match perfeito com IoT)

#### Rafael Gomes (Java Backend)
- **Tags:** Java, Spring Boot, PostgreSQL, APIs, Microservices
- **Recomendação Esperada:** Backend Experts Ltda. (match perfeito com Java/Spring)

### Recomendações para Empresas

#### AI Solutions Brasil (IA/ML)
- **Tags:** Inteligência Artificial, Machine Learning, Deep Learning, NLP
- **Recomendação Esperada:** Ana Oliveira (match perfeito com Machine Learning)

#### DataCenter Nordeste (Cloud/DevOps)
- **Tags:** Cloud Computing, Infraestrutura, Hosting, DevOps
- **Recomendação Esperada:** Carlos Lima (match perfeito com DevOps)

#### Software House PI (Web/Mobile)
- **Tags:** Desenvolvimento Web, Mobile, Agile, Startups
- **Recomendação Esperada:** Lúcia Ferreira (match com Mobile)

#### IoT Solutions Nordeste (IoT)
- **Tags:** IoT, Automação, Smart Home, Arduino, Cloud
- **Recomendação Esperada:** Bruna Martins (match perfeito com IoT)

#### Backend Experts Ltda. (Java)
- **Tags:** Java, Spring Boot, Microservices, APIs, Consultoria
- **Recomendação Esperada:** Rafael Gomes (match perfeito com Java/Spring)

## 💼 Vagas de Emprego

1. **Desenvolvedor Full Stack React/Node.js** - TechPicos Startup
2. **Data Scientist Junior** - AI Solutions Brasil
3. **DevOps Engineer** - DataCenter Nordeste
4. **Mobile Developer Flutter** - Software House PI
5. **Analista de Sistemas Sênior** - InnovaTech PI

## 📝 Candidaturas

Várias candidaturas foram criadas simulando aplicações reais às vagas.

## ❤️ Likes

Likes mútuos foram criados entre estudantes e empresas para testar funcionalidades sociais.

## 🚀 Como Executar o Seed

```bash
# Executar apenas o seed de usuários
npx ts-node prisma/seeds/users.ts

# Ou executar todos os seeds
npm run seed
```

## 📈 Melhorias Recentes

- **Adicionados 2 novos estudantes:** Bruna Martins (IoT) e Rafael Gomes (Java Backend)
- **Adicionadas 2 novas empresas:** IoT Solutions Nordeste e Backend Experts Ltda.
- **Cenários de teste expandidos:** Agora há matches perfeitos para testar o algoritmo de recomendações
- **Cobertura tecnológica ampliada:** IoT, Java/Spring Boot, automação residencial, consultoria backend</content>
<parameter name="filePath">/home/adrinator/talentPoolBackRemake/USERS_SEED.md
