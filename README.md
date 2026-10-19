# Cosmic Cargo — protótipo 0.25

Abra `index.html` em um navegador moderno. Não há instalação, servidor ou dependências. A carreira é salva automaticamente no armazenamento local do navegador.

Fluxo jogável: aceite encomendas interplanetárias ou intergalácticas, respeitando combustível comprado, autonomia, massa e espaço; encaixe, gire ou mova cargas rígidas; confirme a prontidão e aguarde a contagem regressiva; controle a entrada e o pouso; receba avaliações e pagamentos; abasteça, repare e evolua entre cinco categorias de nave.

O menu inicial oferece Treino, Nova Carreira e Continuar Carreira. No cabeçalho, ao lado do nome do jogo, há atalhos para retornar ao menu principal e reiniciar completamente a carreira; ações que abandonam uma tentativa ou apagam o progresso exigem confirmação. O treino permite escolher qualquer destino e repetir pousos sem alterar dinheiro, nave ou progresso. A pilotagem usa Q e A no lado esquerdo e O e K no direito; Q/O acionam os motores superiores de inclinação e A/K acionam os motores inferiores principais. Em telas touch, os quatro controles ocupam os cantos da área de voo.

A navegação permanente apresenta apenas Contratos, Carga e Garagem. A tela de voo não possui aba própria e é aberta automaticamente ao iniciar uma missão ou treinamento.

Cada localidade possui de três a cinco ofertas por rodada. O primeiro contrato define o destino e o quadro passa a mostrar apenas encomendas para esse mundo. Novas escolhas são verificadas previamente contra os seis slots, a capacidade de massa e a autonomia; ofertas incompatíveis ficam bloqueadas com o motivo visível. Danos permanecem após a missão, reduzem o valor de troca e tornam o pouso seguinte mais difícil.

Durante a entrada e o pouso, qualquer combinação de motores consome uma taxa total básica de 2 unidades por segundo na nave inicial. A melhoria Eficiência de combustível reduz essa taxa em 12,5% por nível, chegando a 50% no quarto nível. A tecnologia-base das naves superiores também reduz o consumo. O custo de cruzeiro calculado pela distância e pela carga permanece separado.

A avaliação após o pouso considera somente o dano sofrido na missão atual, e não a integridade acumulada da nave. Cargas frágeis perdem uma estrela a cada 5% de dano, cargas padrão a cada 8% e cargas pesadas a cada 11%. Danos abaixo da primeira faixa mantêm cinco estrelas.

Um pouso fora dos limites ideais não força mais uma estrela nem o pagamento mínimo. As estrelas continuam obedecendo ao dano real e ao tipo da carga. O pagamento combina a classificação com a integridade preservada: uma falha técnica com pouco dano recebe uma redução moderada, enquanto uma destruição continua próxima da recompensa mínima.

O pagamento agora segue diretamente a avaliação: cinco estrelas pagam 100% do frete, quatro pagam 85%, três pagam 70%, duas pagam 55% e uma paga 40%. Não existe penalidade adicional por falhar em um critério técnico se a nave sobreviver. Somente a destruição total reduz o valor restante em mais 80%. Os arquivos usam identificação de versão para impedir que o navegador reutilize regras antigas em cache.

Documentos incluídos: `GDD.md`, com as decisões de design, conteúdo, progressão e roadmap; `ARQUITETURA.md`, com o modelo técnico, estado, física, dados e critérios de teste.
