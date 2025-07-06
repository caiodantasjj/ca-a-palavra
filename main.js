"use strict";
let dificuldadeSelecionada = null;
let palavrasSelecionadas = [];
let palavrasEncontradas = [];
let tabuleiro = [];
let tamanho = 10;
let tempoRestante = 0;
let intervalo;
const todasPalavras = [
    'IFPE', 'REDE', 'HTML', 'CSS', 'CAMPUS', 'ALUNO', 'TI',
    'CODIGO', 'PROVA', 'TEXTO', 'LIVRO', 'TABELA', 'EMAIL', 'LINUX', 'GITHUB', 'IPI', 'TSI',
];
const palavrasCoringa = ['COISA', 'NADA', 'XABLAU', 'BLAH'];
function mostrarDificuldades() {
    const opcoes = document.getElementById("opcoes-dificuldade");
    opcoes === null || opcoes === void 0 ? void 0 : opcoes.classList.toggle("hidden");
}
function selecionarDificuldade(nivel) {
    dificuldadeSelecionada = nivel;
    const texto = document.getElementById("dificuldade-escolhida");
    const botaoJogar = document.getElementById("botao-jogar");
    if (texto)
        texto.innerText = `Dificuldade: ${nivel.toUpperCase()}`;
    if (botaoJogar)
        botaoJogar.disabled = false;
}
function iniciarJogo() {
    var _a, _b;
    if (!dificuldadeSelecionada)
        return;
    palavrasEncontradas = [];
    (_a = document.querySelector('.tela-inicial')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
    (_b = document.querySelector('.tela-jogo')) === null || _b === void 0 ? void 0 : _b.classList.remove('hidden');
    const nivelJogo = document.getElementById("nivel-jogo");
    if (nivelJogo)
        nivelJogo.innerText = dificuldadeSelecionada.toUpperCase();
    palavrasSelecionadas = [];
    gerarTabuleiroComPalavras();
    renderizarTabuleiro();
    ativarSelecaoPorArrasto();
    iniciarCronometro();
    esconderBotaoNovoJogo();
}
function voltarInicio() {
    var _a, _b;
    clearInterval(intervalo);
    (_a = document.querySelector('.tela-inicial')) === null || _a === void 0 ? void 0 : _a.classList.remove('hidden');
    (_b = document.querySelector('.tela-jogo')) === null || _b === void 0 ? void 0 : _b.classList.add('hidden');
    dificuldadeSelecionada = null;
    const texto = document.getElementById("dificuldade-escolhida");
    const botaoJogar = document.getElementById("botao-jogar");
    if (texto)
        texto.innerText = '';
    if (botaoJogar)
        botaoJogar.disabled = true;
    const celulas = document.querySelectorAll(".cell");
    celulas.forEach(c => {
        c.classList.remove("selecionado");
        c.classList.remove("encontrada");
    });
    esconderBotaoNovoJogo();
}
function novoJogo() {
    palavrasEncontradas = [];
    gerarTabuleiroComPalavras();
    renderizarTabuleiro();
    ativarSelecaoPorArrasto();
    iniciarCronometro();
    esconderBotaoNovoJogo();
}
function gerarTabuleiroComPalavras() {
    let qtd = 5;
    if (dificuldadeSelecionada === 'médio')
        qtd = 10;
    if (dificuldadeSelecionada === 'difícil')
        qtd = 15;
    palavrasSelecionadas = shuffle([...todasPalavras]).slice(0, qtd);
    if (dificuldadeSelecionada === 'difícil') {
        palavrasSelecionadas.push(...shuffle(palavrasCoringa).slice(0, 2));
    }
    tamanho = dificuldadeSelecionada === 'fácil' ? 10 : dificuldadeSelecionada === 'médio' ? 12 : 14;
    tabuleiro = Array.from({ length: tamanho }, () => Array(tamanho).fill(''));
    for (const palavra of palavrasSelecionadas) {
        posicionarPalavra(palavra.toUpperCase());
    }
    preencherLetrasAleatorias();
}
function posicionarPalavra(palavra) {
    const direcoes = [[0, 1], [1, 0], [1, 1], [-1, 1]];
    let colocada = false;
    palavra = palavra.toUpperCase();
    while (!colocada) {
        const [dx, dy] = direcoes[Math.floor(Math.random() * direcoes.length)];
        const x = Math.floor(Math.random() * tamanho);
        const y = Math.floor(Math.random() * tamanho);
        const fimX = x + dx * (palavra.length - 1);
        const fimY = y + dy * (palavra.length - 1);
        if (fimX < 0 || fimX >= tamanho || fimY < 0 || fimY >= tamanho)
            continue;
        let podeColocar = true;
        for (let i = 0; i < palavra.length; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            const letraAtual = tabuleiro[nx][ny];
            if (letraAtual !== '' && letraAtual !== palavra[i]) {
                podeColocar = false;
                break;
            }
        }
        if (podeColocar) {
            for (let i = 0; i < palavra.length; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                tabuleiro[nx][ny] = palavra[i];
            }
            colocada = true;
        }
    }
}
function preencherLetrasAleatorias() {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < tamanho; i++) {
        for (let j = 0; j < tamanho; j++) {
            if (tabuleiro[i][j] === '') {
                tabuleiro[i][j] = letras.charAt(Math.floor(Math.random() * letras.length));
            }
        }
    }
}
function renderizarTabuleiro() {
    const container = document.getElementById("tabuleiro");
    if (!container)
        return;
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${tamanho}, 32px)`;
    for (let i = 0; i < tamanho; i++) {
        for (let j = 0; j < tamanho; j++) {
            const celula = document.createElement("div");
            celula.classList.add("cell");
            celula.innerText = tabuleiro[i][j];
            celula.dataset.x = i.toString();
            celula.dataset.y = j.toString();
            container.appendChild(celula);
        }
    }
    const lista = document.getElementById("lista-palavras");
    if (!lista)
        return;
    lista.innerHTML = '';
    for (const p of palavrasSelecionadas) {
        const item = document.createElement("li");
        item.innerText = p;
        lista.appendChild(item);
    }
}
function ativarSelecaoPorArrasto() {
    let selecionando = false;
    let selecionadas = [];
    let direcao = null;
    const tabuleiroEl = document.getElementById("tabuleiro");
    function calcularDirecao(ultima, atual) {
        const x1 = parseInt(ultima.dataset.x);
        const y1 = parseInt(ultima.dataset.y);
        const x2 = parseInt(atual.dataset.x);
        const y2 = parseInt(atual.dataset.y);
        if (x1 === x2)
            return "horizontal";
        if (y1 === y2)
            return "vertical";
        if (Math.abs(x1 - x2) === Math.abs(y1 - y2))
            return "diagonal";
        return null;
    }
    function podeSelecionar(ultima, atual) {
        if (selecionadas.includes(atual))
            return false;
        if (!direcao)
            return true;
        const dir = calcularDirecao(ultima, atual);
        return dir === direcao;
    }
    tabuleiroEl.onmousedown = (e) => {
        if (e.target.classList.contains("cell")) {
            selecionando = true;
            selecionadas = [];
            direcao = null;
            document.querySelectorAll(".cell.selecionado").forEach(c => c.classList.remove("selecionado"));
            const celula = e.target;
            selecionadas.push(celula);
            celula.classList.add("selecionado");
        }
    };
    tabuleiroEl.onmouseup = () => {
        if (!selecionando)
            return;
        selecionando = false;
        let palavraSelecionada = '';
        for (const cel of selecionadas) {
            palavraSelecionada += cel.innerText;
        }
        let achouPalavra = false;
        for (const palavra of palavrasSelecionadas) {
            if (palavra === palavraSelecionada ||
                palavra === palavraSelecionada.split('').reverse().join('')) {
                if (!palavrasEncontradas.includes(palavra)) {
                    palavrasEncontradas.push(palavra);
                    marcarPalavraEncontrada(selecionadas);
                    atualizarLista(palavra);
                    checarFimDeJogo();
                }
                achouPalavra = true;
                break;
            }
        }
        if (!achouPalavra) {
            setTimeout(() => limparSelecao(), 300);
        }
        else {
            limparSelecao();
        }
    };
    tabuleiroEl.onmousemove = (e) => {
        if (!selecionando)
            return;
        const alvo = e.target;
        if (!alvo.classList.contains("cell"))
            return;
        const ultima = selecionadas[selecionadas.length - 1];
        if (!ultima)
            return;
        if (podeSelecionar(ultima, alvo)) {
            selecionadas.push(alvo);
            if (!direcao) {
                direcao = calcularDirecao(ultima, alvo);
            }
            alvo.classList.add("selecionado");
        }
    };
    tabuleiroEl.onmouseleave = () => {
        if (selecionando) {
            limparSelecao();
            selecionando = false;
        }
    };
    function limparSelecao() {
        selecionadas.forEach(cel => cel.classList.remove("selecionado"));
        selecionadas = [];
        direcao = null;
    }
}
function marcarPalavraEncontrada(celulas) {
    celulas.forEach(cel => {
        cel.classList.remove("selecionado");
        cel.classList.add("encontrada");
    });
}
function atualizarLista(palavra) {
    const itens = document.querySelectorAll('#lista-palavras li');
    itens.forEach(li => {
        if (li.textContent === palavra) {
            li.classList.add('encontrada');
        }
    });
}
function checarFimDeJogo() {
    if (palavrasEncontradas.length === palavrasSelecionadas.length) {
        clearInterval(intervalo);
        mostrarBotaoNovoJogo();
        alert('Parabéns! Você encontrou todas as palavras!');
    }
}
function iniciarCronometro() {
    tempoRestante = dificuldadeSelecionada === 'fácil' ? 180 : // 3 minutos
        dificuldadeSelecionada === 'médio' ? 300 : // 5 minutos
            420; // Difícil: 7 minutos
    atualizarCronometro();
    if (intervalo)
        clearInterval(intervalo);
    intervalo = setInterval(() => {
        tempoRestante--;
        atualizarCronometro();
        if (tempoRestante <= 0) {
            clearInterval(intervalo);
            alert('Tempo esgotado! Tente novamente.');
            mostrarBotaoNovoJogo();
        }
    }, 1000);
}
function atualizarCronometro() {
    const cronometroEl = document.getElementById("cronometro");
    if (!cronometroEl)
        return;
    const min = Math.floor(tempoRestante / 60).toString().padStart(2, '0');
    const seg = (tempoRestante % 60).toString().padStart(2, '0');
    cronometroEl.innerText = `Tempo restante: ${min}:${seg}`;
}
function mostrarBotaoNovoJogo() {
    const botao = document.getElementById("botao-novo-jogo");
    if (botao) {
        botao.style.display = "inline-block";
    }
}
function esconderBotaoNovoJogo() {
    const botao = document.getElementById("botao-novo-jogo");
    if (botao)
        botao.style.display = "none";
}
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}
