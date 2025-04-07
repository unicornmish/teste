import { PrismaClient } from '@prisma/client';
// Importa o Faker para gerar dados falsos realistas
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient(); 
const logger = console; // Usa o console para logar informações

// Função principal do seed
async function main() {
  logger.log('Iniciando seed...');

  // Remove os dados que já existirem no banco (se houver)
  await clearExistingData();

  // Cria novos dados 
  await seedItems();

  logger.log('Seed concluído com sucesso!');
}

// Função que limpa os dados existentes na tabela "item"
async function clearExistingData() {
  logger.log('Limpando dados existentes...');
  await prisma.item.deleteMany(); // Deleta todos os registros da tabela "item"
  logger.log('Dados limpos.');
}

// Função que cria novos itens no banco de dados
async function seedItems() {
  const BATCH_SIZE = 50; // Quantos itens serão criados por lote
  const TOTAL_ITEMS = 250; // Total de itens que serão criados

  // Array onde os itens serão temporariamente armazenados
  const items: Array<{
    name: string;
    isActive: boolean;
    createdAt?: Date;
  }> = [];

  logger.log(`Criando ${TOTAL_ITEMS} itens...`);

  for (let i = 0; i < TOTAL_ITEMS; i++) {
    // Gera um nome falso de produto e um status ativo/inativo
    items.push({
      name: `Item ${i + 1} - ${faker.commerce.productName()}`,
      isActive: faker.datatype.boolean(),
    });

    if (items.length === BATCH_SIZE || i === TOTAL_ITEMS - 1) {
      await prisma.item.createMany({ data: items }); // Insere o lote no banco
      items.length = 0; // Limpa o array para o próximo lote
      logger.log(`Lote inserido: ${i + 1}/${TOTAL_ITEMS}`); // Log de progresso
    }
  }
}

// Executa o seed
main()
  .catch((e) => {
    logger.error('Erro durante o seed:', e); // Mostra erro se algo der errado
    process.exit(1); // Encerra com código de erro
  })
  .finally(async () => {
    await prisma.$disconnect(); // Desconecta do banco, mesmo com erro
  });
