/**
 * POKER ENGINE - Texas Hold'em 7-Card Evaluator & Lesson Bank
 * PokerDojo Mobile - Diseñado para evaluación exacta de jugadas y pedagogía.
 */

const SUITS = {
  s: { symbol: '♠', name: 'Picas', colorName: 'black', hex: '#0f172a', bgBadge: 'bg-slate-900 text-white' },
  h: { symbol: '♥', name: 'Corazones', colorName: 'red', hex: '#dc2626', bgBadge: 'bg-red-600 text-white' },
  d: { symbol: '♦', name: 'Diamantes', colorName: 'blue', hex: '#2563eb', bgBadge: 'bg-blue-600 text-white' },
  c: { symbol: '♣', name: 'Tréboles', colorName: 'green', hex: '#16a34a', bgBadge: 'bg-emerald-600 text-white' }
};

const RANK_VALUES = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const RANK_NAMES_SINGULAR = {
  2: 'Dos', 3: 'Tres', 4: 'Cuatro', 5: 'Cinco', 6: 'Seis', 7: 'Siete', 8: 'Ocho', 9: 'Nueve',
  10: 'Diez', 11: 'Jota', 12: 'Dama', 13: 'Rey', 14: 'As'
};

const RANK_NAMES_PLURAL = {
  2: 'Doses', 3: 'Treses', 4: 'Cuatros', 5: 'Cincos', 6: 'Seises', 7: 'Sietes', 8: 'Ochos', 9: 'Nueves',
  10: 'Dieces', 11: 'Jotas', 12: 'Damas', 13: 'Reyes', 14: 'Ases'
};

const HAND_CATEGORIES = {
  9: { name: 'Escalera Real', rankNum: '#1', short: 'Royal Flush' },
  8: { name: 'Escalera de Color', rankNum: '#2', short: 'Straight Flush' },
  7: { name: 'Póker', rankNum: '#3', short: 'Four of a Kind' },
  6: { name: 'Full House', rankNum: '#4', short: 'Full House' },
  5: { name: 'Color', rankNum: '#5', short: 'Flush' },
  4: { name: 'Escalera', rankNum: '#6', short: 'Straight' },
  3: { name: 'Trío', rankNum: '#7', short: 'Three of a Kind' },
  2: { name: 'Doble Pareja', rankNum: '#8', short: 'Two Pair' },
  1: { name: 'Pareja', rankNum: '#9', short: 'One Pair' },
  0: { name: 'Carta Alta', rankNum: '#10', short: 'High Card' }
};

/**
 * Crea un objeto Carta a partir de notación corta ej: 'Ah', 'Kd', 'Tc', '2s'
 */
function createCard(str) {
  if (!str || str.length < 2) return null;
  const rankStr = str[0].toUpperCase();
  const suitStr = str[1].toLowerCase();
  return {
    str: rankStr + suitStr,
    rank: rankStr,
    suit: suitStr,
    value: RANK_VALUES[rankStr] || 0,
    symbol: SUITS[suitStr] ? SUITS[suitStr].symbol : '',
    suitData: SUITS[suitStr] || SUITS.s
  };
}

/**
 * Genera una baraja completa de 52 cartas
 */
function getFreshDeck() {
  const deck = [];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  const suits = ['s', 'h', 'd', 'c'];
  for (const s of suits) {
    for (const r of ranks) {
      deck.push(createCard(r + s));
    }
  }
  return deck;
}

/**
 * Evalúa exactamente 5 cartas
 * Devuelve { category, categoryName, rankNum, scoreVector, detailedDescription, cards }
 */
function evaluate5Cards(cards) {
  // Ordenar cartas de mayor a menor valor
  const sorted = [...cards].sort((a, b) => b.value - a.value);
  const values = sorted.map(c => c.value);
  const suits = sorted.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);

  // Verificar si es escalera
  let isStraight = false;
  let straightHigh = 0;

  // Chequeo estándar
  const uniqueValues = [...new Set(values)];
  if (uniqueValues.length === 5) {
    if (values[0] - values[4] === 4) {
      isStraight = true;
      straightHigh = values[0];
    } else if (values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
      // Escalera Wheel (A-2-3-4-5) donde el As cuenta como 1 y la carta más alta es 5
      isStraight = true;
      straightHigh = 5;
    }
  }

  // Contar frecuencias de rangos
  const counts = {};
  for (const v of values) {
    counts[v] = (counts[v] || 0) + 1;
  }
  const freqGroups = Object.entries(counts).map(([v, count]) => ({
    val: parseInt(v, 10),
    count: count
  })).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.val - a.val;
  });

  // 1. Escalera Real y Escalera de Color
  if (isStraight && isFlush) {
    if (straightHigh === 14) {
      return {
        category: 9,
        categoryName: 'Escalera Real',
        rankNum: '#1',
        scoreVector: [9, 14],
        detailedDescription: `Escalera Real al As de ${SUITS[suits[0]].name} (A-K-Q-J-10)`,
        cards: sorted
      };
    }
    return {
      category: 8,
      categoryName: 'Escalera de Color',
      rankNum: '#2',
      scoreVector: [8, straightHigh],
      detailedDescription: `Escalera de Color al ${RANK_NAMES_SINGULAR[straightHigh]} de ${SUITS[suits[0]].name}`,
      cards: sorted
    };
  }

  // 2. Póker (Four of a Kind)
  if (freqGroups[0].count === 4) {
    const quadVal = freqGroups[0].val;
    const kicker = freqGroups[1].val;
    return {
      category: 7,
      categoryName: 'Póker',
      rankNum: '#3',
      scoreVector: [7, quadVal, kicker],
      detailedDescription: `Póker de ${RANK_NAMES_PLURAL[quadVal]} con Kicker ${RANK_NAMES_SINGULAR[kicker]}`,
      cards: sorted
    };
  }

  // 3. Full House (3 + 2)
  if (freqGroups[0].count === 3 && freqGroups[1].count === 2) {
    const trioVal = freqGroups[0].val;
    const pairVal = freqGroups[1].val;
    return {
      category: 6,
      categoryName: 'Full House',
      rankNum: '#4',
      scoreVector: [6, trioVal, pairVal],
      detailedDescription: `Full House de ${RANK_NAMES_PLURAL[trioVal]} y ${RANK_NAMES_PLURAL[pairVal]}`,
      cards: sorted
    };
  }

  // 4. Color (Flush)
  if (isFlush) {
    return {
      category: 5,
      categoryName: 'Color',
      rankNum: '#5',
      scoreVector: [5, ...values],
      detailedDescription: `Color de ${SUITS[suits[0]].name} al ${RANK_NAMES_SINGULAR[values[0]]}`,
      cards: sorted
    };
  }

  // 5. Escalera (Straight)
  if (isStraight) {
    return {
      category: 4,
      categoryName: 'Escalera',
      rankNum: '#6',
      scoreVector: [4, straightHigh],
      detailedDescription: straightHigh === 5 
        ? `Escalera Rueda (Wheel) A-2-3-4-5 (As bajo)` 
        : `Escalera al ${RANK_NAMES_SINGULAR[straightHigh]}`,
      cards: sorted
    };
  }

  // 6. Trío (Three of a Kind)
  if (freqGroups[0].count === 3) {
    const trioVal = freqGroups[0].val;
    const kickers = [freqGroups[1].val, freqGroups[2].val].sort((a, b) => b - a);
    return {
      category: 3,
      categoryName: 'Trío',
      rankNum: '#7',
      scoreVector: [3, trioVal, ...kickers],
      detailedDescription: `Trío de ${RANK_NAMES_PLURAL[trioVal]} (Kickers ${RANK_NAMES_SINGULAR[kickers[0]]} y ${RANK_NAMES_SINGULAR[kickers[1]]})`,
      cards: sorted
    };
  }

  // 7. Doble Pareja (Two Pair)
  if (freqGroups[0].count === 2 && freqGroups[1].count === 2) {
    const highPair = Math.max(freqGroups[0].val, freqGroups[1].val);
    const lowPair = Math.min(freqGroups[0].val, freqGroups[1].val);
    const kicker = freqGroups[2].val;
    return {
      category: 2,
      categoryName: 'Doble Pareja',
      rankNum: '#8',
      scoreVector: [2, highPair, lowPair, kicker],
      detailedDescription: `Doble Pareja de ${RANK_NAMES_PLURAL[highPair]} y ${RANK_NAMES_PLURAL[lowPair]} (Kicker ${RANK_NAMES_SINGULAR[kicker]})`,
      cards: sorted
    };
  }

  // 8. Pareja (One Pair)
  if (freqGroups[0].count === 2) {
    const pairVal = freqGroups[0].val;
    const kickers = [freqGroups[1].val, freqGroups[2].val, freqGroups[3].val].sort((a, b) => b - a);
    return {
      category: 1,
      categoryName: 'Pareja',
      rankNum: '#9',
      scoreVector: [1, pairVal, ...kickers],
      detailedDescription: `Pareja de ${RANK_NAMES_PLURAL[pairVal]} (Kickers ${RANK_NAMES_SINGULAR[kickers[0]]}, ${RANK_NAMES_SINGULAR[kickers[1]]}, ${RANK_NAMES_SINGULAR[kickers[2]]})`,
      cards: sorted
    };
  }

  // 9. Carta Alta (High Card)
  return {
    category: 0,
    categoryName: 'Carta Alta',
    rankNum: '#10',
    scoreVector: [0, ...values],
    detailedDescription: `Carta Alta ${RANK_NAMES_SINGULAR[values[0]]} (Acompañantes ${RANK_NAMES_SINGULAR[values[1]]}, ${RANK_NAMES_SINGULAR[values[2]]})`,
    cards: sorted
  };
}

/**
 * Obtiene todas las combinaciones de k elementos de un array
 */
function getCombinations(arr, k) {
  const result = [];
  function backtrack(start, combo) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      backtrack(i + 1, combo);
      combo.pop();
    }
  }
  backtrack(0, []);
  return result;
}

/**
 * Compara dos vectores de puntuación
 * Retorna > 0 si vecA > vecB, < 0 si vecA < vecB, 0 si son idénticos
 */
function compareScoreVectors(vecA, vecB) {
  for (let i = 0; i < Math.max(vecA.length, vecB.length); i++) {
    const a = vecA[i] || 0;
    const b = vecB[i] || 0;
    if (a !== b) return a - b;
  }
  return 0;
}

/**
 * Evalúa las 7 cartas (2 mano + 5 comunitarias) y encuentra la mejor mano de 5 cartas
 */
function evaluate7Cards(holeCards, boardCards) {
  const all7 = [...holeCards, ...boardCards];
  const combos = getCombinations(all7, 5);
  let bestHand = null;

  for (const combo of combos) {
    const evalResult = evaluate5Cards(combo);
    if (!bestHand || compareScoreVectors(evalResult.scoreVector, bestHand.scoreVector) > 0) {
      bestHand = evalResult;
    }
  }
  return bestHand;
}

/**
 * Compara Jugador A vs Jugador B dadas sus 2 cartas y el board
 */
function comparePlayers(handA, handB, board) {
  const cardObjectsA = handA.map(c => typeof c === 'string' ? createCard(c) : c);
  const cardObjectsB = handB.map(c => typeof c === 'string' ? createCard(c) : c);
  const boardObjects = board.map(c => typeof c === 'string' ? createCard(c) : c);

  const evalA = evaluate7Cards(cardObjectsA, boardObjects);
  const evalB = evaluate7Cards(cardObjectsB, boardObjects);

  const diff = compareScoreVectors(evalA.scoreVector, evalB.scoreVector);
  let winner = 'tie';
  if (diff > 0) winner = 'A';
  else if (diff < 0) winner = 'B';

  return {
    winner, // 'A', 'B', o 'tie'
    evalA,
    evalB,
    board: boardObjects,
    handA: cardObjectsA,
    handB: cardObjectsB
  };
}

/**
 * Genera una explicación pedagógica completa estilo Duolingo
 */
function getEducationalExplanation(matchResult) {
  const { winner, evalA, evalB, handA, handB, board } = matchResult;

  if (winner === 'tie') {
    // Verificar si la mejor jugada es exactamente la mesa completa
    const boardBest5 = evaluate5Cards(board);
    const isPlayingBoard = compareScoreVectors(boardBest5.scoreVector, evalA.scoreVector) === 0;

    if (isPlayingBoard) {
      return {
        title: '🤝 ¡EMPATE! (La mesa es la jugada ganadora)',
        badge: 'Split Pot - Playing The Board',
        summary: `Ambos jugadores empatan porque la mejor jugada posible ya está en las 5 cartas comunitarias: ${evalA.detailedDescription}. Ninguna carta en mano mejora esta combinación. ¡El pozo se divide 50/50!`
      };
    }
    return {
      title: '🤝 ¡EMPATE EXACTO!',
      badge: 'Split Pot',
      summary: `Ambos jugadores tienen exactamente la misma combinación: ${evalA.detailedDescription}. Al no haber diferencia de kicker, el pozo se divide en partes iguales.`
    };
  }

  const winningEval = winner === 'A' ? evalA : evalB;
  const losingEval = winner === 'A' ? evalB : evalA;
  const winPlayerName = winner === 'A' ? 'Jugador A' : 'Jugador B';
  const losePlayerName = winner === 'A' ? 'Jugador B' : 'Jugador A';

  // Caso 1: Categorías distintas
  if (winningEval.category !== losingEval.category) {
    return {
      title: `🏆 ¡Gana ${winPlayerName}!`,
      badge: `${winningEval.categoryName} supera a ${losingEval.categoryName}`,
      summary: `${winPlayerName} tiene **${winningEval.categoryName}** (${winningEval.rankNum}: ${winningEval.detailedDescription}), que supera a la **${losingEval.categoryName}** del ${losePlayerName} (${losingEval.rankNum}: ${losingEval.detailedDescription}).`
    };
  }

  // Caso 2: Misma categoría pero distinto rango principal
  if (winningEval.scoreVector[1] !== losingEval.scoreVector[1]) {
    return {
      title: `🏆 ¡Gana ${winPlayerName} por Rango Superior!`,
      badge: `Misma jugada, mayor jerarquía`,
      summary: `Ambos lograron **${winningEval.categoryName}**, pero ${winPlayerName} tiene ${winningEval.detailedDescription}, mientras que ${losePlayerName} solo tiene ${losingEval.detailedDescription}.`
    };
  }

  // Caso 3: Desempate por Kicker (carta de desempate)
  return {
    title: `🏆 ¡Gana ${winPlayerName} por KICKER!`,
    badge: `Desempate por carta alta de acompañamiento`,
    summary: `Ambos comparten la misma jugada base (${winningEval.categoryName}), pero ${winPlayerName} gana gracias a su carta de desempate más alta (**Kicker**): ${winningEval.detailedDescription} frente a ${losingEval.detailedDescription}. ¡Solo cuentan las mejores 5 cartas!`
  };
}

// ==========================================
// BANCO DE 30 LECCIONES GUIADAS DISEÑADAS A MANO
// ==========================================
const GUIDED_LESSONS = {
  1: [
    // NIVEL 1: Novato - Diferencias claras
    {
      id: 'L1_01',
      title: 'Lección 1: Pareja vs Doble Pareja',
      tip: 'Dos pares de cartas iguales siempre le ganan a un solo par.',
      board: ['2s', '8h', 'Jd', '4c', '7h'],
      handA: ['8d', 'Jc'], // Doble pareja Jotas y Ochos
      handB: ['As', '8s']  // Pareja de Ochos con As
    },
    {
      id: 'L1_02',
      title: 'Lección 2: Doble Pareja vs Trío',
      tip: 'Tres cartas del mismo número (Trío) son más difíciles de conseguir que dos parejas.',
      board: ['Kh', '7d', '2c', '9s', '4h'],
      handA: ['Kd', '7s'], // Doble pareja Reyes y Sietes
      handB: ['9h', '9c']  // Trío de Nueves
    },
    {
      id: 'L1_03',
      title: 'Lección 3: Trío vs Escalera',
      tip: 'Cinco cartas seguidas en número (Escalera) vencen al Trío.',
      board: ['5h', '6d', '7s', 'Ks', '2c'],
      handA: ['8c', '9h'], // Escalera 5-6-7-8-9
      handB: ['Kd', 'Kh']  // Trío de Reyes
    },
    {
      id: 'L1_04',
      title: 'Lección 4: Escalera vs Color',
      tip: 'Cinco cartas del mismo palo (Color) superan a cualquier Escalera ordinaria.',
      board: ['4h', '8h', 'Jh', '9s', 'Tc'],
      handA: ['7d', '8c'], // Escalera 7-8-9-T-J
      handB: ['2h', 'Kh']  // Color de Corazones al Rey
    },
    {
      id: 'L1_05',
      title: 'Lección 5: Color vs Full House',
      tip: 'Un Full House (un trío + una pareja) supera a un Color.',
      board: ['Ah', 'Kh', '3h', 'As', 'Kd'],
      handA: ['Ac', '7s'], // Full House de Ases y Reyes (A-A-A-K-K)
      handB: ['Qh', '9h']  // Color de Corazones al As (A-K-Q-9-3)
    },
    {
      id: 'L1_06',
      title: 'Lección 6: Full House vs Póker',
      tip: 'Tener las cuatro cartas del mismo valor en la baraja (Póker) destruye al Full House.',
      board: ['Jc', 'Jd', 'Js', '4h', 'Kc'],
      handA: ['Jh', '2d'], // Póker de Jotas
      handB: ['Kh', 'Kd']  // Full House de Reyes y Jotas (K-K-K-J-J)
    },
    {
      id: 'L1_07',
      title: 'Lección 7: Carta Alta vs Pareja Mínima',
      tip: 'Incluso la pareja más pequeña (Doses) supera a una carta alta como el As.',
      board: ['3d', '7s', '9c', 'Jd', 'Kh'],
      handA: ['As', 'Qc'], // Carta alta As
      handB: ['2h', '2s']  // Pareja de Doses
    },
    {
      id: 'L1_08',
      title: 'Lección 8: Doble Pareja Baja vs Doble Pareja Alta',
      tip: 'Cuando ambos tienen dos parejas, manda la pareja más alta primero.',
      board: ['9c', '8h', '2d', '4s', 'Th'],
      handA: ['Ts', '9s'], // Doble pareja Dieces y Nueves
      handB: ['8c', '2s']  // Doble pareja Ochos y Doses
    },
    {
      id: 'L1_09',
      title: 'Lección 9: Trío en Mesa con Acompañante',
      tip: 'Si hay un trío en la mesa común, quien tenga la carta más alta gana.',
      board: ['Qc', 'Qd', 'Qs', '4h', '7s'],
      handA: ['As', '2h'], // Trío de Damas con Kicker As
      handB: ['Kh', 'Jc']  // Trío de Damas con Kicker Rey
    },
    {
      id: 'L1_10',
      title: 'Lección 10: Color Oculto',
      tip: 'Aunque veas una escalera en la mesa, 5 cartas del mismo color siempre ganan.',
      board: ['7d', '8d', '9d', 'Ts', 'Jh'],
      handA: ['2d', 'Ad'], // Color de Diamantes
      handB: ['Qc', '3s']  // Escalera a la Dama (8-9-T-J-Q)
    }
  ],
  2: [
    // NIVEL 2: Intermedio - Kickers y Escaleras especiales
    {
      id: 'L2_01',
      title: 'Lección 11: El Kicker Decisivo',
      tip: 'Ambos tienen la misma Pareja de Ases, pero el Kicker más alto decide la mano.',
      board: ['Ah', '7d', '4s', '2c', '9h'],
      handA: ['Ac', 'Kd'], // Pareja de Ases con Kicker Rey
      handB: ['As', 'Qh']  // Pareja de Ases con Kicker Dama
    },
    {
      id: 'L2_02',
      title: 'Lección 12: Segundo Kicker en Pareja',
      tip: 'Si comparten la pareja y el primer kicker, desempatará el segundo kicker.',
      board: ['Kc', '8d', '3h', '2s', '4d'],
      handA: ['Kh', 'As', 'Qd'], // Nota: se toman 2 de mano
      handA: ['Kh', 'As'], // Pareja de Reyes, Kicker A, 8, 4
      handB: ['Ks', 'Ah']  // Empate exacto! Mismos kickers
    },
    {
      id: 'L2_03',
      title: 'Lección 13: Escalera Wheel (A-2-3-4-5)',
      tip: 'La escalera con As bajo (1-2-3-4-5) es la escalera más débil del poker.',
      board: ['2h', '3d', '4s', 'Kh', '9c'],
      handA: ['As', '5c'], // Escalera al 5 (A-2-3-4-5)
      handB: ['5h', '6h']  // Escalera al 6 (2-3-4-5-6)
    },
    {
      id: 'L2_04',
      title: 'Lección 14: Kicker en Doble Pareja',
      tip: 'En Doble Pareja solo queda 1 carta de kicker para completar las 5.',
      board: ['Ac', 'As', 'Kd', '7h', '2s'],
      handA: ['Kh', 'Qc'], // Dobles A y K con Kicker Dama
      handB: ['Kc', 'Jd']  // Dobles A y K con Kicker Jota
    },
    {
      id: 'L2_05',
      title: 'Lección 15: Escalera Alta vs Escalera Baja',
      tip: 'En duelo de escaleras, gana la que termine en la carta más alta.',
      board: ['8c', '9d', 'Th', 'Js', '2c'],
      handA: ['Qh', '3s'], // Escalera a la Dama (8-9-T-J-Q)
      handB: ['7s', '4d']  // Escalera a la Jota (7-8-9-T-J)
    },
    {
      id: 'L2_06',
      title: 'Lección 16: Duelo de Colores (Flush)',
      tip: 'Cuando ambos tienen Color, no importa quién tiene más cartas del palo, sino la más alta.',
      board: ['4c', '7c', '9c', '2s', 'Jd'],
      handA: ['Ac', '3c'], // Color de Tréboles al As
      handB: ['Kc', 'Qc']  // Color de Tréboles al Rey
    },
    {
      id: 'L2_07',
      title: 'Lección 17: Full House: El Trío Manda Primero',
      tip: 'En Full House siempre se compara primero el trío, no la pareja acompañante.',
      board: ['8s', '8h', '2d', '2c', '7h'],
      handA: ['8d', 'Kh'], // Full de Ochos y Doses (8-8-8-2-2)
      handB: ['2s', 'As']  // Full de Doses y Ochos (2-2-2-8-8)
    },
    {
      id: 'L2_08',
      title: 'Lección 18: Kicker Compartido en la Mesa',
      tip: 'Si el kicker de la mesa es más alto que los de tu mano, ambos empatan.',
      board: ['Ts', 'Th', 'Ac', 'Kd', '4s'],
      handA: ['7c', '2h'], // Pareja de Dieces con A, K, 7
      handB: ['7d', '3s']  // Pareja de Dieces con A, K, 7 (Empate!)
    },
    {
      id: 'L2_09',
      title: 'Lección 19: Color con 1 Carta de Mano',
      tip: 'Solo necesitas usar las cartas necesarias para hacer 5 del mismo palo.',
      board: ['2h', '6h', 'Th', 'Kh', 'As'],
      handA: ['Ah', '9c'], // Color de Corazones al As
      handB: ['Qh', 'Jh']  // Color de Corazones al Rey (el As en mesa no es de corazón)
    },
    {
      id: 'L2_10',
      title: 'Lección 20: Trío vs Trío',
      tip: 'El valor de las tres cartas iguales determina quién gana inmediatamente.',
      board: ['4h', '4d', '9c', 'Ts', '2h'],
      handA: ['4s', 'Ah'], // Trío de Cuatros
      handB: ['9s', '9h']  // Trío de Nueves
    }
  ],
  3: [
    // NIVEL 3: Avanzado - Trampas, Splits y Manos de 5 cartas
    {
      id: 'L3_01',
      title: 'Lección 21: La Trampa de la Triple Pareja',
      tip: '¡El poker es un juego de exactamente 5 cartas! Solo juegan tus dos pares más altos.',
      board: ['Ah', 'As', 'Kh', 'Kd', '2c'],
      handA: ['4c', '4d'], // No es "tres parejas". Es A-A-K-K con 4 de kicker
      handB: ['Qc', 'Jd']  // A-A-K-K con Dama de kicker (¡Gana Jugador B!)
    },
    {
      id: 'L3_02',
      title: 'Lección 22: Escalera en Mesa (Playing the Board)',
      tip: 'Si las 5 cartas de la mesa forman la mejor escalera posible, el pozo se divide.',
      board: ['9c', 'Th', 'Jd', 'Qs', 'Kh'],
      handA: ['2h', '3s'], // Escalera al Rey (de la mesa)
      handB: ['4d', '5c']  // Escalera al Rey (de la mesa) -> Empate
    },
    {
      id: 'L3_03',
      title: 'Lección 23: Superar la Escalera de la Mesa',
      tip: 'La mesa tiene escalera, pero si tienes el As conectas una escalera superior.',
      board: ['9c', 'Th', 'Jd', 'Qs', 'Kh'],
      handA: ['As', '2c'], // Escalera al As (T-J-Q-K-A Broadway)
      handB: ['8s', '7d']  // Escalera al Rey (de la mesa)
    },
    {
      id: 'L3_04',
      title: 'Lección 24: Kicker en Doble Pareja Compartida',
      tip: 'Ambos comparten las dos parejas de la mesa. El desempate es por la 5ta carta.',
      board: ['Kd', 'Ks', 'Jc', 'Jh', '3s'],
      handA: ['Ah', '2c'], // K-K-J-J con Kicker As
      handB: ['Qd', 'Ts']  // K-K-J-J con Kicker Dama
    },
    {
      id: 'L3_05',
      title: 'Lección 25: Kicker que No Juega (Split Pot)',
      tip: 'Tu carta en mano es menor que la 5ta carta de la mesa, por lo que queda fuera de las 5.',
      board: ['Ac', 'As', 'Qh', 'Qd', 'Jh'],
      handA: ['9s', '8c'], // A-A-Q-Q-J (el 9 no entra)
      handB: ['6h', '2d']  // A-A-Q-Q-J (el 6 no entra) -> Empate!
    },
    {
      id: 'L3_06',
      title: 'Lección 26: Color en la Mesa (Flush on Board)',
      tip: 'Las 5 comunitarias son de picas. Si nadie tiene una pica superior, es split.',
      board: ['As', 'Ks', '9s', '6s', '2s'],
      handA: ['Ah', 'Kd'], // Juega el color de la mesa
      handB: ['Qc', 'Jd']  // Juega el color de la mesa -> Empate
    },
    {
      id: 'L3_07',
      title: 'Lección 27: Color en Mesa con Carta Mayor en Mano',
      tip: 'La mesa tiene 4 cartas de un palo; quien tenga la carta más alta de ese palo se lleva todo.',
      board: ['Js', 'Ts', '6s', '3s', 'Ah'],
      handA: ['As', '2c'], // Color de Picas al As
      handB: ['Ks', 'Qd']  // Color de Picas al Rey
    },
    {
      id: 'L3_08',
      title: 'Lección 28: Póker en la Mesa',
      tip: 'La mesa tiene 4 cartas iguales; el jugador con la 5ta carta más alta gana.',
      board: ['7h', '7c', '7d', '7s', '9c'],
      handA: ['Kh', '2s'], // Póker de Sietes con Kicker Rey
      handB: ['Qd', 'Jd']  // Póker de Sietes con Kicker Dama
    },
    {
      id: 'L3_09',
      title: 'Lección 29: Underfull vs Overfull',
      tip: 'En mesa con dos parejas, conectar trío con la pareja alta supera al trío con la baja.',
      board: ['Kh', 'Ks', '9h', '9c', '2d'],
      handA: ['Kd', '3c'], // Full House de Reyes y Nueves (K-K-K-9-9)
      handB: ['9s', 'Ac']  // Full House de Nueves y Reyes (9-9-9-K-K)
    },
    {
      id: 'L3_10',
      title: 'Lección 30: El Engaño del Doble Par en Mano',
      tip: 'Tus dos cartas forman pareja con una en mesa, pero la mesa ya tenía algo mejor.',
      board: ['Ac', 'Ah', 'Ad', 'Ks', '8d'],
      handA: ['Kh', '2c'], // Full House de Ases y Reyes (A-A-A-K-K)
      handB: ['8s', '8c']  // Full House de Ases y Ochos (A-A-A-8-8)
    }
  ]
};

/**
 * Genera un duelo aleatorio válido de Texas Hold'em
 */
function generateRandomDuel() {
  const deck = getFreshDeck();
  // Barajar
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  const handA = [deck.pop(), deck.pop()];
  const handB = [deck.pop(), deck.pop()];
  const board = [deck.pop(), deck.pop(), deck.pop(), deck.pop(), deck.pop()];

  return {
    board: board.map(c => c.str),
    handA: handA.map(c => c.str),
    handB: handB.map(c => c.str)
  };
}

// ==========================================
// MODO 2: BANCO DE PREGUNTAS "ENTRENA TU OJO"
// ==========================================
const EYE_TRAINING_QUESTIONS = [
  {
    id: 'E01',
    hole: ['Ah', 'Kh'],
    board: ['Qh', 'Jh', 'Th'],
    options: ['Escalera Real', 'Color', 'Escalera', 'Trío'],
    correct: 'Escalera Real',
    explanation: '¡Tienes A-K-Q-J-10 del mismo palo (Corazones)! Es la jugada invencible del poker.'
  },
  {
    id: 'E02',
    hole: ['8c', '8d'],
    board: ['8s', '2h', 'Jd', '5c'],
    options: ['Un Par', 'Doble Par', 'Trío', 'Full House'],
    correct: 'Trío',
    explanation: 'Tienes tres Ochos (dos en mano + uno en mesa).'
  },
  {
    id: 'E03',
    hole: ['Ac', 'Kd'],
    board: ['As', 'Kh', '4c', '7d'],
    options: ['Un Par', 'Doble Par', 'Full House', 'Carta Alta'],
    correct: 'Doble Par',
    explanation: 'Conectas un Par de Ases y un Par de Reyes.'
  },
  {
    id: 'E04',
    hole: ['9h', '8h'],
    board: ['7h', '6h', '2c'],
    options: ['Color Hecho', 'Proyecto de Color + Escalera', 'Un Par', 'Trío'],
    correct: 'Proyecto de Color + Escalera',
    explanation: 'Tienes 4 cartas de corazones (a 1 del Color) y 6-7-8-9 (a 1 de la Escalera). ¡Monstruo de proyecto!'
  },
  {
    id: 'E05',
    hole: ['Js', 'Qs'],
    board: ['Ks', '2s', '9s', '4d', '6c'],
    options: ['Escalera', 'Color', 'Carta Alta', 'Doble Par'],
    correct: 'Color',
    explanation: 'Tienes 5 picas en total (dos en mano + tres en mesa).'
  },
  {
    id: 'E06',
    hole: ['5c', '5d'],
    board: ['Kh', 'Kd', 'Ks', '2c'],
    options: ['Full House', 'Trío', 'Doble Par', 'Póker'],
    correct: 'Full House',
    explanation: 'La mesa tiene tres Reyes y tu mano tiene dos Cincos: Full House de Reyes y Cincos.'
  },
  {
    id: 'E07',
    hole: ['4h', '5d'],
    board: ['6s', '7c', '8h', '2d'],
    options: ['Escalera', 'Trío', 'Carta Alta', 'Doble Par'],
    correct: 'Escalera',
    explanation: 'Tus cartas forman 4-5-6-7-8 consecutivas: Escalera al Ocho.'
  },
  {
    id: 'E08',
    hole: ['Ac', '2d'],
    board: ['3h', '4s', '5c', '9d', 'Kd'],
    options: ['Escalera Wheel', 'Pareja de Ases', 'Color', 'Carta Alta As'],
    correct: 'Escalera Wheel',
    explanation: 'A-2-3-4-5 es la famosa "Wheel" (Rueda): escalera baja al 5.'
  },
  {
    id: 'E09',
    hole: ['Kc', 'Qc'],
    board: ['Jd', '7h', '2s', '3c', '9h'],
    options: ['Escalera', 'Un Par', 'Carta Alta Rey', 'Color'],
    correct: 'Carta Alta Rey',
    explanation: 'No hay parejas ni proyectos completados; tu mejor combinación es Carta Alta Rey.'
  },
  {
    id: 'E10',
    hole: ['Qh', 'Qd'],
    board: ['Qs', 'Qc', 'Ah', '4d'],
    options: ['Full House', 'Póker', 'Trío', 'Doble Par'],
    correct: 'Póker',
    explanation: '¡Tienes las 4 Damas de la baraja! Póker de Damas.'
  },
  {
    id: 'E11',
    hole: ['7s', '8s'],
    board: ['7h', '7d', '8c', '2s', 'Jd'],
    options: ['Full House', 'Trío', 'Doble Par', 'Póker'],
    correct: 'Full House',
    explanation: 'Tienes tres Sietes y dos Ochos: Full House.'
  },
  {
    id: 'E12',
    hole: ['Ad', '4d'],
    board: ['Kd', 'Jd', '2c', '8h'],
    options: ['Color Hecho', 'Proyecto de Color', 'Carta Alta', 'Escalera'],
    correct: 'Proyecto de Color',
    explanation: 'Tienes 4 diamantes (Ad, 4d, Kd, Jd) en el Turn; te falta solo 1 diamante en el River para el Color.'
  }
];

// ==========================================
// MODO 3: BANCO DE PREGUNTAS "SEMÁFORO PREFLOP"
// ==========================================
const PREFLOP_SCENARIOS = [
  {
    id: 'P01',
    cards: ['As', 'Ah'],
    pos: 'UTG (Primero en hablar)',
    posDesc: 'Posición temprana bajo el cañón',
    stack: '100 BB',
    correct: 'RAISE',
    explanation: '¡La mejor mano inicial de todo el poker! Se abre subiendo (Raise) desde cualquier posición para construir el pozo.'
  },
  {
    id: 'P02',
    cards: ['7c', '2d'],
    pos: 'BTN (Dealer / Botón)',
    posDesc: 'La mejor posición de la mesa',
    stack: '40 BB',
    correct: 'FOLD',
    explanation: '72o es matemáticamente la peor mano del poker: cartas desconectadas y de distinto palo que no ligan buenas escaleras.'
  },
  {
    id: 'P03',
    cards: ['Kd', '8s'],
    pos: 'UTG (Primero en hablar)',
    posDesc: 'Quedan 8 jugadores por hablar detrás de ti',
    stack: '50 BB',
    correct: 'FOLD',
    explanation: 'En posición temprana, K8o es una mano dominada por manos como AK, KQ, KJ. Si ligas el Rey, perderás muchas fichas.'
  },
  {
    id: 'P04',
    cards: ['Js', 'Ts'],
    pos: 'BTN (Dealer / Botón)',
    posDesc: 'Último en hablar postflop con ventaja absoluta',
    stack: '40 BB',
    correct: 'RAISE',
    explanation: 'Los conectores en suite (JTs) tienen enorme jugabilidad para escaleras y colores. Desde el Botón, siempre se sube.'
  },
  {
    id: 'P05',
    cards: ['Qc', 'Qd'],
    pos: 'CO (Cutoff - Antes del Botón)',
    posDesc: 'Posición tardía muy rentable',
    stack: '30 BB',
    correct: 'RAISE',
    explanation: 'Damas en mano es una mano premium top-3. Sube para cobrar valor a manos peores y proteger tu equidad.'
  },
  {
    id: 'P06',
    cards: ['2c', '2h'],
    pos: 'SB (Ciega Pequeña)',
    posDesc: 'Todos se han tirado hasta ti',
    stack: '12 BB (Poco Stack)',
    correct: 'RAISE',
    explanation: 'Con 12 BB y un par en mano en SB vs BB, la jugada estándar de torneo es Push / All-in directo para ganar las ciegas.'
  },
  {
    id: 'P07',
    cards: ['Ad', '5d'],
    pos: 'BTN (Dealer / Botón)',
    posDesc: 'Ideal para faroles con As suited',
    stack: '60 BB',
    correct: 'RAISE',
    explanation: 'A5s es el mejor semi-farol preflop: bloquea los Ases del rival y puede ligar la escalera Wheel o el color máximo al As.'
  },
  {
    id: 'P08',
    cards: ['9c', '4h'],
    pos: 'BB (Ciega Grande)',
    posDesc: 'UTG subió a 3x y CO pagó',
    stack: '35 BB',
    correct: 'FOLD',
    explanation: 'Mano débil y basura sin potencial. Aunque estés en la ciega grande, pagar ante una subida de UTG es tirar fichas.'
  },
  {
    id: 'P09',
    cards: ['Kh', 'Qh'],
    pos: 'MP (Posición Media)',
    posDesc: 'Dos jugadores se tiraron antes de ti',
    stack: '50 BB',
    correct: 'RAISE',
    explanation: 'KQs (Reyes y Damas del mismo palo) es una mano de gran fuerza que domina a la mayoría del rango rival.'
  },
  {
    id: 'P10',
    cards: ['Tc', '7s'],
    pos: 'SB (Ciega Pequeña)',
    posDesc: 'Hubo 3 limpers antes de ti',
    stack: '25 BB',
    correct: 'FOLD',
    explanation: 'Jugar fuera de posición con cartas desconectadas te meterá en situaciones difíciles postflop.'
  },
  {
    id: 'P11',
    cards: ['As', 'Kd'],
    pos: 'UTG+1',
    posDesc: 'UTG se tiró',
    stack: '80 BB',
    correct: 'RAISE',
    explanation: 'AK ("Big Slick") es la mano no-par más poderosa. Se sube agresivamente para tomar la iniciativa.'
  },
  {
    id: 'P12',
    cards: ['7h', '8h'],
    pos: 'BB (Ciega Grande)',
    posDesc: 'El botón hizo una subida mínima estándar',
    stack: '45 BB',
    correct: 'CALL',
    explanation: 'Con buen precio en la ciega grande y cartas conectadas del mismo palo, un Call para ver el flop con odds favorables es correcto.'
  }
];

// ==========================================
// MODO 4: JERARQUÍA INTERACTIVA DE MANOS
// ==========================================
const POKER_HANDS_HIERARCHY = [
  {
    rank: 1,
    name: 'Escalera Real',
    enName: 'Royal Flush',
    odds: '0.00015% (1 en 649,740)',
    cards: ['As', 'Ks', 'Qs', 'Js', 'Ts'],
    rule: 'La mano perfecta e invencible. A-K-Q-J-10 del mismo palo.',
    mnemonic: 'El As corona la escalera más alta y del mismo color. Nadie te gana.'
  },
  {
    rank: 2,
    name: 'Escalera de Color',
    enName: 'Straight Flush',
    odds: '0.00139% (1 en 72,193)',
    cards: ['9h', '8h', '7h', '6h', '5h'],
    rule: 'Cinco cartas numéricamente seguidas y todas del mismo palo.',
    mnemonic: 'Es una escalera donde todas las cartas además son del mismo traje.'
  },
  {
    rank: 3,
    name: 'Póker',
    enName: 'Four of a Kind',
    odds: '0.024% (1 en 4,165)',
    cards: ['Jc', 'Jd', 'Jh', 'Js', 'Ad'],
    rule: 'Las cuatro cartas del mismo número que existen en la baraja.',
    mnemonic: 'Cuatro iguales. Solo una escalera de color o real puede batirla.'
  },
  {
    rank: 4,
    name: 'Full House',
    enName: 'Full House',
    odds: '0.144% (1 en 694)',
    cards: ['Kh', 'Kd', 'Ks', '7c', '7s'],
    rule: 'Un Trío (3 cartas iguales) acompañado de una Pareja (2 iguales).',
    mnemonic: 'Casa Llena. En empate, el trío manda antes que la pareja.'
  },
  {
    rank: 5,
    name: 'Color',
    enName: 'Flush',
    odds: '0.196% (1 en 508)',
    cards: ['Ad', 'Jd', '8d', '4d', '2d'],
    rule: 'Cinco cartas del mismo palo sin importar si son consecutivas.',
    mnemonic: 'El Color le gana a la Escalera porque es más difícil reunir 5 del mismo palo.'
  },
  {
    rank: 6,
    name: 'Escalera',
    enName: 'Straight',
    odds: '0.392% (1 en 255)',
    cards: ['9c', '8d', '7h', '6s', '5c'],
    rule: 'Cinco cartas seguidas en número de palos combinados.',
    mnemonic: 'La escalera Wheel (A-2-3-4-5) es la más baja; Broadway (T-J-Q-K-A) la más alta.'
  },
  {
    rank: 7,
    name: 'Trío',
    enName: 'Three of a Kind',
    odds: '2.11% (1 en 47)',
    cards: ['8s', '8c', '8h', 'Kd', '4s'],
    rule: 'Tres cartas del mismo rango numérico.',
    mnemonic: 'Si se hace con una pareja en tu mano se llama "Set"; si hay par en mesa es "Trips".'
  },
  {
    rank: 8,
    name: 'Doble Pareja',
    enName: 'Two Pair',
    odds: '4.75% (1 en 21)',
    cards: ['Ac', 'Ah', '9d', '9s', 'Kh'],
    rule: 'Dos pares de cartas del mismo valor + 1 kicker de desempate.',
    mnemonic: '¡Solo juegan 5 cartas! Si tienes tres pares, el menor se descarta por completo.'
  },
  {
    rank: 9,
    name: 'Pareja',
    enName: 'One Pair',
    odds: '42.3% (1 en 2.4)',
    cards: ['Qc', 'Qh', 'Ad', '8s', '3c'],
    rule: 'Dos cartas del mismo valor acompañadas de tres kickers.',
    mnemonic: 'La jugada hecha más común en Texas Hold\'em.'
  },
  {
    rank: 10,
    name: 'Carta Alta',
    enName: 'High Card',
    odds: '50.1% (1 en 2)',
    cards: ['As', 'Kd', '9c', '5h', '2s'],
    rule: 'Ninguna combinación ligada. Gana quien tenga la carta de mayor valor.',
    mnemonic: 'El As es la carta más alta del mazo (valor 14).'
  }
];

// Exportación global para entorno navegador
if (typeof window !== 'undefined') {
  window.PokerEngine = {
    SUITS,
    RANK_VALUES,
    RANK_NAMES_SINGULAR,
    RANK_NAMES_PLURAL,
    HAND_CATEGORIES,
    createCard,
    getFreshDeck,
    evaluate5Cards,
    evaluate7Cards,
    comparePlayers,
    getEducationalExplanation,
    generateRandomDuel,
    GUIDED_LESSONS,
    EYE_TRAINING_QUESTIONS,
    PREFLOP_SCENARIOS,
    POKER_HANDS_HIERARCHY
  };
}
