# Cosmic Cargo — Game Design Document

## 1. Visão do jogo

Cosmic Cargo é um jogo de habilidade e administração leve sobre uma transportadora interplanetária. O jogador seleciona contratos, combina encomendas destinadas ao mesmo planeta, organiza fisicamente a carga na nave, pilota uma descida com dois motores laterais independentes e reinveste o lucro em uma carreira permanente. O foco é transformar decisões logísticas simples em consequências perceptíveis durante a pilotagem.

Plataforma inicial: navegador, com HTML5 Canvas, CSS e JavaScript. Uma versão Android é possível após validação do núcleo, por empacotamento como PWA ou aplicativo híbrido. O jogo é uma carreira permanente, não um roguelite: créditos, reputação, naves e melhorias compradas permanecem salvos.

## 2. Decisões firmes

O jogador administra uma transportadora interplanetária. Cada missão liga o quadro de contratos, a preparação de carga, o voo, o pouso, a avaliação individual das encomendas e a progressão na garagem. É permitido aceitar diversos contratos de clientes diferentes para o mesmo planeta e entregá-los na mesma viagem. Cada encomenda mantém pagamento, condição e avaliação próprios.

A nave usa dois motores laterais independentes. No teclado, A aciona o motor esquerdo e D aciona o direito; em telas sensíveis ao toque, há um botão para cada motor. A física considera empuxo, torque, inércia e gravidade. O compartimento exige organização antes do voo. Cada carga tem massa, volume e posição; a distribuição determina o centro de massa e altera a tendência de rotação e a dificuldade de controle.

Existem cargas frágeis e pesadas. Cargas frágeis perdem avaliação com impactos; cargas pesadas ocupam capacidade relevante e agravam a resposta da nave. Os destinos previstos são Lua, Marte, Europa, Vênus e Titã, cada um com gravidade, atmosfera, terreno, riscos e identidade visual próprios.

A economia usa créditos, custos operacionais, pagamentos de contrato e uma loja fixa. Melhorias permanentes incluem potência, precisão e eficiência dos motores, compartimento, estabilização, tanque e trem de pouso. A garagem permite comprar e selecionar naves. O sistema inclui salvamento, missões, pouso e integridade da nave.

## 3. Ciclo principal

No terminal, o jogador compara destino, cliente, tipo de carga, massa, volume, risco e pagamento. O primeiro contrato aceito define o destino da viagem; outros contratos só podem ser adicionados se apontarem para esse mesmo destino. Na preparação, as encomendas são colocadas em seis slots. O jogo calcula massa total, limite da nave e centro de massa. Com o manifesto completo e dentro da capacidade, a missão pode começar.

Durante a descida, cada motor aplica força em um lado da nave. O uso conjunto desacelera a queda; o uso assimétrico produz torque. O centro de massa deslocado acrescenta uma tendência de rotação sob empuxo. O pouso considera velocidade, inclinação, posição na plataforma e nível do trem de pouso. Depois da aterrissagem, cada contrato recebe estrelas e pagamento próprios. Créditos compram melhorias e naves; reputação registra a qualidade acumulada do serviço.

## 4. Regras e sistemas

Contratos são ofertas independentes, com identificador, cliente, destino, carga, massa, volume, categoria, prazo ou risco e recompensa-base. A viagem aceita múltiplos contratos, mas apenas um destino. Cancelamentos antes do lançamento não têm penalidade no protótipo; a penalidade é ponto em aberto para o jogo final.

O compartimento inicial possui seis slots. Uma carga de volume maior que um ocupa vários slots e sua massa é distribuída entre eles. O centro de massa é a média ponderada das posições ocupadas. A capacidade de massa depende da nave e do reforço de compartimento. A versão final deve permitir arrastar, girar ou fixar cargas; o protótipo oferece colocação automática e retirada por clique.

A integridade resulta da velocidade e do ângulo no contato. O trem de pouso aumenta as tolerâncias. Falha não encerra a carreira: reduz pagamentos, preserva o progresso e permite outra missão. Custos de reparo e combustível estão previstos, mas não são cobrados no protótipo para evitar travar a primeira experiência.

## 5. Destinos e ambientes

Lua é o ambiente inicial: gravidade baixa, ausência de atmosfera, terreno irregular e plataforma visível. Marte combina gravidade moderada, atmosfera tênue, poeira e rajadas. Europa tem gravidade baixa, gelo escorregadio, fissuras e possíveis gêiseres. Vênus apresenta gravidade alta, atmosfera densa, calor e corrosão. Titã usa gravidade baixa, atmosfera espessa, baixa visibilidade e ventos. A campanha pode liberar esses mundos por reputação, licenças e compra de naves adequadas.

## 6. Progressão e economia

A progressão é persistente. Créditos vêm das entregas e podem ser gastos em atualizações do quadro, custos futuros, melhorias e naves. Reputação cresce com boas avaliações e poderá liberar clientes, destinos e contratos de maior valor. A loja apresenta níveis previsíveis e permanentes, sem escolhas aleatórias de corrida.

No protótipo, os preços e recompensas são provisórios. A nave Courier Mk I é inicial; Atlas Hauler e Kestrel S2 são compráveis. Cada melhoria possui quatro níveis com preço crescente. Os valores devem ser ajustados por telemetria: tempo até a primeira compra, lucro médio por missão, taxa de falha e utilidade percebida de cada melhoria.

## 7. Interface e acessibilidade

A interface divide-se em Contratos, Carga, Voo e Garagem. Informações críticas aparecem como texto e cor; tipos de carga têm rótulos, não apenas códigos cromáticos. O voo possui indicadores de altitude, velocidade, ângulo e combustível. Os controles de toque ficam separados nas laterais e o teclado utiliza A, D e R. Próximas versões devem incluir remapeamento, opção de alto contraste, redução de movimento, escala de interface e assistência de estabilização.

## 8. Conteúdo inicial

A primeira versão funcional contém quadro de contratos, filtro de destinos, contratos simultâneos para o mesmo planeta, seis slots, cálculo de massa e centro de massa, voo lunar, dois motores, pouso, integridade, avaliações e pagamentos individuais, créditos, três naves, sete linhas de melhoria, garagem e salvamento local.

## 9. Sugestões futuras

São sugestões, e não decisões fechadas: prazos e janelas orbitais; combustível e reparos como custos; seguro de carga; contratos encadeados; rotas com múltiplas paradas; eventos meteorológicos; inspeções; cargas vivas, perigosas, refrigeradas ou ilegais; tripulação; empréstimos; customização visual; conquistas; desafios diários; ranking; modo cooperativo assíncrono; editor de naves; campanha narrativa com corporações e colônias.

## 10. Pontos em aberto

Ainda precisam de decisão: orientação definitiva da fase, decolagem e pouso ou apenas descida; duração ideal da missão; modelo de dano e reparo; penalidade por cancelar contratos; existência de prazos reais; ordem de desbloqueio dos planetas; número final de slots e formatos de carga; compra ou aluguel de naves; limite de combustível; presença de tripulação; monetização; suporte offline e sincronização em nuvem; abordagem técnica para Android.

## 11. Roadmap

Marco 1, protótipo funcional: ciclo Lua completo, seis slots, contratos simultâneos, garagem e salvamento. Marco 2, vertical slice: áudio, tutorial, arrastar cargas, custos, efeitos, balanceamento, Marte e contratos gerados. Marco 3, alfa: Europa, Vênus e Titã, desbloqueios, novos tipos de carga, reparos, acessibilidade e PWA. Marco 4, beta: conteúdo, telemetria, otimização móvel, testes de dispositivos, polimento e avaliação do empacotamento Android. Marco 5, lançamento: campanha estável, economia balanceada, backup de salvamento e distribuição.

## 12. Critérios de sucesso da primeira versão

O jogador deve compreender o objetivo sem documentação externa, aceitar duas ou mais encomendas para a Lua, posicioná-las nos slots, perceber a alteração do centro de massa, controlar motores separadamente, concluir ou falhar um pouso, receber resultados independentes, comprar uma melhoria e recuperar seu progresso após recarregar a página. Nenhuma falha deve apagar compras permanentes ou impedir uma nova missão.

## 13. Revisão de dificuldade do protótipo 0.2

O combustível agora divide-se entre custo de viagem e reserva de pouso. Distância, risco e massa contratada aumentam o consumo previsto; uma combinação pode ser recusada quando excede o tanque da nave. O tanque possui quatro níveis permanentes, e naves diferentes têm capacidades próprias. O quadro usa geração determinística por rodada, com clientes e mercadorias derivados da história de cada localidade.

As cargas podem trocar de posição por clique ou arraste. O voo começa com velocidade lateral, inclinação, vento e plataforma variável. Mundos atmosféricos exigem atravessar um corredor de entrada com alinhamento adequado e controle de calor; depois disso, o jogador precisa eliminar movimento lateral, rotação e velocidade vertical. Manter os dois motores acionados apenas freia a queda e não corrige trajetória ou inclinação, tornando as decisões de controle determinantes.

## 14. Ajuste de legibilidade e dificuldade 0.3

O compartimento passou a reproduzir a nave verticalmente, com proa no topo, cauda e motores na base e três pares de slots esquerdo/direito. O centro de massa lateral corresponde diretamente ao torque visto no voo. A entrada inicia com menos velocidade e inclinação, o corredor e a plataforma são maiores, o vento e o consumo foram reduzidos e o pouso tolera velocidade e ângulo moderados. Todo contrato deve preservar pelo menos 150 unidades de combustível para manobras, evitando missões tecnicamente possíveis, mas impraticáveis.

## 15. Economia de distância, troca e reparo 0.4

O planejamento usa distâncias representativas da Terra: Lua 384.400 km, Vênus 150 milhões km, Marte 225 milhões km, Europa 628 milhões km e Titã 1,25 bilhão km. Como as órbitas alteram as distâncias reais, esses números são referências estáveis de balanceamento. Combustível e pagamento crescem em escala comprimida para manter diferenças claras sem tornar os valores impraticáveis.

Courier Mk I custa 4.000 CR, Atlas Hauler 18.000 CR e Kestrel S2 42.000 CR. Ao trocar de nave, a atual é entregue por 45% de seu preço-base e apenas a diferença é paga ou recebida. Depois de cada missão, o reparo é calculado pelo percentual de dano e pelo custo máximo da nave: 800, 1.800 ou 3.200 CR. O resultado mostra frete bruto, reparo e ganho líquido.

Referências astronômicas: NASA Moon Facts, Venus Facts, Mars Facts, Europa Facts e Titan Facts. Os valores do jogo são referências médias ou representativas, pois a distância entre a Terra e os demais corpos varia continuamente conforme as órbitas.

## 16. Desgaste e centro de gravidade 0.5

A integridade permanece entre missões. Reparos são opcionais a partir de 20%, mas a nave danificada começa a missão com menor margem de segurança, maior desvio e tolerância reduzida no pouso. Abaixo de 20%, o reparo é obrigatório; caso faltem créditos, o fundo de emergência cobre a diferença para evitar bloqueio permanente. O valor de troca corresponde a 45% do preço-base multiplicado pela integridade atual.

Cada destino oferece entre três e cinco contratos por rodada. Os seis slots formam três pares verticais: a fileira central é a mais estável, a inferior abaixa o centro de gravidade e a superior eleva-o. Carga alta acrescenta inclinação e velocidade angular iniciais, com penalidade maior que a de carga baixa. A plataforma visual e a tolerância horizontal foram ampliadas para 280 unidades.

## 17. Menu, treino e quatro motores 0.6

O menu inicial oferece Treino, Nova Carreira e Continuar Carreira. Nova Carreira apaga o progresso anterior, cria a carreira inicial e apresenta “Bem vindo ao Sindicato de Transporte Galático!”. Continuar Carreira recupera o salvamento existente. Treino permite escolher qualquer destino e repetir pousos sem alterar créditos, integridade, contratos, reputação ou inventário.

A nave possui motores superiores esquerdo e direito, controlados por Q e O, dedicados à correção angular, e motores inferiores esquerdo e direito, controlados por A e K, responsáveis por sustentação e torque. Em telas touch, há uma área em cada canto. Um pouso correto causa somente 1% de desgaste básico. Itens sem saldo suficiente usam botão vermelho. Se a integridade ficar abaixo de 20% e o saldo não cobrir o reparo obrigatório, a carreira termina e o jogador deve reiniciar.

## 18. Resistência estrutural e boas-vindas 0.7

A resistência natural da nave foi ampliada. O dano por impacto passa a ser calculado somente acima de 38 m/s, com coeficiente 0,35; a penalidade angular caiu para 30 pontos por radiano e o pouso fora da plataforma desconta 12 pontos. A tolerância de sucesso aumentou para 60 m/s e 0,26 radiano, mantendo 1% de desgaste mínimo. A mensagem de nova carreira ocupa o centro da tela em um painel de grande formato durante aproximadamente três segundos.

## 19. Seleção restrita de contratos 0.8

O primeiro contrato aceito determina o destino da viagem e remove do quadro todas as ofertas de outros mundos. O quadro permanece travado nesse destino enquanto existir ao menos um contrato aceito; ao recusar o último, todos os destinos voltam a aparecer. Cada oferta adicional é validada antes da aceitação contra capacidade de massa, seis slots disponíveis e autonomia com reserva mínima. O botão bloqueado informa “Limite de massa”, “Sem slots disponíveis” ou “Tanque insuficiente”.

## 20. Computador de Pouso e largada 0.9

O Computador de Pouso é a melhoria permanente mais cara. Possui quatro níveis e assume 12,5% das correções por nível, limitado a 50%. Durante a descida, auxilia na correção de inclinação, velocidade lateral e velocidade vertical, sem retirar do jogador a responsabilidade pelos motores, pelo alinhamento e pelo toque final.

Ao entrar na tela de voo, a simulação permanece congelada em estado de prontidão. O primeiro comando Q, A, O ou K, inclusive pelos controles de toque, inicia uma contagem regressiva visível de três segundos. A física e o consumo de combustível começam somente após o término da contagem.

## 21. Atalho para acondicionamento 0.10

O quadro de contratos possui um botão grande e destacado para avançar diretamente à aba Carga. Sem contratos, o botão permanece bloqueado. Após a primeira aceitação, ele informa a quantidade de encomendas e o destino selecionado; qualquer alteração no manifesto atualiza o texto imediatamente.

## 22. Variedade e obrigação humanitária 0.11–0.12

Cada destino passa a possuir doze tipos temáticos de carga comercial. Em cada ciclo de três missões, a terceira recebe automaticamente uma carga de emergência destinada à sobrevivência da colônia, independentemente do destino escolhido. Ela ocupa um slot, acrescenta massa e consumo, não pode ser recusada e não gera pagamento nem reputação. A capacidade da nave é verificada considerando essa obrigação antes da aceitação do primeiro contrato.

## 23. Conserto após o pouso 0.12

O relatório de ganhos apresenta o custo do conserto e um botão para restaurar imediatamente a integridade da nave. O pagamento da missão é creditado antes dessa decisão. Se houver saldo, o valor é descontado e a integridade retorna a 100%; sem saldo, o botão fica vermelho e bloqueado. Reparos continuam opcionais acima de 20% e obrigatórios abaixo desse limite.

## 24. Progressão de naves e troca definitiva 0.13

A compra de uma nave funciona como troca definitiva. A nave anterior fornece desconto proporcional à integridade, é marcada como entregue e permanece bloqueada. A janela de confirmação informa o nome da nave comprada, preço integral, desconto da usada e custo líquido; o botão final conduz diretamente à escolha de novas cargas. Contratos em preparação são cancelados e todas as melhorias voltam ao nível zero.

As categorias seguem uma progressão estrita. A tecnologia-base multiplica potência, precisão e eficiência em 1× na Courier Mk I, 2,2× na Atlas Hauler e 4,8× na Kestrel S2. Tanque e capacidade também foram separados por margens superiores ao ganho máximo de quatro melhorias: 820 u e 140 kg; 1.750 u e 280 kg; 2.750 u e 450 kg. Assim, o conjunto máximo da categoria anterior permanece inferior ao nível básico da seguinte.

## 25. Condições iniciais variáveis 0.13

Cada nova tentativa de pouso sorteia posição horizontal, altitude, velocidade lateral, velocidade vertical, inclinação, rotação, plataforma e corredor de entrada. Reiniciar uma tentativa também gera um novo cenário, impedindo a memorização de uma única sequência de comandos.

## 26. Cargas rígidas e rotação 0.14

O compartimento mantém duas colunas e varia entre três e cinco alturas: seis espaços nas três primeiras naves, oito na Aurora Voyager e dez na Zenith Diplomat. Cada encomenda é uma peça indivisível: volume um usa um bloco, volume dois usa uma peça reta e volume três usa uma peça em L. A carga pode ser girada em incrementos de 90 graus e reposicionada por clique ou arraste, mas seus blocos nunca podem ser separados, trocados individualmente ou reorganizados em outro formato.

Uma movimentação inválida não altera a posição anterior. A interface destaca todos os blocos da peça selecionada, informa quando o formato não cabe e exige que todas as encomendas estejam completamente encaixadas antes de liberar o voo. A massa continua distribuída entre os blocos ocupados para calcular os centros lateral e vertical.

## 27. Combustível persistente 0.15

O tanque deixa de ser restaurado automaticamente entre missões. O jogador compra a quantidade desejada na garagem, por unidade ou completando o tanque, e o estoque restante permanece salvo. O cruzeiro desconta o custo calculado pela distância e massa antes da descida; os motores consomem o restante durante o pouso. Contratos são bloqueados quando o estoque atual não cobre a viagem e a reserva mínima de 150 unidades. O combustível custa 1 crédito por unidade em todas as categorias.

## 28. Comércio intergaláctico 0.15

O segundo nível comercial acrescenta Andrômeda, Triângulo e Escultor. As rotas usam distâncias reais aproximadas em anos-luz, histórias e mercadorias próprias, consumo entre 5.200 e 9.000 unidades e fretes-base entre 30.000 e 72.000 créditos. Andrômeda e Triângulo exigem nave de categoria 4; Escultor exige categoria 5.

A Aurora Voyager custa 125.000 créditos, possui tanque básico de 9.800 unidades, 720 kg e oito espaços. A Zenith Diplomat custa 360.000 créditos, possui tanque básico de 16.800 unidades, 1.100 kg e dez espaços. Melhorias custam proporcionalmente mais nas categorias superiores e continuam sendo zeradas em cada troca de nave.

## 29. Identidade visual das naves 0.15

Cada categoria possui pintura e silhueta próprias na garagem e no voo. A Courier Mk I é velha, oxidada e remendada; a Atlas Hauler é branca, simples e utilitária; a Kestrel S2 usa fuselagem estreita e cores esportivas; a Aurora Voyager recebe asas largas e acabamento iridescente; a Zenith Diplomat apresenta estrutura maior, simétrica e detalhes luminosos de alto nível.

## 30. Atalho de abastecimento 0.16

O relatório apresentado após o pouso inclui o botão “Abastecer nave”, acompanhado pelo combustível atual e pela capacidade do tanque. O botão encerra o relatório, avança a rodada e abre diretamente a seção de abastecimento da garagem. O retorno normal ao terminal e o conserto imediato permanecem como ações separadas.

## 31. Confiança e níveis de encomenda 0.17

A reputação passa a se chamar Confiança e utiliza uma escala limitada entre 0 e 100. Uma nova carreira começa com 25 pontos. A faixa atual aparece no cabeçalho e no quadro de contratos, juntamente com o próximo limite de progressão.

As encomendas possuem cinco níveis. Regular está disponível desde 0; Prioritária é liberada em 25; Especialista em 50; Confidencial em 75; Diplomática em 100. O quadro mistura os níveis já liberados, sem apresentar ofertas acima da confiança atual. Cada nível acrescenta 35% ao pagamento-base: 1×, 1,35×, 1,70×, 2,05× e 2,40×. Boas avaliações aumentam a confiança, avaliações ruins podem reduzi-la e o valor nunca ultrapassa os limites da escala.

## 32. Balanceamento inicial e resistência das cargas 0.18

A nave sem melhorias inicia o pouso mais próxima da região central, com menores velocidades horizontal e vertical e menos inclinação e rotação aleatórias. Enquanto nenhuma melhoria estiver instalada, a estrutura oferece 10% de estabilização angular natural; esse auxílio não corrige posição ou velocidade e permanece inferior ao Computador de Pouso.

A tolerância básica de pouso passa para 66 unidades de velocidade e 0,30 radiano de inclinação. O dano de impacto começa acima de 44 unidades, com coeficiente reduzido de 0,35 para 0,28; o efeito da inclinação cai de 30 para 24 e a penalidade por sair da plataforma cai de 12 para 10. A penalidade de avaliação das cargas frágeis foi reduzida de 12 para 6 pontos de integridade, aumentando sua resistência sem eliminar o risco.

## 33. Controles globais de carreira 0.19

O cabeçalho possui dois atalhos ao lado do nome Cosmic Cargo. “Menu principal” abandona a tentativa de pouso ativa somente após confirmação e retorna à tela de Treino, Nova Carreira e Continuar Carreira sem apagar o progresso. “Reiniciar carreira” solicita confirmação explícita, apaga a progressão atual e inicia uma nova carreira com os valores padrão. O comando equivalente da garagem usa a mesma confirmação.

## 34. Consumo dos motores durante o pouso 0.20

O acionamento dos motores durante a entrada e o pouso consome uma taxa total, independentemente da quantidade de propulsores ativados simultaneamente. Na nave inicial sem melhorias, essa taxa é de 2 unidades por segundo, equivalente a 1 unidade a cada 0,5 segundo. A melhoria Eficiência de combustível reduz o consumo em 12,5% por nível: 1,75 u/s, 1,50 u/s, 1,25 u/s e 1,00 u/s. O multiplicador tecnológico das naves superiores continua reduzindo a taxa, preservando a vantagem das categorias avançadas. O combustível de cruzeiro continua calculado separadamente pela distância e massa da viagem.

## 35. Plataforma de pouso ampliada 0.21

A plataforma possui 560 unidades de largura e tolerância horizontal de 280 unidades para cada lado do centro, o dobro da área válida anterior. A representação visual e a verificação física utilizam a mesma dimensão.

## 36. Avaliação gradual das cargas 0.22

A classificação individual utiliza o dano sofrido pela nave durante a missão atual, evitando que danos antigos prejudiquem novamente a avaliação. Cargas frágeis perdem uma estrela a cada 5 pontos percentuais de dano; cargas padrão, a cada 8 pontos; cargas pesadas, a cada 11 pontos. O primeiro intervalo mantém cinco estrelas e a classificação mínima permanece em uma estrela. O relatório exibe o dano da missão e a categoria de cada carga.

## 37. Separação entre qualidade da carga e pouso técnico 0.23

Falhar em um critério técnico do pouso não força mais a avaliação para uma estrela. A classificação depende sempre do dano da missão e da resistência da encomenda. O pagamento-base continua sendo calculado pelas estrelas e, quando o pouso fica fora do padrão, recebe um multiplicador igual à integridade preservada na missão, limitado ao mínimo de 15%. Assim, 9% de dano gera quatro estrelas para cargas frágeis e padrão, cinco para cargas pesadas e preserva 91% do pagamento correspondente às estrelas; uma destruição permanece próxima da recompensa mínima.

## 38. Navegação sem aba de voo 0.24

A barra de navegação exibe somente Contratos, Carga e Garagem. O voo permanece como uma tela interna do fluxo, acessível apenas ao iniciar uma missão ou um treinamento, evitando a abertura manual de uma área sem pouso preparado.

## 39. Correção do início do pouso e recompensa 0.25

A abertura interna da tela de voo não depende mais da existência de uma aba correspondente. Ao iniciar missão ou treinamento, a tela exibe “Pronto para o pouso”, aguarda qualquer controle e executa a contagem regressiva de três segundos.

O pagamento passa a seguir uma tabela direta: cinco estrelas equivalem a 100% do frete; quatro, 85%; três, 70%; duas, 55%; uma, 40%. Um critério técnico reprovado não acrescenta outra penalidade se a nave sobreviver. A destruição total aplica um multiplicador adicional de 20% ao valor calculado. Arquivos estáticos recebem identificação de versão para evitar regras antigas armazenadas pelo navegador.

## 40. Curva de preços e cancelamento na carga 0.26

Os três primeiros níveis de cada melhoria custam, respectivamente, 1×, 1,4× e 1,85× o preço-base ajustado à categoria da nave. O quarto nível é calculado em 108% do primeiro nível da mesma melhoria na nave da categoria seguinte. Na categoria máxima, utiliza-se 2,7× o preço-base da própria nave. A regra torna a evolução gradual e faz o último investimento de uma categoria ficar ligeiramente acima do início da categoria seguinte.

Cada contrato comum listado no manifesto da aba Carga possui o botão “Cancelar contrato”. O cancelamento remove a encomenda aceita, apaga sua peça do compartimento e atualiza massa, espaço e combustível sem exigir retorno ao quadro de contratos. Cargas humanitárias obrigatórias não podem ser canceladas.
