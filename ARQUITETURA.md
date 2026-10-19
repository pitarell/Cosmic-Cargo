# Cosmic Cargo — Esquema técnico

## 1. Escopo tecnológico

O protótipo usa HTML semântico, CSS responsivo e JavaScript puro. O Canvas renderiza o voo em 960 × 600 unidades internas; a interface administrativa usa elementos HTML. Não há servidor, compilação ou dependências. O estado persistente usa `localStorage`, suficiente para o protótipo e substituível por IndexedDB ou serviço de nuvem.

Para Android, a alternativa inicial recomendada é transformar o projeto em PWA e depois avaliar Capacitor. A lógica de simulação deve continuar independente da camada de entrada e renderização para facilitar testes e empacotamento.

## 2. Arquitetura

O protótipo é dividido conceitualmente em dados estáticos, estado da carreira, controladores de interface, simulador de voo, renderização e persistência. `index.html` define as telas; `style.css` concentra layout, identidade visual, responsividade e controles de toque; `game.js` contém catálogos, estado, regras, física, desenho e salvamento.

Na evolução do projeto, recomenda-se separar `data/` para destinos, contratos, cargas, naves e melhorias; `core/` para economia, manifesto, missão e salvamento; `physics/` para integração, colisão e pouso; `ui/` para telas; `render/` para Canvas; `platform/` para entrada, áudio, PWA e integração Android. Os módulos de regras não devem acessar diretamente o DOM.

## 3. Estado principal

O estado de carreira contém créditos, reputação, naves possuídas, nave ativa, níveis de melhoria, contratos aceitos, ocupação dos seis slots, missões concluídas e semente do quadro. O estado de voo é temporário e contém posição, velocidade linear, ângulo, velocidade angular, combustível, integridade, acionamento dos motores, tempo, destino e situação da missão.

O salvamento ocorre após cada alteração econômica, de manifesto ou garagem. A versão final deverá incluir `schemaVersion`, migrações, validação do conteúdo carregado, cópia de segurança e opção de exportar/importar a carreira.

## 4. Modelo de dados

Destino: `id`, nome, gravidade, densidade atmosférica, risco, terreno, vento, temperatura, requisitos e identidade visual. Contrato: `id`, cliente, destino, descrição de carga, massa, volume, tipo, recompensa-base, prazo e modificadores. Nave: `id`, nome, preço, slots, limite de massa, tanque, potência-base, estabilidade, resistência e compatibilidades. Melhoria: `id`, categoria, nível máximo, custo por nível e modificadores. Resultado: contrato, condição da carga, estrelas, pagamento, reputação e motivos de dedução.

## 5. Física

A simulação atual usa integração semi-implícita simplificada por quadro. A gravidade soma aceleração vertical. Cada motor fornece empuxo na direção local da nave; a média dos motores produz força linear e a diferença produz torque. O centro de massa calculado no compartimento adiciona torque proporcional ao empuxo. Arrasto angular e melhorias de estabilidade amortecem a rotação. O combustível diminui conforme o acionamento total, modificado pela eficiência.

No modelo final, cada motor deve aplicar força em um ponto relativo ao centro de massa. A aceleração linear segue `a = ΣF / massa + gravidade + arrasto`; a aceleração angular segue `α = Σ(r × F) / momentoDeInércia`. A atmosfera afeta arrasto e vento. A colisão precisa usar pernas de pouso e normal do terreno. O passo de física deve ser fixo, preferencialmente 1/120 s, com interpolação visual.

## 6. Fluxos

Aceitar contrato valida se o destino coincide com o manifesto existente. Remover contrato limpa os slots relacionados. Carregar valida volume livre e massa. Lançar exige todos os contratos carregados e massa dentro do limite. Pousar calcula sucesso por posição, velocidade, inclinação e melhoria de trem. Encerrar avalia cada contrato, aplica pagamento e reputação, limpa a missão e salva a carreira.

## 7. Valores provisórios

A capacidade inicial é 140 kg; o compartimento adiciona 30 kg por nível. O tanque inicial possui 1.000 unidades. Melhorias têm quatro níveis e multiplicador de preço de 1,55. A zona de pouso fica no centro da cena; a tolerância-base é inferior a 70 m/s e 0,22 radiano. Esses números servem apenas à jogabilidade inicial e devem ser separados em configuração de balanceamento.

## 8. Segurança e integridade de dados

Dados do salvamento devem ser tratados como entrada não confiável. Antes de uso, a versão final precisa validar tipos, limites, identificadores e referências. O cliente não deve ser autoridade para placares ou compras reais. Se houver servidor, resultados devem ser verificados ou usados apenas em modos sem competição.

## 9. Desempenho e dispositivos

O loop visual usa `requestAnimationFrame` e limita o delta máximo para reduzir saltos ao retornar à aba. A interface é responsiva até telas estreitas. Antes do suporte Android, devem ser medidos tempo de quadro, latência de toque, consumo de bateria, mudança de orientação, áreas seguras, suspensão e retomada, áudio e comportamento do armazenamento.

## 10. Critérios de teste

Teste funcional: aceitar dois contratos da Lua é permitido; aceitar Marte durante uma viagem lunar é recusado; remover contrato limpa sua carga; uma carga de volume dois ocupa dois slots; o lançamento é bloqueado com contrato descarregado ou excesso de massa; A e D acionam motores diferentes; ambos produzem sustentação; acionamento assimétrico gira a nave; centro de massa deslocado influencia a rotação; pouso rápido ou inclinado falha; pouso controlado paga cada contrato; créditos e avaliações são somados; compras reduzem créditos e persistem; recarregar restaura a carreira; reiniciar carreira exige confirmação.

Teste de compatibilidade: versões atuais de Chrome, Edge, Firefox e Safari; teclado e toque; larguras de 360, 768 e 1280 pixels; alta densidade de pixels; perda de foco durante voo; armazenamento bloqueado ou corrompido. Teste de desempenho: 60 quadros por segundo em aparelho móvel intermediário, sem crescimento de memória em dez missões consecutivas.

Teste de aceitação: um usuário novo deve completar o ciclo principal em até cinco minutos sem orientação externa. O estado nunca pode conter uma encomenda de destino diferente na mesma viagem. Pagamentos individuais devem ser visíveis e a soma deve coincidir com o crédito recebido. Uma compra permanente deve continuar ativa após fechar e reabrir a página.

## 11. Extensões do protótipo 0.2

O quadro deriva contratos de uma semente salva e de conjuntos narrativos por planeta. Atualizar a rodada muda clientes, cargas, massa, volume, classe e pagamento sem quebrar a reprodução do estado salvo. A autonomia é `custoBaseDoDestino + massaTotal × (1,15 + risco × 0,14)`; a capacidade é a reserva-base da nave mais 210 unidades por nível de tanque, até o nível quatro.

A simulação possui os estados `entry`, `approach` e `descent`. A entrada calcula arrasto, vento, calor, alinhamento e desvio do corredor. A descida preserva velocidade residual e exige correção assimétrica dos motores. Os testes adicionais devem verificar bloqueio de contratos sem autonomia, mudança do quadro por semente, persistência dos quatro níveis, troca de slots por clique e arraste, dano por calor, penalidade por errar o corredor e impossibilidade de pousar apenas mantendo ambos os motores acionados.

## 12. Economia do protótipo 0.4

Cada destino armazena `km` como distância representativa. O frete usa o logaritmo da proporção entre essa distância e a distância lunar, somado a massa e risco. O combustível usa uma tabela de rota calibrada a partir da mesma ordem real de grandeza. A troca calcula 45% do preço-base da nave ativa e substitui a propriedade atual. O reparo é `custoMáximoDaNave × (100 − integridade) / 100` e fica disponível na garagem.

## 13. Persistência de dano e centro vertical 0.5

O estado da carreira inclui `condition`, preservado entre missões. O reparo deixou de ser automático; seu custo continua proporcional ao dano, mas só é aplicado por ação do jogador. Abaixo de 20%, o lançamento é bloqueado. O valor de troca é `preçoBase × 0,45 × condição/100`. Ao comprar outra nave, a condição retorna a 100%.

O manifesto calcula centro lateral e centro vertical. As fileiras superior, central e inferior usam alturas 1,35, 0 e −0,65, dando penalidade assimétrica à carga alta. O resultado acrescenta inclinação e rotação iniciais conforme a altura e o desgaste. Os testes devem verificar persistência da condição, reparo opcional a 20% ou mais, bloqueio abaixo de 20%, redução do valor de troca, geração de três a cinco ofertas e largura de 280 unidades da plataforma.

## 14. Modos e controles 0.6

O menu inicial controla três entradas: treino isolado, criação de estado padrão e recuperação do `localStorage`. Voos de treino usam `training: true`, métricas neutras de carga e resultado sem escrita de carreira. Os quatro controles mantêm estados independentes: Q e O aplicam torque pelos propulsores superiores, enquanto A e K comandam empuxo e torque pelos motores inferiores. As mesmas ações são expostas por quatro botões touch.

O pouso aplica desgaste básico de 1%, mesmo dentro dos limites ideais. A loja marca em vermelho qualquer custo acima dos créditos disponíveis. Depois de uma missão, se a integridade for inferior a 20% e o saldo não cobrir o reparo, o estado entra em encerramento de carreira e oferece reinicialização completa.
