# Cosmic Cargo — Esquema técnico 0.43

## Plataforma e distribuição

A aplicação usa HTML5, CSS, JavaScript puro e Canvas, sem servidor nem dependências em execução. `index.html` contém a estrutura das telas, `game.js` reúne catálogo, regras, estado, física, desenho e persistência, `i18n.js` traduz a interface e os arquivos CSS definem o layout responsivo. A metatag `cosmic-cargo-edition` seleciona `steam` ou `android`.

A edição Windows é aberta por um iniciador C# que localiza `app/index.html` e usa o navegador padrão. A edição Android utiliza uma Activity com WebView em tela cheia e carrega o mesmo conteúdo como recurso offline. A Steam é distribuída como pacote estático completo. Todos usam o mesmo ícone oficial.

## Estado persistente

O `localStorage` registra idioma, créditos, confiança, missões, quadro, contratos, manifesto, frota, nave ativa, combustível, integridade, melhorias, empréstimo, dívida fiscal, risco de fiscalização, livro-caixa e dados AFK. Cada nave possui registro próprio. Migrações normalizam carreiras antigas e a edição Android filtra conteúdo acima da categoria 3.

## Dados e regras

Destinos armazenam distância, gravidade, atmosfera, vento, risco, consumo, nível exigido, história e cargas. Naves armazenam categoria, preço, tanque, passo de tanque, estabilidade, massa, reparo, slots, escala de melhorias e pintura. Contratos armazenam destino, cliente, peça, massa, tipo, nível e pagamento. O manifesto preserva rotação, posição, slots ocupados e centro de massa.

O fluxo valida destino único, espaço, massa, categoria, combustível e carga humanitária. A economia aplica imposto de entrega, eventual sonegação, amortização, reparo, combustível e progressão. A compra de nave separa preço, imposto e troca opcional. O livro-caixa aceita operações manuais e automáticas.

## Física

O simulador mantém posição, velocidades linear e angular, ângulo, combustível, calor, fase e controles. Os quatro motores aplicam forças e torques independentes. Gravidade, atmosfera, vento, centro de massa, dano e melhorias modificam a resposta. A entrada e o pouso usam atualização por `requestAnimationFrame`, limite de delta e colisão com o pad. A avaliação é calculada pelo dano da missão e pela resistência de cada carga.

## Operações automáticas

O módulo AFK usa horários absolutos para viagens, turnos, finais de semana, descanso, folga e férias. O processamento ocorre ao abrir o jogo e durante a sessão. Funcionários possuem nível, habilidades, humor, comissão, nave, turno e disponibilidade. A fila de cada nave impede sobreposição. Resultados aplicam imposto, empréstimo, comissão, benefícios, abastecimento, conserto e gerência antes de alterar o saldo.

## Interface

As telas administrativas são HTML; o voo é Canvas. Entrada de teclado e eventos pointer compartilham ações, permitindo toque e arraste de carga. A tradução percorre conteúdo estático e elementos criados em tempo de execução. O ícone é PNG na interface e Android e ICO no Windows. O cabeçalho informa apenas `Versão 0.43` ou `Version 0.43`.

## Testes mínimos

Devem ser verificados carregamento sem erros, sintaxe dos scripts, troca de idioma, salvamento, destino único, limites de contrato, arraste e rotação, centro de massa, consumo, contagem regressiva, controles, pad, avaliação, imposto, sonegação, empréstimo, reparo, abastecimento, compra e troca de nave, livro-caixa e reinício. Na Steam devem ser testados cinco níveis e AFK; no Android, bloqueio após o nível 3, ausência de AFK, funcionamento offline, orientação paisagem, toque, suspensão e retomada.

## Evolução recomendada

Uma versão de produção deve separar catálogos, economia, manifesto, física, interface, persistência e integrações em módulos; adicionar validação de esquema e migrações versionadas; adotar passo fixo de física; criar testes automatizados; incluir telemetria opt-in; e substituir chaves de desenvolvimento por assinaturas comerciais próprias.
