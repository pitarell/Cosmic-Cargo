# Cosmic Cargo — Game Design Document 0.43

## Visão

Cosmic Cargo é um jogo de habilidade e gestão sobre uma transportadora interplanetária. A carreira é permanente, não roguelite. O jogador aceita encomendas, organiza cargas, administra combustível, pilota entradas atmosféricas e pousos, paga custos e amplia uma frota. A edição Steam oferece a experiência completa; a Android limita a progressão à categoria 3.

## Ciclo principal

O jogador escolhe contratos, fixa o destino com a primeira escolha, combina de três a cinco ofertas compatíveis, acomoda peças rígidas no compartimento, verifica massa e autonomia, pilota o pouso e recebe avaliações individuais. Depois da missão decide sobre imposto, manutenção, abastecimento, melhorias e novas naves. A cada três pousos existe uma entrega humanitária obrigatória, gratuita e coerente com a história da colônia.

## Contratos, histórias e destinos

Lua, Marte, Europa, Vênus e Titã usam distâncias representativas da Terra, consumo, risco, ambiente e fretes progressivos. Andrômeda, Triângulo e Escultor formam o comércio intergaláctico das categorias 4 e 5. A história detalhada aparece na página de cada localidade e justifica suas mercadorias e necessidades humanitárias. Ofertas variam a cada quadro e são bloqueadas quando excedem categoria, massa, slots ou combustível.

## Cargas

Cada encomenda possui massa, resistência, cor, nível, pagamento e formato fixo. As peças podem ser arrastadas e giradas, mas nunca separadas. Naves iniciais possuem seis slots; categorias 4 e 5 possuem oito e dez. A categoria 4 introduz formas de quatro slots e a categoria 5 formas de cinco slots. Centro lateral deslocado aumenta torque; carga alta eleva o centro de gravidade e reduz estabilidade. Proa, cauda e asas são indicadas no compartimento.

## Pilotagem

Q e O acionam propulsores superiores de inclinação; A e K acionam motores inferiores de sustentação. Áreas touch ocupam os cantos da tela. Cada tentativa começa congelada, aceita qualquer controle e apresenta contagem regressiva de três segundos. A física considera empuxo, torque, inércia, gravidade, atmosfera, arrasto, vento, calor, massa, centro de massa, danos e combustível. Posição e inclinação iniciais variam. O pad ampliado possui guias visuais. O Computador de Pouso auxilia 12,5% por nível, até 50%.

## Avaliação e danos

O dano básico de um bom pouso é baixo e a resistência natural torna o início acessível. A avaliação usa o dano da missão e a resistência da carga: frágeis perdem estrelas mais rápido, cargas comuns têm tolerância média e pesadas maior tolerância. Cinco, quatro, três, duas e uma estrela pagam respectivamente 100%, 85%, 70%, 55% e 40%. Danos persistem, dificultam pousos seguintes e reduzem o valor de troca. O reparo é opcional com 20% ou mais de integridade e obrigatório abaixo disso.

## Economia

O combustível custa 1 crédito por unidade, não é restaurado automaticamente e deve cobrir cruzeiro e pouso. Consumo e frete seguem a escala de distância, risco e massa. O imposto sobre entregas é 27% do bruto. O jogador pode sonegar; somente essa decisão executa o sorteio de fiscalização, cuja chance cresce 15 pontos percentuais por ocorrência. A descoberta cobra o acumulado em dobro e zera dívida e risco. Compras de nave pagam 50% de imposto, sempre discriminado.

O crédito empresarial existe desde a categoria 1. Empréstimos recebem juros únicos de 5% e amortizam 10% do frete bruto após o imposto e antes dos demais custos. A aba Financeira registra ganhos, despesas e resultados. O saldo considera impostos, empréstimos, combustível, consertos, comissões, benefícios e gerente.

## Progressão e frota

A confiança inicia em 15, varia de 0 a 100 e libera ofertas melhores a cada 25 pontos. As cinco naves são Courier Mk I, Atlas Hauler, Kestrel S2, Aurora Voyager e Zenith Diplomat. Seus preços, capacidade, tanque, resistência, tecnologia e visuais crescem claramente. Courier é velha e enferrujada; Atlas é branca e utilitária; Kestrel é esportiva; Aurora é avançada e iridescente; Zenith é diplomática e sofisticada. A ilustração detalhada aparece no Hangar e na Concessionária; o voo usa a mesma identidade simplificada.

O Hangar exibe apenas naves compradas e permite alternância. Oficina reúne melhorias e conserto; Abastecimento compra combustível; Concessionária vende naves. A entrega da nave ativa é opcional. Se entregue, ela sai da frota e somente volta por nova compra. Melhorias são específicas de cada unidade. O quarto nível de uma nave custa ligeiramente mais que o primeiro nível equivalente da categoria seguinte, enquanto o potencial básico da categoria superior permanece acima do máximo anterior.

## Operações automáticas

A compra da nave categoria 4 libera até cinco funcionários. Cada piloto possui história, nível, habilidade, contratação, comissão, consumo e riscos próprios. Ele aceita um contrato por vez, limitado ao seu nível, e opera apenas naves das categorias 1 a 3. As escalas permitem vários pilotos em ordem por nave, sem uso simultâneo. Jornadas duram até oito horas e exigem 16 horas de descanso. Turno noturno recebe 30% de adicional; horas acima de oito elevam em 50% a comissão proporcional.

Humor perde 3% por dia trabalhado, recupera 10% em folga e em cada dia de fim de semana sem trabalho, e volta a 100% após férias de 30 dias. Períodos são cumulativos. Abaixo de 20%, o piloto renegocia ou pede demissão. Demissão pelo jogador gera multa proporcional à contratação e treinamentos. Na categoria 5, um gerente pode administrar escalas e folgas e recebe 20% do lucro líquido operacional.

## Interface, idioma e salvamento

O menu inicial oferece português e inglês, Treino, Nova Carreira e Continuar Carreira. A interface inclui Contratos, Carga, Hangar, Oficina, Abastecimento, Concessionária, Crédito, Financeira e, na Steam, Operações Automáticas. O voo é aberto apenas pelo fluxo de missão. O cabeçalho mostra somente a versão, sem rótulo de protótipo ou plataforma. O progresso usa armazenamento local e cada edição mantém seus próprios limites.

## Critérios de aceitação

O jogo deve permitir múltiplas encomendas do mesmo destino, bloquear combinações inválidas, arrastar e girar peças, refletir o centro de massa no controle, consumir combustível, iniciar com contagem regressiva, avaliar cargas com coerência, calcular imposto e sonegação, persistir frota e finanças, alternar idioma e executar offline. A edição Android não pode expor conteúdo acima da categoria 3 nem operações automáticas.

## Pontos futuros

Continuam abertos o balanceamento por telemetria, áudio, tutorial completo, acessibilidade ampliada, salvamento em nuvem, conquistas, integração real com Steam, assinatura comercial Android, políticas de loja e migração do código monolítico para módulos.
