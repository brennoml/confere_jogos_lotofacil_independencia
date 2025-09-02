document.addEventListener('DOMContentLoaded', () => {
console.log('DOM carregado, vinculando eventos...');

// Altere o título principal, se existir
const titulo = document.querySelector('h1');
if (titulo) {
  titulo.textContent = 'Lotofácil da Independência';
}

// Navegação com setas entre os campos de entrada
document.addEventListener("keydown", (event) => {
  const fields = document.querySelectorAll("input[type='number']");
  let currentIndex = -1;
  fields.forEach((field, index) => {
    if (document.activeElement === field) {
      currentIndex = index;
    }
  });
  if (currentIndex !== -1) {
    if (event.key === "ArrowLeft" && currentIndex > 0) {
      fields[currentIndex - 1].focus();
    } else if (event.key === "ArrowRight" && currentIndex < fields.length - 1) {
      fields[currentIndex + 1].focus();
    }
  }
});

// Adicionar eventos de input para todos os campos
document.querySelectorAll("input[type='number']").forEach(input => {
  input.addEventListener('input', buscarJogos);
});

// Evento do botão Limpar
const clearButton = document.getElementById('clear-button');
if (clearButton) {
  clearButton.addEventListener('click', () => {
    console.log('Botão Limpar clicado');
    limparCampos();
  });
} else {
  console.warn("Botão com ID 'clear-button' não encontrado no DOM.");
}

// Evento do botão Listar Todos os Jogos
const listAllGamesButton = document.getElementById('list-all-games-button');
if (listAllGamesButton) {
  listAllGamesButton.addEventListener('click', () => {
    console.log('Botão Listar Todos os Jogos clicado');
    listarTodosJogos();
  });
} else {
  console.warn("Botão com ID 'list-all-games-button' não encontrado no DOM.");
}

// Evento do botão Atualizar Valores
const updatePrizesButton = document.getElementById('update-prizes-button');
if (updatePrizesButton) {
  updatePrizesButton.addEventListener('click', () => {
    console.log('Botão Atualizar Valores clicado');
    updatePrizes();
    buscarJogos(); // Recalcula os resultados com os novos valores
  });
}
});

let prizeValues = {
  11: 7,
  12: 14,
  13: 35,
  14: 2000,
  15: 1000000
};

// Tabela de prêmios múltiplos conforme regras da Caixa
const prizeMultipliers = {
  16: {
    15: [{ category: 15, count: 1 }, { category: 14, count: 15 }],
    14: [{ category: 14, count: 2 }, { category: 13, count: 14 }],
    13: [{ category: 13, count: 3 }, { category: 12, count: 13 }],
    12: [{ category: 12, count: 4 }, { category: 11, count: 12 }],
    11: [{ category: 11, count: 5 }]
  },
  17: {
    15: [{ category: 15, count: 1 }, { category: 14, count: 30 }, { category: 13, count: 240 }],
    14: [{ category: 14, count: 3 }, { category: 13, count: 42 }, { category: 12, count: 189 }],
    13: [{ category: 13, count: 6 }, { category: 12, count: 65 }, { category: 11, count: 294 }],
    12: [{ category: 12, count: 10 }, { category: 11, count: 100 }],
    11: [{ category: 11, count: 15 }]
  },
  18: {
    15: [{ category: 15, count: 1 }, { category: 14, count: 45 }, { category: 13, count: 540 }, { category: 12, count: 1890 }],
    14: [{ category: 14, count: 4 }, { category: 13, count: 84 }, { category: 12, count: 504 }, { category: 11, count: 1575 }],
    13: [{ category: 13, count: 10 }, { category: 12, count: 130 }, { category: 11, count: 882 }],
    12: [{ category: 12, count: 20 }, { category: 11, count: 220 }],
    11: [{ category: 11, count: 30 }]
  },
  19: {
    15: [{ category: 15, count: 1 }, { category: 14, count: 60 }, { category: 13, count: 900 }, { category: 12, count: 4536 }, { category: 11, count: 9450 }],
    14: [{ category: 14, count: 5 }, { category: 13, count: 140 }, { category: 12, count: 1008 }, { category: 11, count: 4410 }],
    13: [{ category: 13, count: 15 }, { category: 12, count: 210 }, { category: 11, count: 1890 }],
    12: [{ category: 12, count: 35 }, { category: 11, count: 495 }],
    11: [{ category: 11, count: 56 }]
  },
  20: {
    15: [{ category: 15, count: 1 }, { category: 14, count: 75 }, { category: 13, count: 1350 }, { category: 12, count: 8505 }, { category: 11, count: 25200 }],
    14: [{ category: 14, count: 6 }, { category: 13, count: 210 }, { category: 12, count: 1890 }, { category: 11, count: 9240 }],
    13: [{ category: 13, count: 21 }, { category: 12, count: 330 }, { category: 11, count: 3564 }],
    12: [{ category: 12, count: 56 }, { category: 11, count: 990 }],
    11: [{ category: 11, count: 112 }]
  }
};

function updatePrizes() {
  prizeValues[11] = parseFloat(document.getElementById('prize-11').value) || 0;
  prizeValues[12] = parseFloat(document.getElementById('prize-12').value) || 0;
  prizeValues[13] = parseFloat(document.getElementById('prize-13').value) || 0;
  prizeValues[14] = parseFloat(document.getElementById('prize-14').value) || 0;
  prizeValues[15] = parseFloat(document.getElementById('prize-15').value) || 0;
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buscarJogos() {
  // Obter dezenas do Sorteio (Lotofácil)
  const sorteioInputs = [];
  for (let i = 1; i <= 15; i++) {
    sorteioInputs.push(document.getElementById(`sorteio-number${i}`));
  }

  const numerosDigitados = sorteioInputs
    .map(input => parseInt(input.value))
    .filter(num => !isNaN(num));

  const winningGames = { 11: [], 12: [], 13: [], 14: [], 15: [] };

  if (numerosDigitados.length === 15) {
    window.jogos.forEach(jogo => {
      const betSize = jogo.numeros.length;
      const acertos = numerosDigitados.filter(num => jogo.numeros.includes(num)).length;

      if (acertos >= 11) {
        let prizes = [];
        // Aposta simples de 15 dezenas
        if (betSize === 15) {
          prizes.push({ category: acertos, count: 1 });
        } 
        // Aposta múltipla (16 a 20 dezenas)
        else if (prizeMultipliers[betSize] && prizeMultipliers[betSize][acertos]) {
          prizes = prizeMultipliers[betSize][acertos];
        }

        if (prizes.length > 0) {
          const jogoPremiado = { 
            ...jogo, 
            dezenasSorteio: numerosDigitados,
            prizes: prizes
          };
          // Adiciona o jogo na categoria de maior acerto para exibição
          winningGames[acertos].push(jogoPremiado);
        }
      }
    });
  }

  atualizarResultados(winningGames);
}

function atualizarResultados(winningGames) {
  const divs = {
    '11': document.getElementById('acertos-11'),
    '12': document.getElementById('acertos-12'),
    '13': document.getElementById('acertos-13'),
    '14': document.getElementById('acertos-14'),
    '15': document.getElementById('acertos-15'),
  };
  const totais = {
    '11': document.getElementById('total-11-acertos'),
    '12': document.getElementById('total-12-acertos'),
    '13': document.getElementById('total-13-acertos'),
    '14': document.getElementById('total-14-acertos'),
    '15': document.getElementById('total-15-acertos'),
  };

  let totalPrize = 0;
  const totalHitsCount = { 11: 0, 12: 0, 13: 0, 14: 0, 15: 0 };

  for (const key in divs) {
    if (divs[key]) divs[key].innerHTML = '';
  }

  // Itera sobre cada categoria de acerto (11 a 15)
  for (const category in winningGames) {
    const jogos = winningGames[category];
    const div = divs[category];

    if (div) {
      jogos.forEach(jogo => {
        // Calcula o prêmio total para este jogo específico
        let prizeForThisGame = 0;
        jogo.prizes.forEach(p => {
          prizeForThisGame += p.count * prizeValues[p.category];
          totalHitsCount[p.category] += p.count;
        });
        totalPrize += prizeForThisGame;

        const linha = document.createElement('div');
        linha.innerHTML = formatarJogo(jogo, jogo.dezenasSorteio);
        div.appendChild(linha);
      });
    }
  }
  
  // Atualiza os totais de cada categoria
  for (const category in totais) {
    const totalDiv = totais[category];
    if (totalDiv) {
      const count = totalHitsCount[category];
      const categoryPrize = count * prizeValues[category];
      totalDiv.textContent = `Total: ${count}`;
      if (count > 0) {
        totalDiv.textContent += ` (${formatCurrency(categoryPrize)})`;
      }
    }
  }

  const totalPrizeDiv = document.getElementById('total-prize');
  if (totalPrizeDiv) {
    totalPrizeDiv.textContent = `Total Arrecadado: ${formatCurrency(totalPrize)}`;
  }

  atualizarMensagem(winningGames[11], winningGames[12], winningGames[13], winningGames[14], winningGames[15]);
}

function formatarJogo(jogo, numerosDigitados) {
  const numerosFormatados = jogo.numeros.map(numero =>
    numerosDigitados.includes(numero)
      ? `<span class="highlight">${numero}</span>`
      : numero
  ).join(', ');

  let prizeDetails = '';
  if (jogo.prizes && jogo.prizes.length > 0) {
    const details = jogo.prizes
      .map(p => `${p.count}x ${p.category} acertos`)
      .join(', ');
    prizeDetails = `<span class="prize-details">(Ganhos: ${details})</span>`;
  }

  return `<span class="jogo-id">Jogo ${jogo.numero_jogo+1}: </span> ${numerosFormatados} ${prizeDetails}`;
}

function atualizarMensagem(acertos11, acertos12, acertos13, acertos14, acertos15) {
  const resultMessage = document.getElementById('result-message');
  if (!resultMessage) return;

  if (acertos15.length > 0) {
    resultMessage.textContent = "INACREDITÁVEL!!! ACERTAMOS 15 PONTOS!!!!!!";
  } else if (acertos14.length > 0) {
    resultMessage.textContent = "ESPETACULAR!!! ACERTAMOS 14 PONTOS!!!";
  } else if (acertos13.length > 0) {
    resultMessage.textContent = "Muito bom! Acertamos 13 pontos!";
  } else if (acertos12.length > 0) {
    resultMessage.textContent = "Já paga a aposta! Acertamos 12 pontos!";
  } else if (acertos11.length > 0) {
    resultMessage.textContent = "Ufa! Acertamos 11 pontos!";
  } else {
    resultMessage.textContent = "Não foi dessa vez.";
  }
}

function limparCampos() {
  console.log('Executando limparCampos');
  document.querySelectorAll("input[type='number']").forEach(input => {
    if (!input.id.startsWith('prize-')) {
      input.value = '';
    }
  });
  const resultMessage = document.getElementById('result-message');
  if (resultMessage) resultMessage.textContent = "Calma que vai dar certo!! Lotofácil da Independência!";
  
  const ids = ['11', '12', '13', '14', '15'];
  ids.forEach(id => {
    const div = document.getElementById(`acertos-${id}`);
    if (div) div.innerHTML = '';
    const totalDiv = document.getElementById(`total-${id}-acertos`);
    if (totalDiv) totalDiv.textContent = 'Total: 0';
  });

  const allGamesDiv = document.getElementById('all-games');
  if (allGamesDiv) allGamesDiv.innerHTML = '';

  const totalPrizeDiv = document.getElementById('total-prize');
  if (totalPrizeDiv) {
    totalPrizeDiv.textContent = `Total Arrecadado: R$ 0,00`;
  }
}

function listarTodosJogos() {
  console.log('Executando listarTodosJogos');
  const allGamesDiv = document.getElementById('all-games');
  if (!allGamesDiv) {
    console.warn("Elemento com ID 'all-games' não encontrado no DOM.");
    return;
  }

  allGamesDiv.innerHTML = '';

  window.jogos.forEach(jogo => {
    const linha = document.createElement('div');
    linha.innerHTML = `<span class="jogo-id"> Jogo ${jogo.numero_jogo+1}: </span> ${jogo.numeros.join(', ')}`;
    allGamesDiv.appendChild(linha);
  });
}