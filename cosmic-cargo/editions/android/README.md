# Cosmic Cargo — versão 0.43

Cosmic Cargo é um exercício de vibe coding desenvolvido por ciclos de criação, teste e balanceamento com apoio de inteligência artificial. O projeto continua experimental, mas esta distribuição reúne o jogo-base atualizado, a edição completa para Steam, a edição Android limitada à categoria 3, o executável para Windows, o APK de teste e a documentação consolidada.

## Como executar

No Windows, abra `Cosmic Cargo.exe` ou o atalho `Cosmic Cargo.lnk`. No navegador, abra `app/index.html`. A edição Steam está em `editions/steam`; a edição Android está em `editions/android`; o instalador de teste está em `dist/Cosmic-Cargo-Android-0.43.apk`. O jogo funciona offline e salva a carreira localmente no navegador ou na WebView do aplicativo.

## Jogo

O jogador administra uma transportadora espacial permanente. O ciclo reúne escolha de contratos, acondicionamento de peças rígidas, abastecimento, entrada atmosférica, pouso manual, avaliação individual, impostos, manutenção e expansão da frota. O primeiro contrato define o destino e os seguintes devem usar a mesma rota. Limites de massa, combustível e slots são aplicados antes da aceitação. A cada três pousos surge uma missão humanitária obrigatória e sem frete.

As cargas podem ser arrastadas, giradas e encaixadas sem separação. A posição lateral e a altura alteram o centro de massa e a pilotagem. Os controles são Q, A, O e K, com equivalentes touch. O voo considera gravidade, atmosfera, vento, calor, inércia, torque, combustível, integridade e assistência do Computador de Pouso. O modo Treino não altera a carreira.

## Economia e progressão

A confiança inicia em 15 e libera categorias melhores nos marcos 25, 50, 75 e 100. O combustível custa 1 crédito por unidade e permanece no tanque. Reparos são opcionais acima de 20% de integridade e obrigatórios abaixo desse limite. A compra de nave cobra imposto de 50%; a entrega da nave usada é opcional e seu desconto depende da integridade. Melhorias pertencem a cada nave e possuem quatro níveis.

Entregas pagam imposto de 27% sobre o valor bruto. Antes da cobrança, o jogador pode pagar ou sonegar. A dívida sonegada fica registrada e cada nova sonegação aumenta em 15 pontos percentuais a chance de fiscalização. Quando descoberta, toda a dívida é cobrada em dobro. O crédito empresarial está disponível desde o início, recebe juros únicos de 5% e desconta 10% do frete bruto após o imposto. A aba Financeira registra receitas, impostos, empréstimos, combustível, consertos, comissões, benefícios, gerência e resultado líquido.

## Edições

A edição Steam contém cinco naves, rotas interplanetárias e intergalácticas, cargas de até cinco slots, funcionários, escalas, viagens automáticas, humor, folgas, férias, gerência e crédito. A edição Android termina na categoria 3 e não possui rotas intergalácticas nem contratação de funcionários. As duas edições oferecem português e inglês no menu inicial.

## Estrutura

`app` contém a base jogável; `docs` contém o GDD e o esquema técnico; `editions` contém os pacotes Steam e Android; `launcher-src` contém o iniciador do Windows; `android-src` contém o projeto Android; e `dist` contém os arquivos prontos para distribuição. O ícone oficial está em `app/assets/icons` e é usado pela interface, pelo executável, pelo atalho e pelo aplicativo Android.

## Observações de distribuição

O executável apenas abre a edição local no navegador padrão. O APK é uma compilação de teste offline assinada com chave de desenvolvimento. Uma publicação comercial exige assinatura definitiva, configuração da página da Steam ou Google Play, revisão de políticas, testes em aparelhos e criação dos materiais de loja.
