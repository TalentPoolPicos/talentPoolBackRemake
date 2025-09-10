import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface StudentProfile {
  username: string;
  name: string;
  email: string;
  description: string;
}

interface EnterpriseProfile {
  username: string;
  name: string;
  email: string;
  socialReason: string;
  fantasyName: string;
  description: string;
}

// Perfis de estudantes
const studentProfiles: StudentProfile[] = [
  {
    username: 'joao_silva',
    name: 'João Silva',
    email: 'joao.silva@ufpi.edu.br',
    description:
      'Estudante de Ciência da Computação apaixonado por desenvolvimento web e inteligência artificial.',
  },
  {
    username: 'maria_santos',
    name: 'Maria Santos',
    email: 'maria.santos@ufpi.edu.br',
    description: 'Desenvolvedora frontend com foco em React e UX/UI Design.',
  },
  {
    username: 'pedro_costa',
    name: 'Pedro Costa',
    email: 'pedro.costa@ifpi.edu.br',
    description:
      'Especialista em backend com Python e Django, interessado em arquitetura de microsserviços.',
  },
  {
    username: 'ana_oliveira',
    name: 'Ana Oliveira',
    email: 'ana.oliveira@ufpi.edu.br',
    description:
      'Data Scientist em formação, trabalha com Machine Learning e análise de dados.',
  },
  {
    username: 'carlos_lima',
    name: 'Carlos Lima',
    email: 'carlos.lima@uespi.br',
    description:
      'DevOps enthusiast, ama automação e infraestrutura como código.',
  },
  {
    username: 'lucia_ferreira',
    name: 'Lúcia Ferreira',
    email: 'lucia.ferreira@ufpi.edu.br',
    description:
      'Mobile developer focada em Flutter e desenvolvimento multiplataforma.',
  },
  {
    username: 'bruno_alves',
    name: 'Bruno Alves',
    email: 'bruno.alves@ifpi.edu.br',
    description:
      'Cybersecurity researcher interessado em ethical hacking e pentesting.',
  },
  {
    username: 'camila_rocha',
    name: 'Camila Rocha',
    email: 'camila.rocha@ufpi.edu.br',
    description:
      'Full-stack developer com experiência em Node.js e PostgreSQL.',
  },
  {
    username: 'rafael_sousa',
    name: 'Rafael Sousa',
    email: 'rafael.sousa@uespi.br',
    description: 'Game developer apaixonado por Unity e design de jogos indie.',
  },
  {
    username: 'juliana_melo',
    name: 'Juliana Melo',
    email: 'juliana.melo@ufpi.edu.br',
    description:
      'QA engineer especializada em testes automatizados e metodologias ágeis.',
  },
];

// Perfis de empresas
const enterpriseProfiles: EnterpriseProfile[] = [
  {
    username: 'techpicos_startup',
    name: 'TechPicos Startup',
    email: 'contato@techpicos.com.br',
    socialReason: 'TechPicos Tecnologia e Inovação Ltda.',
    fantasyName: 'TechPicos',
    description:
      'Startup focada em soluções tecnológicas para o agronegócio piauiense.',
  },
  {
    username: 'innovatech_pi',
    name: 'InnovaTech PI',
    email: 'rh@innovatech.com.br',
    socialReason: 'InnovaTech Piauí Desenvolvimento de Software S.A.',
    fantasyName: 'InnovaTech',
    description:
      'Empresa de desenvolvimento de software corporativo e consultoria em TI.',
  },
  {
    username: 'datacenter_nordeste',
    name: 'DataCenter Nordeste',
    email: 'vagas@datacenter-ne.com.br',
    socialReason: 'DataCenter Nordeste Infraestrutura Digital Ltda.',
    fantasyName: 'DC Nordeste',
    description:
      'Provedora de serviços de cloud computing e infraestrutura digital.',
  },
  {
    username: 'software_house_pi',
    name: 'Software House PI',
    email: 'contato@swhouse-pi.com.br',
    socialReason: 'Software House Piauí Desenvolvimento Ágil ME',
    fantasyName: 'SH Piauí',
    description:
      'Casa de software especializada em desenvolvimento web e mobile.',
  },
  {
    username: 'ai_solutions_br',
    name: 'AI Solutions Brasil',
    email: 'careers@aisolutions.com.br',
    socialReason: 'AI Solutions Brasil Inteligência Artificial Ltda.',
    fantasyName: 'AI Solutions',
    description:
      'Empresa pioneira em soluções de inteligência artificial para diversos setores.',
  },
];

async function seedUsers() {
  console.log('🌱 Iniciando seed de usuários...');

  // Limpar dados existentes (opcional - descomente se necessário)
  // await prisma.student.deleteMany();
  // await prisma.enterprise.deleteMany();
  // await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('MinhaSenh@123', 12);

  // Criar usuários estudantes
  console.log('👨‍🎓 Criando usuários estudantes...');
  for (const profile of studentProfiles) {
    try {
      const user = await prisma.user.create({
        data: {
          username: profile.username,
          email: profile.email,
          password: hashedPassword,
          role: 'student',
          name: profile.name,
          description: profile.description,
          isActive: true,
          isVerified: true,
          isComplete: true,
        },
      });

      await prisma.student.create({
        data: {
          userId: user.id,
        },
      });

      console.log(`✅ Estudante criado: ${profile.username}`);
    } catch (error) {
      console.log(`❌ Erro ao criar estudante ${profile.username}:`, error);
    }
  }

  // Criar usuários empresas
  console.log('🏢 Criando usuários empresas...');
  for (const profile of enterpriseProfiles) {
    try {
      const user = await prisma.user.create({
        data: {
          username: profile.username,
          email: profile.email,
          password: hashedPassword,
          role: 'enterprise',
          name: profile.name,
          description: profile.description,
          isActive: true,
          isVerified: true,
          isComplete: true,
        },
      });

      await prisma.enterprise.create({
        data: {
          userId: user.id,
        },
      });

      console.log(`✅ Empresa criada: ${profile.username}`);
    } catch (error) {
      console.log(`❌ Erro ao criar empresa ${profile.username}:`, error);
    }
  }

  // Criar usuário admin
  console.log('👑 Criando usuário administrador...');
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

  // Criar usuário moderador
  console.log('🛡️ Criando usuário moderador...');
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

  console.log('🎉 Seed de usuários concluído!');
}

async function main() {
  try {
    await seedUsers();
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
