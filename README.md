# Trabalho Prático 2 - Zeppelin

## Descrição

Este projeto implementa uma cena 3D simples em WebGL com TWGL.js. A cena possui uma pequena cidade com casas, ruas, árvores, postes, torres, bancos/caixas e cercas. O objeto principal é um zeppelin controlável que sobrevoa a cidade, com corpo principal, cabine com vidros semitransparentes e hélice traseira girando continuamente.

O objetivo foi cumprir os requisitos obrigatórios do TP2 e implementar apenas os extras necessários para chegar a 100% da nota.

## Como executar

O projeto deve ser executado por um servidor local, pois o navegador precisa carregar os arquivos JavaScript e as texturas.

Uma forma simples de executar é:

```bash
python3 -m http.server 8000
```

Depois, abra no navegador:

```text
http://localhost:8000
```

Observação: o arquivo `index.html` carrega a TWGL.js via CDN oficial. Portanto, é necessário estar conectado à internet para carregar a biblioteca.

## Controles

- `W` - mover o zeppelin para frente
- `S` - mover o zeppelin para trás
- `A` - virar para a esquerda
- `D` - virar para a direita
- `1` - câmera superior acompanhando o zeppelin
- `2` - câmera lateral externa acompanhando o zeppelin
- `C` - alternar a câmera lateral entre frente, trás, direita e esquerda
- `L` - ligar/desligar iluminação Phong
- `N` - ligar/desligar neblina
- `P` - pousar/decolar no zeppeliporto

## Funcionalidades obrigatórias implementadas

- Plano representando o chão.
- Pequena cidade/cenário sobre o plano.
- Pelo menos 3 tipos de objetos no cenário:
  - casas;
  - árvores;
  - ruas.
- Objetos distribuídos de maneira harmônica pelo cenário.
- Materiais e texturas configurados para a maioria dos objetos.
- Zeppelin modelado hierarquicamente.
- Zeppelin com corpo principal, cabine e hélice girando continuamente.
- Controle do zeppelin pelo teclado no plano XZ.
- Projeção perspectiva.
- Duas câmeras principais:
  - câmera superior;
  - câmera lateral externa.
- Alternância dos lados da câmera lateral com a tecla `C`.
- Iluminação dinâmica com modelo de Phong.
- Fonte de luz direcional.
- Materiais diferentes para objetos diferentes.
- Tecla `L` para ativar/desativar a iluminação.
- Renderização com `requestAnimationFrame`.

## Extras implementados

Foram implementados apenas os extras pedidos para completar 100%:

- Skybox - 10%
- Mais tipos de objetos - 8%
  - postes;
  - torres;
  - bancos/caixas;
  - cercas/muros.
- Neblina - 4%
- Cabine com vidro - 4%
- Zeppelin pousar - 4%

## Organização do código

```text
/index.html
/src/main.js
/src/shaders.js
/src/camera.js
/src/input.js
/src/objects.js
/src/zeppelin.js
/src/world.js
/src/utils.js
/assets/textures/
README.md
```

- `index.html`: página principal, canvas e carregamento dos scripts.
- `src/main.js`: inicialização do WebGL, criação da cena, loop principal, atualização e renderização.
- `src/shaders.js`: vertex shader e fragment shader com Phong, textura, fog e transparência simples.
- `src/camera.js`: controle das câmeras superior e lateral.
- `src/input.js`: leitura das teclas pressionadas.
- `src/objects.js`: criação das geometrias, materiais, texturas e função de desenho.
- `src/zeppelin.js`: modelagem hierárquica, animação da hélice, movimento e pouso/decolagem do zeppelin.
- `src/world.js`: criação do chão, cidade, zeppeliporto, skybox e objetos do cenário.
- `src/utils.js`: funções auxiliares para matrizes, vetores e movimento.
- `assets/textures/`: texturas simples usadas nos materiais.

## Observações

O projeto usa WebGL com TWGL.js e não usa THREE.js.

Não foram implementados outros extras além dos listados acima. O projeto não possui sombras, normal mapping, partículas, pós-processamento, música, IA de caminhos, modelos `.obj`, height map, ciclo dia/noite nem câmera em primeira pessoa.
