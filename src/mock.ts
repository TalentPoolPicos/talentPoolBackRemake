interface UserStudentProfile {
  username: string;
  name: string;
  description: string;
}

/* 30 perfis — nomes ainda mais criativos e descrições mais densas
   (mantêm o mesmo espírito “café, código e ABNT”, mas com + detalhes) */
const userStudentProfiles: UserStudentProfile[] = [
  {
    username: 'astro_leya',
    name: 'Leya Galáctica',
    description:
      'Compila constelações em Python enquanto anota referências cruzadas em LaTeX; diz que a Via Láctea é só um “array de galáxias” aguardando indexação no Scopus. Quando o script falha, ela reinicia o universo com `git reset --hard bigbang` 🌌🚀.',
  },
  {
    username: 'byte_bardo',
    name: 'Bardo dos Bytes',
    description:
      'Escreve sonetos hexadecimais em Bash, onde cada verso termina em `; do echo fi`. Defende que Shakespeare foi o primeiro “full-stack poet” e traduz Hamlet para JSON por hobby. 📜💻',
  },
  {
    username: 'quantum_vivi',
    name: 'Vivi Qubit',
    description:
      'Pula entre superposições de café ☕ e chá 🍵 para manter as abas do Chrome em coerência quântica. Publica preprints que colapsam a função de onda do reviewer: **ACEITO** em 0,0 s.',
  },
  {
    username: 'adriano_wave',
    name: 'Adriano de Schrödinger',
    description:
      'Simultaneamente reprovado e aprovado até que o professor abra a planilha. Seus commits têm função de onda própria; _merge_ só após medição peer-review 🐈📈.',
  },
  {
    username: 'marcos_gui',
    name: 'Marcos GUI',
    description:
      'Cola _Post-its_ na tela para “agilizar interfaces”, depois transforma tudo em Figma auto-layout às 03 h. Defende que **Ctrl+Z** é a verdadeira Máquina do Tempo. ⌚🖱️',
  },
  {
    username: 'cyber_sara',
    name: 'Sara Cyberpunk',
    description:
      'Renderiza neon em CSS e cita Gibson em notas de rodapé ABNT. Diz que a distopia só começa quando o Wi-Fi cai; por isso tem failover em 3G, 4G e sinal de fumaça 🔥📡.',
  },
  {
    username: 'drone_dan',
    name: 'Dan DronePilot',
    description:
      'Faz coleta de dados com enxames de drones e descreve tudo em RFC próprio. Quando precisa _debugar_, sobe no telhado e pinga os quad-copters com ICMP visual 🚁📶.',
  },
  {
    username: 'pixel_pythia',
    name: 'Pythia dos Pixels',
    description:
      'Interpreta vogais de imagens JPEG como presságios de UX. Prediz _trends_ de design olhando histograma de cores e citando Platão em nota de rodapé. 🎨🔮',
  },
  {
    username: 'cache_cadu',
    name: 'Cadu Cache',
    description:
      'Lembra de tudo, menos o prazo: L1 para memes, L2 para datas de submissão. Quando falha, invalida a memória com `rm -rf /var/procrastination` 🗓️🗂️.',
  },
  {
    username: 'glitch_glau',
    name: 'Glau Glitch',
    description:
      'Trata _segmentation faults_ como formas de arte digital; salva _core dumps_ em NFT e vende na OpenSea. A tese de mestrado chama-se “Belle Époque do Buffer Overflow”. 💾🎭',
  },
  {
    username: 'tensor_tati',
    name: 'Tati Tensor',
    description:
      'Treina redes neurais que reconhecem referências cruzadas fora do padrão APA. Diz que overfitting é “apenas uma amizade tóxica com o dataset”. 🤖📚',
  },
  {
    username: 'nando_node',
    name: 'Nando NodeMon',
    description:
      'Reinicia amizades automaticamente sempre que detecta _cringe_ em hot reload. Faz live-coding às 2 a.m. e chama de “dark-launch de carisma”. 🌙⚡',
  },
  {
    username: 'kube_keila',
    name: 'Keila K8s',
    description:
      'Orquestra panelas na cozinha via Kubernetes: cada prato em seu pod, escalonamento automático na hora do almoço. Documentation-as-Yaml grudada na geladeira. 🍲🐳',
  },
  {
    username: 'retro_rafa',
    name: 'Rafa Retro',
    description:
      'Programa em COBOL por esporte e versiona fitas cassete no Git. Garante que _punch cards_ possuem a melhor UX: “não quebram mesmo se acabar a bateria”. 🕹️⏳',
  },
  {
    username: 'mono_mila',
    name: 'Mila Monad',
    description:
      'Explica relacionamentos amorosos usando Mônadas em Haskell; cada date vira _pure_ ∘ _return_ 💞 ➜ “side effects free”. Manual de instruções disponível em `.lhs` comentado.',
  },
  {
    username: 'saga_svg',
    name: 'Saga SVG',
    description:
      'Desenha epopeias vetoriais onde heróis são `<path>` e inimigos `<clipPath>`. Otimiza _heroes journey_ com `svgo --multipass` ⚔️📐.',
  },
  {
    username: 'hash_hanna',
    name: 'Hanna Hash',
    description:
      'Decora SHA-256 de cabeça e usa como mantra para meditação. Diz que colisões K^-angulosas desbloqueiam o chakra do DevOps. 🔑🧘',
  },
  {
    username: 'fork_felipe',
    name: 'Felipe Fork',
    description:
      'Clona todo repositório que vê pela frente e chama isso de “adotar pets GPL”. Mantém conversa diária com `git reflog` para terapia. 🐙🌱',
  },
  {
    username: 'beta_bruna',
    name: 'Bruna BetaTester',
    description:
      'Encontra bug até em calculadora 4 operações. Reporta no Jira com screenplay digno de Oscar, trilha sonora em MIDI e citação Vancouver. 🐞🎬',
  },
  {
    username: 'lua_lucas',
    name: 'Lucas ☾ LunarCoder',
    description:
      'Compila shader à luz do luar para poupar energia elétrica. Observa marés antes de rodar benchmarks, pois “latência tem fase”. 🌊🌗',
  },
  {
    username: 'echo_ellen',
    name: 'Ellen Echo',
    description:
      'Prefere `printf` a terapia; passa sentimento com `\n` e resolve DR em regex. Escreve cartas de amor em Markdown porque cabe CI/CD 💌🛠️.',
  },
  {
    username: 'sudo_susie',
    name: 'Susie Sudo',
    description:
      'Ganha qualquer discussão com `sudo !!`. Publica papers sobre privilégio de root na sociologia contemporânea. 🔒📑',
  },
  {
    username: 'optic_oscar',
    name: 'Oscar Optical',
    description:
      'Implementa OCR que lê entrelinhas de e-mails. Quando encontra ironia, devolve HTTP 418 — “I’m a teapot”. ☕📜',
  },
  {
    username: 'wing_wendy',
    name: 'Wendy Wing',
    description:
      'Pilota simuladores de voo para testar latência de APIs REST “em altitude”. Escreve _white-papers_ com checklist pré-decolagem. 🛫📶',
  },
  {
    username: 'parse_pedro',
    name: 'Pedro Parser',
    description:
      'Interpreta conversas de WhatsApp em BNF antes de responder. Se a gramática falha, lança exceção de emoji inválido. 🔤📲',
  },
  {
    username: 'delta_daria',
    name: 'Daria Δ',
    description:
      'Faz controle de versão emocional: `Δ(tedious) → π(jokes)`. Conjugação diferencial aplicada ao humor durante deadlines. ∂😂/∂t',
  },
  {
    username: 'servo_sam',
    name: 'Sam Servo',
    description:
      'Automatiza tarefas domésticas com Raspberry Pi até para alimentar o gato via webhook. Documenta tudo em README com gifs do Garfield. 🐱⚙️',
  },
  {
    username: 'zen_zip',
    name: 'Zip Zen',
    description:
      'Compacta preocupações diárias em `.tar.gz` mental. Descompacta só se o professor pedir “trabalho em grupo” — e ainda usa checksum SHA-1 pra garantir integridade. 🗜️🧘‍♂️',
  },
  {
    username: 'logic_lara',
    name: 'Lara Logic',
    description:
      'Transforma fofoca em silogismo proposicional, depois prova por indução transfinita. Tézera café 0-1 distribuído por lambda-calculus. ☕∴',
  },
  {
    username: 'vector_vic',
    name: 'Victor Vector',
    description:
      'Organiza playlist pela álgebra linear dos BPMs. Quando falta ritmo, aplica rotação em R² pra alinhar a batida. 🎧🧮',
  },
  {
    username: 'crypt_clara',
    name: 'Clara Crypto',
    description:
      'Assina bilhetes de amor com chaves PGP e exige prova de trabalho pra aceitar convite de festa. Se não há consenso, faz fork do relacionamento. 🔐💔',
  },
];

export interface EnterpriseProfile {
  username: string;
  name: string;
  socialReason: string;
  fantasyName: string;
  description: string;
}

/* 30 perfis corporativos — dobro da lista original, com nomes mais inventivos
   e descrições “white-paper nível Gartner” ainda mais longas. */
const userEnterpriseProfiles: EnterpriseProfile[] = [
  {
    username: 'cloudsyntax_sa',
    name: 'CloudSyntax S/A',
    socialReason: 'CloudSyntax Orquestração em Nuvem S.A.',
    fantasyName: 'CloudSyntax',
    description:
      'Transforma diagramas em Terraform em tempo real: cada “apply” vem com trilha sonora Lo-Fi gravada por IA e análise SWOT embutida no output do `terraform plan`.',
  },
  {
    username: 'quantumledger_inc',
    name: 'QuantumLedger Inc.',
    socialReason: 'QuantumLedger Sistemas Quânticos Ltda.',
    fantasyName: 'Q-Ledger',
    description:
      'Registra transações em qubits supersônicos e manda relatório “compliance ready” antes de o auditor piscar. KPI de entropia garantido ≤ 0,01.',
  },
  {
    username: 'edgeforge_labs',
    name: 'EdgeForge Labs',
    socialReason: 'EdgeForge Computação de Borda EIRELI',
    fantasyName: 'EdgeForge',
    description:
      'Implanta micro-datacenters em caixas de pizza recicladas: latência crocante de 3 ms e sabor de DevOps sustentável.',
  },
  {
    username: 'pixeldynamics_gmbh',
    name: 'PixelDynamics GmbH',
    socialReason: 'PixelDynamics Visual Analytics GmbH',
    fantasyName: 'PixDyn',
    description:
      'Cada dashboard nasce em 8K HDR e converte métricas em arte generativa NFT; vende insight estético por centavos e cacifa valuation de bilhões.',
  },
  {
    username: 'nanofact_global',
    name: 'NanoFact Global',
    socialReason: 'NanoFact Manufatura Digital Global Ltd.',
    fantasyName: 'NanoFact',
    description:
      'Imprime OKR em escala nanométrica direto no silício dos chips: performance medida em flops e metas semânticas ISO-14234.',
  },
  {
    username: 'delta_data_holding',
    name: 'Delta Data Holding',
    socialReason: 'Delta Data Analytics Holding S.A.',
    fantasyName: 'Δ-Data',
    description:
      'Deteta correlações subatômicas em data lakes; gera “insight as-a-Service” com SLA de eureka a cada 42 minutos ☕.',
  },
  {
    username: 'serverlesssorcery_co',
    name: 'Serverless Sorcery Co.',
    socialReason: 'Serverless Sorcery Computação Efêmera Ltda.',
    fantasyName: 'SrvlessMagic',
    description:
      'Abre portais Kubernetes para funções Lambda que duram o tempo exato de um expresso ristretto — magia negra auditável em JSON.',
  },
  {
    username: 'hyperloop_holdings',
    name: 'Hyperloop Holdings',
    socialReason: 'Hyperloop Digital Transport Corp.',
    fantasyName: 'HyperLoopX',
    description:
      'Entrega pacotes NPM a 1 200 km/h dentro de túneis de CI/CD a vácuo; latência de push < 1 ms e emojis que não descarrilam.',
  },
  {
    username: 'neonova_tech',
    name: 'NeoNova Tech',
    socialReason: 'NeoNova Tecnologias Restritas Ltda.',
    fantasyName: 'NeoNova',
    description:
      'Ilumina datacenters com LEDs RGB que piscam conforme uso de CPU; chama essa sinfonia de “Observabilidade Visual 2.0”.',
  },
  {
    username: 'microbyte_mfg',
    name: 'MicroByte Manufacturing',
    socialReason: 'MicroByte Fábrica de Software sob Medida S/A',
    fantasyName: 'MicroByte',
    description:
      'Produz microserviços em linha de montagem Kanban: cada estágio solda métricas DORA direto no container de saída.',
  },
  {
    username: 'circuit_citadel_llc',
    name: 'Circuit Citadel LLC',
    socialReason: 'Circuit Citadel Cyberdefense LLC',
    fantasyName: 'CitadelX',
    description:
      'Bastilha digital onde firewalls recitam poema épico antes de bloquear pacotes; zero-trust com floreios retóricos Shakespeareanos.',
  },
  {
    username: 'kpi_kingdom',
    name: 'KPI Kingdom',
    socialReason: 'KPI Kingdom Insights Inteligentes ME',
    fantasyName: 'KPIKing',
    description:
      'Coroa cada métrica com gráfico anelar de ouro-rosa 24 k; relatórios luxuosos entregues em caixas de unboxing via drone.',
  },
  {
    username: 'api_atlas_corp',
    name: 'API Atlas Corp.',
    socialReason: 'API Atlas Integrações Globais Corp.',
    fantasyName: 'API-Atlas',
    description:
      'Mapeia endpoints como constelações; navegação REST guiada por astrolábio Swagger e push de cometa GraphQL a cada solstício.',
  },
  {
    username: 'docker_dreamworks',
    name: 'Docker DreamWorks',
    socialReason: 'Docker DreamWorks Produções Contêiner Ltda.',
    fantasyName: 'DockDream',
    description:
      'Rende animações Pixar no entrypoint do Dockerfile; cada frame vira volume mapeado para backup incremental em fita LTO-Infinity.',
  },
  {
    username: 'elastic_eureka',
    name: 'Elastic Eureka',
    socialReason: 'Elastic Eureka Buscas Relevantes S.A.',
    fantasyName: 'Elastic-Eu',
    description:
      'Quando o usuário digita “bug”, devolve white-paper explicando por que é feature; search relevância 110 %.',
  },
  {
    username: 'grafana_galaxy',
    name: 'Grafana Galaxy',
    socialReason: 'Grafana Galaxy Observability Ltda.',
    fantasyName: 'GraGalaxy',
    description:
      'Cluster de dashboards que orbitam como satélites; dispara alerta Slack antes mesmo de Prometheus suspeitar de alta entropia.',
  },
  {
    username: 'lambda_labs_sa',
    name: 'Lambda Labs S/A',
    socialReason: 'Lambda Laboratories S.A.',
    fantasyName: 'Λ-Labs',
    description:
      'Compila serverless em verso livre; cada função assíncrona rima com throughput. Poetas DevOps dão push às terças-feiras.',
  },
  {
    username: 'node_nomads_inc',
    name: 'Node Nomads Inc.',
    socialReason: 'Node Nomads Desenvolvimento Ágil Inc.',
    fantasyName: 'NomadJS',
    description:
      'Equipes rodam em caravanas React-Native alimentadas por bateria solar; commit assíncrono em zonas sem Wi-Fi via sinal de fumaça JSON.',
  },
  {
    username: 'observability_oracle',
    name: 'Observability Oracle',
    socialReason: 'Observability Oracle Insights Ltda.',
    fantasyName: 'O-Oracle',
    description:
      'Prevê incidentes com tarô de logs; métricas místicas aparecem em bola de cristal Grafana já agrupadas por label.',
  },
  {
    username: 'prometheus_portfolio',
    name: 'Prometheus Portfolio',
    socialReason: 'Prometheus Portfolio Gestão de Alertas S.A.',
    fantasyName: 'PromPort',
    description:
      'Alerta queda de CPU antes de Zeus lançar o raio; integra PagerDuty com Pégaso para SLA mitológica.',
  },
  {
    username: 'queue_quasar',
    name: 'Queue Quasar',
    socialReason: 'Queue Quasar Mensageria Interestelar Ltda.',
    fantasyName: 'Q-Quasar',
    description:
      'Fila mensagens a 13 bilhões de anos-luz e ainda mantém ordem FIFO; latência medida em parsecs inversos.',
  },
  {
    username: 'refactor_ranch',
    name: 'Refactor Ranch',
    socialReason: 'Refactor Ranch Code Refactory Ltd.',
    fantasyName: 'RFCowboy',
    description:
      'Laça dívidas técnicas como boiadeiro ágil; “git rebase” é a cela e “lint” o berrante. Sprint termina com churrasco de merge-conflict.',
  },
  {
    username: 'schema_summit_sa',
    name: 'Schema Summit S/A',
    socialReason: 'Schema Summit Arquitetura de Dados S.A.',
    fantasyName: 'S-Summit',
    description:
      'Escala montanhas de ER diagram para fixar snowflakes; conclui expedição com white-paper que garante altitude de governança.',
  },
  {
    username: 'terraform_temple',
    name: 'Terraform Temple',
    socialReason: 'Terraform Temple IaC Services Ltda.',
    fantasyName: 'TT-Temple',
    description:
      'Devotos do `plan`, padroeiros do `apply`: cânticos em HCL e deploys às sextas-feiras 23 h — porque milagre só acontece com fé.',
  },
  {
    username: 'uptime_universe',
    name: 'Uptime Universe',
    socialReason: 'Uptime Universe Monitoramento Global Ltda.',
    fantasyName: 'UptimeU',
    description:
      'Monitora até batimento cardíaco da impressora térmica; SLAs tão altos que já medem disponibilidade em dígitos de π.',
  },
  {
    username: 'vector_vault_llc',
    name: 'Vector Vault LLC',
    socialReason: 'Vector Vault AI Engines LLC',
    fantasyName: 'V-Vault',
    description:
      'Indexa embeddings mais rápido que mente humana pensa em café; oferece prova matemática de hype controlado.',
  },
  {
    username: 'web3_wanderlust',
    name: 'Web3 Wanderlust',
    socialReason: 'Web3 Wanderlust Ventures Ltd.',
    fantasyName: 'WWL',
    description:
      'Entrega contratos inteligentes em mochilas NFT; a cada carimbo de passaporte, faz fork na blockchain para lembrar das férias.',
  },
  {
    username: 'yaml_yard_co',
    name: 'YAML Yard Co.',
    socialReason: 'YAML Yard Arquivos Estruturados ME',
    fantasyName: 'Y-Yard',
    description:
      'Cultiva aspas dobradas em fazenda sem tab extrema; exporta indentação orgânica para grafos Neo4j.',
  },
  {
    username: 'zeppelin_zero',
    name: 'Zeppelin Zero',
    socialReason: 'Zeppelin Zero Cloud Mobility Corp.',
    fantasyName: 'Z-Zero',
    description:
      'Faz deploy em dirigíveis-data-center; latência flutuante porém carbono neutro. Backup em nuvem? Literalmente ☁️.',
  },
  {
    username: 'zerotrust_zion',
    name: 'ZeroTrust Zion',
    socialReason: 'ZeroTrust Zion Segurança Ltda.',
    fantasyName: 'ZT-Zion',
    description:
      'Catedral onde pacotes confessam antes de entrar; sem absolvição não há handshake TLS. Aplica penitência via MFA.',
  },
];

const technologyInterests = [
  'Inteligência Artificial',
  'Machine Learning',
  'Deep Learning',
  'Redes Neurais',
  'Python',
  'JavaScript',
  'Java',
  'C++',
  'C#',
  'Rust',
  'Go',
  'Kotlin',
  'Android',
  'iOS',
  'React',
  'Angular',
  'Vue',
];

const fakeSocialMediaProfiles = {
  github: 'https://github.com/certainlyWrong',
  linkedin: 'https://www.linkedin.com/in/certainlyWrong',
  discord: 'https://discord.gg/certainlyWrong',
};

const api = 'http://localhost:3000/api/v2';

const accessTokens: string[] = [];

const registerUsersWithStudents = async () => {
  for (const profile of userStudentProfiles) {
    const response = await fetch(`${api}/auth/student/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: profile.username,
        password: 'StrongP@ssword1!',
        email: `${profile.username}@gmail.com`,
      }),
    });

    if (response.ok) {
      console.log(`User ${profile.username} registered successfully!`);
      const data = (await response.json()) as {
        access_token: string;
      };
      accessTokens.push(data.access_token);

      await fetch(`${api}/students`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.access_token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          birthDate: '2025-05-19T20:32:37.597Z',
          lattes: 'https://lattes.cnpq.br/1234567890123456',
          email: `${profile.username}@gmail.com`,
          registrationNumber: `${Math.floor(Math.random() * 1000000)}`,
          description: profile.description,
          course: 'Sistemas de Informação',
        }),
      });
    }
  }
};

const registerUsersWithEnterprise = async () => {
  for (const profile of userEnterpriseProfiles) {
    const response = await fetch(`${api}/auth/enterprise/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: profile.username,
        password: 'StrongP@ssword1!',
        email: `${profile.username}@gmail.com`,
      }),
    });

    if (response.ok) {
      console.log(`User ${profile.username} registered successfully!`);
      const data = (await response.json()) as {
        access_token: string;
      };
      accessTokens.push(data.access_token);

      await fetch(`${api}/enterprises`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.access_token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          email: `${profile.username}@gmail.com`,
          description: profile.description,
          cnpj: '10.136.535/0001-48',
          socialReason: profile.socialReason,
          fantasyName: profile.fantasyName,
        }),
      });
    }
  }
};

const runMocks = async () => {
  await registerUsersWithStudents();
  await registerUsersWithEnterprise();

  for (const token of accessTokens) {
    technologyInterests.sort(() => Math.random() - 0.5);
    const randomInterests = technologyInterests.slice(0, 3);

    for (const interest of randomInterests) {
      await fetch(`${api}/tag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: interest,
        }),
      });
    }

    for (const [platform, url] of Object.entries(fakeSocialMediaProfiles)) {
      await fetch(`${api}/socialmedia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: platform,
          url,
        }),
      });
    }

    await fetch(`${api}/address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        zipCode: '12345-678',
        street: 'Rua Senador Humberto Costa',
        neighborhood: 'Cidade de Deus',
        city: 'Picos',
        state: 'Piauí',
      }),
    });
  }

  console.log('Mocks completed successfully!');
};

runMocks()
  .then(() => {
    console.log('All users and tags registered successfully!');
  })
  .catch((error) => {
    console.error('Error registering users or tags:', error);
  });
