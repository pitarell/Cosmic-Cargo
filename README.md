# Cosmic Cargo — protótipo 0.25

## Sobre o projeto

Cosmic Cargo é um exercício de vibe coding: um protótipo experimental criado por meio de ciclos rápidos de ideias, implementação, testes e ajustes realizados em colaboração com inteligência artificial. O objetivo é explorar criação de jogos, balanceamento e evolução de mecânicas de forma prática, sem a pretensão de representar um produto final ou uma arquitetura definitiva de produção.

O jogo funciona diretamente no navegador com HTML5 Canvas, CSS e JavaScript, sem instalação, servidor ou dependências externas. Para jogar, basta abrir `index.html` em um navegador moderno. O progresso da carreira é armazenado localmente pelo navegador.

## Proposta atual

O jogador administra uma transportadora espacial permanente, aceita contratos, organiza cargas e pilota manualmente a entrada e o pouso em diferentes destinos. A carreira não é roguelite: créditos, confiança, combustível, integridade, naves e progressão permanecem entre as missões. O menu inicial oferece Treino, Nova Carreira e Continuar Carreira. O treino permite praticar pousos sem ganhar ou gastar recursos.

Os destinos atuais são Lua, Marte, Europa, Vênus, Titã, Andrômeda, Triângulo e Escultor. Cada localidade possui história, ambiente, risco, distância, consumo e encomendas próprios. O quadro gera de três a cinco contratos por destino, e o primeiro contrato aceito limita as escolhas seguintes à mesma rota. A cada terceira missão, uma carga humanitária obrigatória e sem pagamento é acrescentada ao destino escolhido.

## Contratos e acondicionamento

É possível transportar várias encomendas para o mesmo destino em uma única viagem. Cada contrato possui cliente, carga, massa, volume, formato, resistência, nível de confiança e pagamento individual. Ofertas incompatíveis são bloqueadas quando excedem massa, espaço, categoria da nave ou combustível disponível.

As cargas utilizam peças rígidas inspiradas em Tetris. Elas podem ser giradas e reposicionadas, mas não separadas. A distribuição de massa altera o centro de massa lateral e vertical: cargas altas ou afastadas do centro dificultam o controle da nave. Os compartimentos possuem seis, oito ou dez espaços, conforme a categoria da nave.

## Pilotagem e combustível

O pouso utiliza quatro controles. Q e O acionam os motores superiores de inclinação; A e K acionam os motores inferiores principais. Em telas touch, os mesmos comandos aparecem nos cantos da área de voo. Antes de cada tentativa, o jogo mostra a mensagem de prontidão; qualquer controle inicia uma contagem regressiva de três segundos.

A física considera empuxo independente, torque, inércia, gravidade, atmosfera, vento, aquecimento, massa, centro de massa, combustível e desgaste da nave. A plataforma de pouso possui 560 unidades de largura. Durante a entrada e o pouso, qualquer combinação de motores consome uma taxa total básica de duas unidades por segundo na nave inicial. A melhoria de eficiência reduz essa taxa em 12,5% por nível, até o limite de 50%. O combustível gasto no cruzeiro é calculado separadamente pela distância real aproximada e pela carga transportada.

## Avaliação e economia

A avaliação de cada encomenda utiliza apenas o dano sofrido na missão atual. Cargas frágeis perdem uma estrela a cada 5% de dano, cargas padrão a cada 8% e cargas pesadas a cada 11%. Cinco estrelas pagam 100% do frete; quatro, 85%; três, 70%; duas, 55%; uma, 40%. Falhar em um critério técnico não força automaticamente uma estrela se a nave sobreviver. A destruição total aplica uma redução adicional de 80% ao valor restante.

O combustível custa um crédito por unidade e permanece no tanque entre as missões. Reparos são opcionais enquanto a integridade estiver em 20% ou mais; abaixo desse limite, tornam-se obrigatórios. Danos aumentam a dificuldade do pouso e reduzem o valor de troca da nave. Se a nave estiver abaixo de 20% e o jogador não possuir créditos para o reparo, a carreira termina.

## Progressão

A confiança varia de 0 a 100 e, na configuração atual do protótipo, uma nova carreira começa em 51. As categorias de encomendas são liberadas nos marcos 0, 25, 50, 75 e 100, oferecendo contratos progressivamente mais valiosos. A garagem possui melhorias permanentes de potência, precisão, eficiência, compartimento, estabilização, tanque, trem de pouso e Computador de Pouso. O computador é a melhoria mais cara e auxilia progressivamente até controlar 50% das correções.

Existem cinco categorias de nave com diferenças de preço, capacidade, autonomia, tecnologia e aparência. A nave anterior entra como desconto na troca, proporcional à sua integridade, e fica bloqueada após a compra. Todas as melhorias são zeradas ao trocar de nave, enquanto a categoria seguinte possui desempenho básico superior ao potencial máximo da anterior.

## Estado do protótipo

A navegação principal apresenta Contratos, Carga e Garagem. A tela de voo é aberta somente ao iniciar missão ou treinamento. O cabeçalho possui atalhos para o menu principal e para reiniciar a carreira, ambos protegidos por confirmação quando podem causar perda de progresso ou da tentativa atual.

Por ser um exercício de vibe coding, o projeto permanece sujeito a alterações frequentes de regras, balanceamento, interface e estrutura interna. O foco atual é validar se o ciclo de aceitar contratos, acondicionar cargas, administrar recursos, pousar e evoluir a transportadora é divertido e compreensível.

O arquivo `GDD.md` registra as decisões de design, conteúdo, progressão e roadmap. O arquivo `ARQUITETURA.md` descreve estado, dados, física, interface e critérios técnicos do protótipo.
