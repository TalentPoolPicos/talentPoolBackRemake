import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Dados expandidos para estudantes
const studentsData = [
  {
    username: 'joao_silva',
    name: 'João Silva',
    email: 'joao.silva@ufpi.edu.br',
    description:
      'Estudante de Ciência da Computação apaixonado por desenvolvimento web e inteligência artificial.',
    birthDate: new Date('1999-03-15'),
    course: 'Ciência da Computação',
    registrationNumber: '20190001',
    lattes: 'http://lattes.cnpq.br/1234567890123456',
    address: {
      zipCode: '64000-100',
      street: 'Rua das Flores, 123',
      neighborhood: 'Centro',
      city: 'Teresina',
      state: 'PI',
    },
    tags: ['JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning'],
    socialMedia: [
      { type: 'linkedin', url: 'https://linkedin.com/in/joao-silva' },
      { type: 'github', url: 'https://github.com/joaosilva' },
    ],
  },
  {
    username: 'bruna_martins',
    name: 'Bruna Martins',
    email: 'bruna.martins@ufpi.edu.br',
    description:
      'Estudante de Engenharia Elétrica com interesse em IoT e automação residencial.',
    birthDate: new Date('2002-02-10'),
    course: 'Engenharia Elétrica',
    registrationNumber: '20220007',
    lattes: 'http://lattes.cnpq.br/7890123456789012',
    address: {
      zipCode: '64006-700',
      street: 'Rua Projetada, 111',
      neighborhood: 'Mocambinho',
      city: 'Teresina',
      state: 'PI',
    },
    tags: ['IoT', 'Automação', 'Arduino', 'C++', 'Eletrônica'],
    socialMedia: [
      { type: 'linkedin', url: 'https://linkedin.com/in/bruna-martins' },
      { type: 'github', url: 'https://github.com/brunamartins' },
    ],
  },
  {
    username: 'rafael_gomes',
    name: 'Rafael Gomes',
    email: 'rafael.gomes@ifpi.edu.br',
    description:
      'Backend developer focado em Java, Spring Boot e bancos de dados.',
    birthDate: new Date('1997-12-05'),
    course: 'Sistemas de Informação',
    registrationNumber: '20170008',
    lattes: 'http://lattes.cnpq.br/8901234567890123',
    address: {
      zipCode: '64007-800',
      street: 'Rua Nova, 222',
      neighborhood: 'Vermelha',
      city: 'Teresina',
      state: 'PI',
    },
    tags: ['Java', 'Spring Boot', 'PostgreSQL', 'APIs', 'Microservices'],
    socialMedia: [
      { type: 'linkedin', url: 'https://linkedin.com/in/rafael-gomes' },
      { type: 'github', url: 'https://github.com/rafaelgomes' },
    ],
  },
  {
    username: 'maria_santos',
    name: 'Maria Santos',
    email: 'maria.santos@ufpi.edu.br',
    description: 'Desenvolvedora frontend com foco em React e UX/UI Design.',
    birthDate: new Date('2000-07-22'),
    course: 'Sistemas de Informação',
    registrationNumber: '20200002',
    lattes: 'http://lattes.cnpq.br/2345678901234567',
    address: {
      zipCode: '64001-200',
      street: 'Av. Frei Serafim, 456',
      neighborhood: 'Centro',
      city: 'Teresina',
      state: 'PI',
    },
    tags: ['React', 'Vue.js', 'TypeScript', 'Figma', 'UX/UI Design'],
    socialMedia: [
      { type: 'linkedin', url: 'https://linkedin.com/in/maria-santos' },
      { type: 'instagram', url: 'https://instagram.com/maria_design' },
      { type: 'github', url: 'https://github.com/mariasantos' },
    ],
  },
  {
    username: 'pedro_costa',
    name: 'Pedro Costa',
    email: 'pedro.costa@ifpi.edu.br',
    description:
      'Especialista em backend com Python e Django, interessado em arquitetura de microsserviços.',
    birthDate: new Date('1998-11-08'),
    course: 'Análise e Desenvolvimento de Sistemas',
    registrationNumber: '20180003',
    lattes: 'http://lattes.cnpq.br/3456789012345678',
    address: {
      zipCode: '64002-300',
      street: 'Rua Paissandu, 789',
      neighborhood: 'Fátima',
      city: 'Teresina',
      state: 'PI',
    },
    tags: ['Python', 'Django', 'FastAPI', 'Docker', 'Kubernetes', 'PostgreSQL'],
    socialMedia: [
      { type: 'linkedin', url: 'https://linkedin.com/in/pedro-costa' },
      { type: 'github', url: 'https://github.com/pedrocosta' },
    ],
  },
  {
    username: 'ana_oliveira',
    name: 'Ana Oliveira',
    email: 'ana.oliveira@ufpi.edu.br',
    description:
      'Data Scientist em formação, trabalha com Machine Learning e análise de dados.',
    birthDate: new Date('2001-01-30'),
    course: 'Ciência da Computação',
    registrationNumber: '20210004',
    lattes: 'http://lattes.cnpq.br/4567890123456789',
    address: {
      zipCode: '64003-400',
      street: 'Rua Simplício Mendes, 321',
      neighborhood: 'Ininga',
      city: 'Teresina',
      state: 'PI',
    },
    tags: [
      'Python',
      'Machine Learning',
      'TensorFlow',
      'Pandas',
      'Data Science',
      'R',
    ],
    socialMedia: [
      { type: 'linkedin', url: 'https://linkedin.com/in/ana-oliveira' },
      { type: 'github', url: 'https://github.com/anaoliveira' },
    ],
  },
  {
    username: 'carlos_lima',
    name: 'Carlos Lima',
    email: 'carlos.lima@uespi.br',
    description:
      'DevOps enthusiast, ama automação e infraestrutura como código.',
    birthDate: new Date('1999-09-12'),
    course: 'Engenharia de Software',
    registrationNumber: '20190005',
    lattes: 'http://lattes.cnpq.br/5678901234567890',
    address: {
      zipCode: '64004-500',
      street: 'Av. João XXIII, 654',
      neighborhood: 'Pirajá',
      city: 'Teresina',
      state: 'PI',
    },
    tags: ['DevOps', 'AWS', 'Docker', 'Terraform', 'Ansible', 'Jenkins'],
    socialMedia: [
      { type: 'linkedin', url: 'https://linkedin.com/in/carlos-lima' },
      { type: 'github', url: 'https://github.com/carloslima' },
    ],
  },
  {
    username: 'lucia_ferreira',
    name: 'Lúcia Ferreira',
    email: 'lucia.ferreira@ufpi.edu.br',
    description:
      'Mobile developer focada em Flutter e desenvolvimento multiplataforma.',
    birthDate: new Date('2000-05-18'),
    course: 'Ciência da Computação',
    registrationNumber: '20200006',
    lattes: 'http://lattes.cnpq.br/6789012345678901',
    address: {
      zipCode: '64005-600',
      street: 'Rua Coelho Rodrigues, 987',
      neighborhood: 'Dirceu',
      city: 'Teresina',
      state: 'PI',
    },
    tags: ['Flutter', 'Dart', 'React Native', 'Firebase', 'Mobile Development'],
    socialMedia: [
      { type: 'linkedin', url: 'https://linkedin.com/in/lucia-ferreira' },
      { type: 'github', url: 'https://github.com/luciaferreira' },
    ],
  },
];

// Dados expandidos para empresas
const enterprisesData = [
  {
    username: 'techpicos_startup',
    name: 'TechPicos Startup',
    email: 'contato@techpicos.com.br',
    description:
      'Startup focada em soluções tecnológicas para o agronegócio piauiense.',
    socialReason: 'TechPicos Tecnologia e Inovação Ltda.',
    fantasyName: 'TechPicos',
    cnpj: '12.345.678/0001-90',
    address: {
      zipCode: '64000-000',
      street: 'Av. Barão de Gurguéia, 1000',
      neighborhood: 'Centro',
      city: 'Teresina',
      state: 'PI',
    },
    tags: ['Agronegócio', 'IoT', 'Sustentabilidade', 'Inovação'],
    socialMedia: [
      { type: 'linkedin', url: 'https://linkedin.com/company/techpicos' },
      { type: 'instagram', url: 'https://instagram.com/techpicos' },
      { type: 'facebook', url: 'https://facebook.com/techpicos' },
    ],
  },
  {
    username: 'iot_solutions',
    name: 'IoT Solutions Nordeste',
    email: 'contato@iotsolutions.com.br',
    description: 'Empresa referência em automação residencial e soluções IoT.',
    socialReason: 'IoT Solutions Nordeste Ltda.',
    fantasyName: 'IoT Solutions',
    cnpj: '67.890.123/0001-45',
    address: {
      zipCode: '64008-900',
      street: 'Rua das Inovações, 333',
      neighborhood: 'Inova',
      city: 'Teresina',
      state: 'PI',
    },
    tags: ['IoT', 'Automação', 'Smart Home', 'Arduino', 'Cloud'],
    socialMedia: [
      { type: 'linkedin', url: 'https://linkedin.com/company/iot-solutions' },
      { type: 'github', url: 'https://github.com/iotsolutions' },
    ],
  },
  {
    username: 'backend_experts',
    name: 'Backend Experts Ltda.',
    email: 'contato@backendexperts.com.br',
    description:
      'Consultoria especializada em arquitetura de microsserviços e APIs Java.',
    socialReason: 'Backend Experts Ltda.',
    fantasyName: 'Backend Experts',
    cnpj: '78.901.234/0001-56',
    address: {
      zipCode: '64009-111',
      street: 'Rua dos Servidores, 444',
      neighborhood: 'TI',
      city: 'Teresina',
      state: 'PI',
    },
    tags: ['Java', 'Spring Boot', 'Microservices', 'APIs', 'Consultoria'],
    socialMedia: [
      { type: 'linkedin', url: 'https://linkedin.com/company/backend-experts' },
      { type: 'github', url: 'https://github.com/backendexperts' },
    ],
  },
  {
    username: 'innovatech_pi',
    name: 'InnovaTech PI',
    email: 'rh@innovatech.com.br',
    description:
      'Empresa de desenvolvimento de software corporativo e consultoria em TI.',
    socialReason: 'InnovaTech Piauí Desenvolvimento de Software S.A.',
    fantasyName: 'InnovaTech',
    cnpj: '23.456.789/0001-01',
    address: {
      zipCode: '64001-000',
      street: 'Rua Álvaro Mendes, 500',
      neighborhood: 'Centro',
      city: 'Teresina',
      state: 'PI',
    },
    tags: ['Software Corporativo', 'Consultoria', 'ERP', 'CRM'],
    socialMedia: [
      { type: 'linkedin', url: 'https://linkedin.com/company/innovatech-pi' },
      { type: 'facebook', url: 'https://facebook.com/innovatechpi' },
    ],
  },
  {
    username: 'datacenter_nordeste',
    name: 'DataCenter Nordeste',
    email: 'vagas@datacenter-ne.com.br',
    description:
      'Provedora de serviços de cloud computing e infraestrutura digital.',
    socialReason: 'DataCenter Nordeste Infraestrutura Digital Ltda.',
    fantasyName: 'DC Nordeste',
    cnpj: '34.567.890/0001-12',
    address: {
      zipCode: '64002-000',
      street: 'Av. Homero Castelo Branco, 2000',
      neighborhood: 'Horto',
      city: 'Teresina',
      state: 'PI',
    },
    tags: ['Cloud Computing', 'Infraestrutura', 'Hosting', 'DevOps'],
    socialMedia: [
      {
        type: 'linkedin',
        url: 'https://linkedin.com/company/datacenter-nordeste',
      },
      { type: 'facebook', url: 'https://facebook.com/datacenternordeste' },
    ],
  },
  {
    username: 'software_house_pi',
    name: 'Software House PI',
    email: 'contato@swhouse-pi.com.br',
    description:
      'Casa de software especializada em desenvolvimento web e mobile.',
    socialReason: 'Software House Piauí Desenvolvimento Ágil ME',
    fantasyName: 'SH Piauí',
    cnpj: '45.678.901/0001-23',
    address: {
      zipCode: '64003-000',
      street: 'Rua São Pedro, 300',
      neighborhood: 'Ilhotas',
      city: 'Teresina',
      state: 'PI',
    },
    tags: ['Desenvolvimento Web', 'Mobile', 'Agile', 'Startups'],
    socialMedia: [
      {
        type: 'linkedin',
        url: 'https://linkedin.com/company/software-house-pi',
      },
      { type: 'github', url: 'https://github.com/software-house-pi' },
    ],
  },
  {
    username: 'ai_solutions_br',
    name: 'AI Solutions Brasil',
    email: 'careers@aisolutions.com.br',
    description:
      'Empresa pioneira em soluções de inteligência artificial para diversos setores.',
    socialReason: 'AI Solutions Brasil Inteligência Artificial Ltda.',
    fantasyName: 'AI Solutions',
    cnpj: '56.789.012/0001-34',
    address: {
      zipCode: '64004-000',
      street: 'Av. Miguel Rosa, 1500',
      neighborhood: 'São Cristóvão',
      city: 'Teresina',
      state: 'PI',
    },
    tags: [
      'Inteligência Artificial',
      'Machine Learning',
      'Deep Learning',
      'NLP',
    ],
    socialMedia: [
      { type: 'linkedin', url: 'https://linkedin.com/company/ai-solutions-br' },
      { type: 'github', url: 'https://github.com/ai-solutions-br' },
    ],
  },
];

async function createUser(userData: any, role: 'student' | 'enterprise') {
  const hashedPassword = await bcrypt.hash('MinhaSenh@123', 12);

  const user = await prisma.user.create({
    data: {
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: role,
      name: userData.name,
      description: userData.description,
      birthDate: userData.birthDate || null,
      isActive: true,
      isVerified: true,
      isComplete: true,
    },
  });

  // Criar endereço
  if (userData.address) {
    await prisma.address.create({
      data: {
        userId: user.id,
        zipCode: userData.address.zipCode,
        street: userData.address.street,
        neighborhood: userData.address.neighborhood,
        city: userData.address.city,
        state: userData.address.state,
      },
    });
  }

  // Criar tags
  if (userData.tags) {
    for (const tagLabel of userData.tags) {
      await prisma.tag.create({
        data: {
          userId: user.id,
          label: tagLabel,
        },
      });
    }
  }

  // Criar redes sociais
  if (userData.socialMedia) {
    for (const social of userData.socialMedia) {
      await prisma.socialMedia.create({
        data: {
          userId: user.id,
          type: social.type,
          url: social.url,
        },
      });
    }
  }

  return user;
}

async function seedUsers() {
  console.log('🌱 Iniciando seed completo de usuários...');

  // Criar usuários estudantes com perfis completos
  console.log('👨‍🎓 Criando usuários estudantes...');
  const students: any[] = [];
  for (const studentData of studentsData) {
    try {
      const user = await createUser(studentData, 'student');

      const student = await prisma.student.create({
        data: {
          userId: user.id,
          course: studentData.course,
          registrationNumber: studentData.registrationNumber,
          lattes: studentData.lattes,
        },
      });

      students.push({ user, student });
      console.log(`✅ Estudante criado: ${studentData.username}`);
    } catch (error) {
      console.log(`❌ Erro ao criar estudante ${studentData.username}:`, error);
    }
  }

  // Criar usuários empresas com perfis completos
  console.log('🏢 Criando usuários empresas...');
  const enterprises: any[] = [];
  for (const enterpriseData of enterprisesData) {
    try {
      const user = await createUser(enterpriseData, 'enterprise');

      const enterprise = await prisma.enterprise.create({
        data: {
          userId: user.id,
          socialReason: enterpriseData.socialReason,
          fantasyName: enterpriseData.fantasyName,
          cnpj: enterpriseData.cnpj,
        },
      });

      enterprises.push({ user, enterprise });
      console.log(`✅ Empresa criada: ${enterpriseData.username}`);
    } catch (error) {
      console.log(
        `❌ Erro ao criar empresa ${enterpriseData.username}:`,
        error,
      );
    }
  }

  // Criar usuários administrativos
  console.log('👑 Criando usuários administrativos...');
  const hashedPassword = await bcrypt.hash('MinhaSenh@123', 12);

  try {
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin',
        name: 'Administrador do Sistema',
        description: 'Usuário administrador do sistema TalentPool',
        isActive: true,
        isVerified: true,
        isComplete: true,
      },
    });
    console.log('✅ Administrador criado: admin');
  } catch (error) {
    console.log('❌ Erro ao criar administrador:', error);
  }

  try {
    await prisma.user.create({
      data: {
        username: 'moderador',
        email: 'moderador@talentpool.com',
        password: hashedPassword,
        role: 'moderator',
        name: 'Moderador do Sistema',
        description: 'Usuário moderador do sistema TalentPool',
        isActive: true,
        isVerified: true,
        isComplete: true,
      },
    });
    console.log('✅ Moderador criado: moderador');
  } catch (error) {
    console.log('❌ Erro ao criar moderador:', error);
  }

  return { students, enterprises };
}

async function seedJobs(enterprises: any[]) {
  console.log('💼 Criando vagas de emprego...');

  const jobsData = [
    {
      title: 'Desenvolvedor Full Stack React/Node.js',
      body: `
        Estamos buscando um desenvolvedor Full Stack para integrar nossa equipe de tecnologia.
        
        **Responsabilidades:**
        - Desenvolver aplicações web usando React.js e Node.js
        - Colaborar com equipes de design e produto
        - Manter código limpo e documentado
        - Participar de code reviews
        
        **Requisitos:**
        - Experiência com JavaScript ES6+
        - Conhecimento em React.js e Node.js
        - Familiaridade com bancos de dados SQL e NoSQL
        - Conhecimento em Git
        
        **Diferenciais:**
        - TypeScript
        - Docker
        - Experiência com AWS
        
        **Oferecemos:**
        - Salário compatível com o mercado
        - Plano de saúde
        - Vale refeição
        - Home office flexível
      `,
      enterpriseId: enterprises[0].enterprise.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    },
    {
      title: 'Data Scientist Junior',
      body: `
        Oportunidade para Data Scientist iniciante em empresa de IA.
        
        **O que você vai fazer:**
        - Análise exploratória de dados
        - Desenvolvimento de modelos de ML
        - Criação de dashboards e visualizações
        - Colaboração com equipe de engenharia
        
        **Requisitos:**
        - Formação em área correlata
        - Python e bibliotecas de ML (pandas, scikit-learn)
        - SQL básico
        - Inglês técnico
        
        **Diferenciais:**
        - TensorFlow/PyTorch
        - R
        - Experiência com Big Data
        
        **Benefícios:**
        - Plano de carreira estruturado
        - Cursos e certificações
        - Ambiente inovador
      `,
      enterpriseId: enterprises[4].enterprise.id,
      expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 dias
    },
    {
      title: 'DevOps Engineer',
      body: `
        Buscamos profissional DevOps para modernizar nossa infraestrutura.
        
        **Principais atividades:**
        - Automação de deployments
        - Gerenciamento de infraestrutura na nuvem
        - Monitoramento e observabilidade
        - Implementação de CI/CD
        
        **Requisitos técnicos:**
        - Docker e Kubernetes
        - AWS/GCP/Azure
        - Terraform ou CloudFormation
        - Linux/Unix
        
        **Experiência desejada:**
        - Jenkins, GitLab CI ou GitHub Actions
        - Monitoring (Prometheus, Grafana)
        - Infrastructure as Code
        
        **Oferecemos:**
        - Salário acima da média
        - Stock options
        - Ambiente colaborativo
        - Flexibilidade de horários
      `,
      enterpriseId: enterprises[2].enterprise.id,
      expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 dias
    },
    {
      title: 'Mobile Developer Flutter',
      body: `
        Desenvolva aplicativos mobile inovadores com Flutter!
        
        **Responsabilidades:**
        - Desenvolvimento de apps multiplataforma
        - Integração com APIs REST
        - Otimização de performance
        - Publicação nas stores
        
        **Requisitos:**
        - Flutter e Dart
        - Experiência com mobile development
        - Git e versionamento
        - Conhecimento de UX/UI
        
        **Diferenciais:**
        - Firebase
        - Native development (iOS/Android)
        - Redux/BLoC pattern
        
        **Benefícios:**
        - Equipamento de última geração
        - Plano de saúde premium
        - Auxílio educação
        - Team building
      `,
      enterpriseId: enterprises[3].enterprise.id,
      expiresAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 dias
    },
    {
      title: 'Analista de Sistemas Sênior',
      body: `
        Vaga para Analista de Sistemas com foco em sistemas corporativos.
        
        **Atividades:**
        - Análise e levantamento de requisitos
        - Modelagem de processos
        - Documentação técnica
        - Suporte a equipe de desenvolvimento
        
        **Requisitos:**
        - Superior completo em TI
        - Experiência com sistemas ERP
        - Conhecimento em bancos de dados
        - Metodologias ágeis
        
        **Desejável:**
        - Certificações em análise de sistemas
        - Conhecimento em UML
        - Experiência com integração de sistemas
        
        **Oferecemos:**
        - Excelente remuneração
        - Participação nos lucros
        - Crescimento profissional
        - Estabilidade
      `,
      enterpriseId: enterprises[1].enterprise.id,
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 dias
    },
  ];

  const createdJobs: any[] = [];
  for (const jobData of jobsData) {
    try {
      const job = await prisma.job.create({
        data: {
          title: jobData.title,
          body: jobData.body,
          status: 'published',
          publishedAt: new Date(),
          expiresAt: jobData.expiresAt,
          enterpriseId: jobData.enterpriseId,
        },
      });

      createdJobs.push(job);
      console.log(`✅ Vaga criada: ${jobData.title}`);
    } catch (error) {
      console.log(`❌ Erro ao criar vaga ${jobData.title}:`, error);
    }
  }

  return createdJobs;
}

async function seedJobApplications(students: any[], jobs: any[]) {
  console.log('📝 Criando candidaturas...');

  const applications = [
    {
      studentId: students[0].student.id, // João Silva
      jobId: jobs[0].id, // Full Stack
      coverLetter:
        'Tenho experiência sólida em React e Node.js, além de projetos pessoais que demonstram minha paixão por desenvolvimento web.',
      status: 'pending',
    },
    {
      studentId: students[0].student.id, // João Silva
      jobId: jobs[1].id, // Data Scientist
      coverLetter:
        'Apesar de meu foco ser desenvolvimento web, tenho estudado Machine Learning e gostaria de migrar para Data Science.',
      status: 'reviewing',
    },
    {
      studentId: students[1].student.id, // Maria Santos
      jobId: jobs[3].id, // Mobile Flutter
      coverLetter:
        'Sou apaixonada por UX/UI e mobile development. Tenho projetos pessoais em Flutter que posso apresentar.',
      status: 'approved',
    },
    {
      studentId: students[2].student.id, // Pedro Costa
      jobId: jobs[2].id, // DevOps
      coverLetter:
        'Minha experiência com Docker e Python me preparou bem para DevOps. Estou ansioso para trabalhar com infraestrutura.',
      status: 'pending',
    },
    {
      studentId: students[3].student.id, // Ana Oliveira
      jobId: jobs[1].id, // Data Scientist
      coverLetter:
        'Data Science é minha paixão! Tenho projetos com TensorFlow e experiência em análise de dados.',
      status: 'approved',
    },
    {
      studentId: students[4].student.id, // Carlos Lima
      jobId: jobs[2].id, // DevOps
      coverLetter:
        'DevOps é minha área de especialização. Tenho experiência com AWS, Docker e automação.',
      status: 'reviewing',
    },
    {
      studentId: students[5].student.id, // Lúcia Ferreira
      jobId: jobs[3].id, // Mobile Flutter
      coverLetter:
        'Flutter é minha especialidade! Tenho vários apps publicados e experiência com Firebase.',
      status: 'pending',
    },
  ];

  for (const appData of applications) {
    try {
      await prisma.jobApplication.create({
        data: {
          studentId: appData.studentId,
          jobId: appData.jobId,
          coverLetter: appData.coverLetter,
          status: appData.status as any,
          appliedAt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
          ), // Random data nos últimos 7 dias
        },
      });
      console.log(`✅ Candidatura criada para vaga ${appData.jobId}`);
    } catch (error) {
      console.log(`❌ Erro ao criar candidatura:`, error);
    }
  }
}

async function seedLikes(students: any[], enterprises: any[]) {
  console.log('❤️ Criando likes entre usuários...');

  const likes = [
    { initiatorId: students[0].user.id, receiverId: enterprises[0].user.id },
    { initiatorId: students[1].user.id, receiverId: enterprises[1].user.id },
    { initiatorId: students[2].user.id, receiverId: enterprises[2].user.id },
    { initiatorId: enterprises[0].user.id, receiverId: students[0].user.id },
    { initiatorId: enterprises[1].user.id, receiverId: students[1].user.id },
    { initiatorId: enterprises[3].user.id, receiverId: students[5].user.id },
    { initiatorId: students[3].user.id, receiverId: students[4].user.id },
    { initiatorId: students[4].user.id, receiverId: students[3].user.id },
  ];

  for (const like of likes) {
    try {
      await prisma.like.create({
        data: like,
      });
      console.log(
        `✅ Like criado entre usuários ${like.initiatorId} e ${like.receiverId}`,
      );
    } catch (error) {
      console.log(`❌ Erro ao criar like:`, error);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando seed completo do TalentPool...');

    // Seed usuários (estudantes e empresas)
    const { students, enterprises } = await seedUsers();

    // Seed vagas
    const jobs = await seedJobs(enterprises);

    // Seed candidaturas
    await seedJobApplications(students, jobs);

    // Seed likes
    await seedLikes(students, enterprises);

    console.log('🎉 Seed completo concluído com sucesso!');
    console.log(`📊 Resumo:`);
    console.log(`   • ${students.length} estudantes criados`);
    console.log(`   • ${enterprises.length} empresas criadas`);
    console.log(`   • ${jobs.length} vagas criadas`);
    console.log(`   • Candidaturas e likes criados`);
    console.log(`   • 2 usuários administrativos criados`);
  } catch (error) {
    console.error('💥 Erro durante o seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
