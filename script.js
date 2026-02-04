// Dados do jogo
const gameData = {
    score: 0,
    completedContexts: 0,
    usedStructures: [],
    currentSeed: {
        x: "o amor",
        y: "ruído",
        z: "o ruído"
    },
    concepts: [
        "Amor", "Ruído", "Silêncio", "Protocolo", "Linguagem", 
        "Corpo", "Memória", "Proibição", "Vazio", "Eco",
        "Desobediência", "Melodia", "Limite", "Verdade", "Caos",
        "Ordem", "Tempo", "Pausa", "Batimento", "Ausência"
    ],
    contexts: [
        {
            id: 1,
            title: "Resistência",
            description: "Contexto de subversão política e desobediência criativa",
            completed: false,
            structureUsed: null,
            variation: ""
        },
        {
            id: 2,
            title: "Romântico",
            description: "Relações íntimas entre personagens",
            completed: false,
            structureUsed: null,
            variation: ""
        },
        {
            id: 3,
            title: "Científico/Filosófico",
            description: "Análise do sistema do Protocolo",
            completed: false,
            structureUsed: null,
            variation: ""
        },
        {
            id: 4,
            title: "Pessoal/Íntimo",
            description: "Diários e reflexões internas",
            completed: false,
            structureUsed: null,
            variation: ""
        },
        {
            id: 5,
            title: "Onírico/Surreal",
            description: "Cenas alucinatórias e simbólicas",
            completed: false,
            structureUsed: null,
            variation: ""
        }
    ],
    structures: [
        { id: 1, text: "Se [X] é [Y]...", available: true },
        { id: 2, text: "Quando [X] se torna [Y]...", available: true },
        { id: 3, text: "No momento em que [X] deixa de ser [Y]...", available: true },
        { id: 4, text: "Embora [X] pareça [Y]...", available: true },
        { id: 5, text: "Apesar de chamarem [X] de [Y]...", available: true }
    ],
    submissions: []
};

// Elementos DOM
const DOM = {
    scoreValue: document.querySelector('.score-value'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    seedText: document.getElementById('seedText'),
    conceptsGrid: document.getElementById('conceptsGrid'),
    contextsContainer: document.getElementById('contextsContainer'),
    submitButton: document.getElementById('submitGame'),
    resetSeedButton: document.getElementById('resetSeed'),
    generateSeedButton: document.getElementById('generateSeed'),
    viewSubmissionsButton: document.getElementById('viewSubmissions'),
    successModal: document.getElementById('successModal'),
    submissionsModal: document.getElementById('submissionsModal'),
    modalScore: document.getElementById('modalScore'),
    playAgainButton: document.getElementById('playAgain'),
    submissionsList: document.getElementById('submissionsList')
};

// Inicialização do jogo
function initGame() {
    renderConcepts();
    renderContexts();
    updateProgress();
    attachEventListeners();
    loadSubmissions();
}

// Renderizar conceitos
function renderConcepts() {
    DOM.conceptsGrid.innerHTML = '';
    gameData.concepts.forEach(concept => {
        const conceptElement = document.createElement('div');
        conceptElement.className = 'concept-item';
        conceptElement.textContent = concept;
        conceptElement.addEventListener('click', () => {
            // Alternar seleção
            conceptElement.classList.toggle('selected');
            
            // Adicionar ao clipboard (simulado)
            navigator.clipboard.writeText(concept).then(() => {
                // Feedback visual
                const originalText = conceptElement.textContent;
                conceptElement.textContent = '✓ Copiado!';
                conceptElement.style.color = 'var(--accent-color)';
                
                setTimeout(() => {
                    conceptElement.textContent = originalText;
                    conceptElement.style.color = '';
                }, 1000);
            });
        });
        DOM.conceptsGrid.appendChild(conceptElement);
    });
}

// Renderizar contextos
function renderContexts() {
    DOM.contextsContainer.innerHTML = '';
    
    gameData.contexts.forEach(context => {
        const contextCard = document.createElement('div');
        contextCard.className = `context-card ${context.completed ? 'completed' : ''}`;
        contextCard.innerHTML = `
            <div class="context-header">
                <span class="context-number">Contexto ${context.id}</span>
                <span class="context-status ${context.completed ? 'completed' : ''}">
                    ${context.completed ? '✓ Completo' : 'Pendente'}
                </span>
            </div>
            <h4 class="context-title">${context.title}</h4>
            <p class="context-description">${context.description}</p>
            ${context.structureUsed ? 
                `<p class="structure-used">Estrutura usada: ${gameData.structures.find(s => s.id === context.structureUsed).text}</p>` : 
                '<p class="structure-used">Nenhuma estrutura selecionada</p>'
            }
            <textarea class="variation-input" 
                      placeholder="Escreva sua variação aqui..." 
                      data-context="${context.id}"
                      ${context.completed ? 'disabled' : ''}>${context.variation}</textarea>
            <div class="context-actions">
                ${!context.completed ? 
                    `<button class="btn use-btn structure-select" data-context="${context.id}">
                        <i class="fas fa-magic"></i> Escolher Estrutura
                    </button>` : 
                    `<button class="btn secondary-btn edit-context" data-context="${context.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>`
                }
            </div>
        `;
        
        DOM.contextsContainer.appendChild(contextCard);
    });
    
    // Adicionar listeners aos novos elementos
    document.querySelectorAll('.structure-select').forEach(button => {
        button.addEventListener('click', function() {
            const contextId = parseInt(this.getAttribute('data-context'));
            openStructureSelector(contextId);
        });
    });
    
    document.querySelectorAll('.edit-context').forEach(button => {
        button.addEventListener('click', function() {
            const contextId = parseInt(this.getAttribute('data-context'));
            editContext(contextId);
        });
    });
    
    document.querySelectorAll('.variation-input').forEach(textarea => {
        textarea.addEventListener('input', function() {
            const contextId = parseInt(this.getAttribute('data-context'));
            gameData.contexts.find(c => c.id === contextId).variation = this.value;
            checkCompletion();
        });
    });
}

// Abrir seletor de estrutura
function openStructureSelector(contextId) {
    // Criar modal de seleção
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <span class="close-modal">&times;</span>
            <h2><i class="fas fa-project-diagram"></i> Escolha uma Estrutura</h2>
            <p>Selecione uma estrutura para o contexto ${contextId}</p>
            <div class="structures-list" style="margin-top: 1.5rem;">
                ${gameData.structures.map(structure => `
                    <div class="structure-option ${!structure.available ? 'unavailable' : ''}" 
                         data-id="${structure.id}" 
                         style="background: rgba(255,255,255,0.05); padding: 1rem; margin-bottom: 0.5rem; border-radius: 5px; cursor: pointer;">
                        <strong>${structure.text}</strong>
                        <div style="font-size: 0.8rem; color: ${structure.available ? 'var(--success-color)' : 'var(--secondary-color)'}; margin-top: 0.5rem;">
                            ${structure.available ? 'Disponível' : 'Já utilizada'}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fechar modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Selecionar estrutura
    modal.querySelectorAll('.structure-option').forEach(option => {
        if (!option.classList.contains('unavailable')) {
            option.addEventListener('click', function() {
                const structureId = parseInt(this.getAttribute('data-id'));
                selectStructureForContext(contextId, structureId);
                document.body.removeChild(modal);
            });
        }
    });
}

// Selecionar estrutura para um contexto
function selectStructureForContext(contextId, structureId) {
    const context = gameData.contexts.find(c => c.id === contextId);
    const structure = gameData.structures.find(s => s.id === structureId);
    
    // Remover disponibilidade da estrutura
    structure.available = false;
    gameData.usedStructures.push(structureId);
    
    // Atualizar contexto
    context.structureUsed = structureId;
    
    // Atualizar interface
    updateStructuresDisplay();
    renderContexts();
    checkCompletion();
}

// Editar contexto
function editContext(contextId) {
    const context = gameData.contexts.find(c => c.id === contextId);
    context.completed = false;
    
    // Liberar estrutura
    if (context.structureUsed) {
        const structure = gameData.structures.find(s => s.id === context.structureUsed);
        structure.available = true;
        
        // Remover da lista de usadas
        const index = gameData.usedStructures.indexOf(context.structureUsed);
        if (index > -1) {
            gameData.usedStructures.splice(index, 1);
        }
    }
    
    context.structureUsed = null;
    updateProgress();
    renderContexts();
    updateStructuresDisplay();
}

// Atualizar display das estruturas
function updateStructuresDisplay() {
    document.querySelectorAll('.structure-card').forEach(card => {
        const structureId = parseInt(card.getAttribute('data-id'));
        const structure = gameData.structures.find(s => s.id === structureId);
        const statusElement = card.querySelector('.structure-status');
        
        if (structure.available) {
            statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Disponível';
            statusElement.style.color = 'var(--success-color)';
            card.querySelector('.use-btn').disabled = false;
        } else {
            statusElement.innerHTML = '<i class="fas fa-times-circle"></i> Utilizada';
            statusElement.style.color = 'var(--secondary-color)';
            card.querySelector('.use-btn').disabled = true;
        }
    });
}

// Verificar conclusão
function checkCompletion() {
    let completed = 0;
    
    gameData.contexts.forEach(context => {
        if (context.structureUsed && context.variation.trim().length > 10) {
            if (!context.completed) {
                context.completed = true;
                completed++;
            }
        } else {
            context.completed = false;
        }
    });
    
    gameData.completedContexts = completed;
    updateProgress();
    
    // Habilitar/desabilitar botão de envio
    DOM.submitButton.disabled = completed !== 5;
}

// Atualizar progresso
function updateProgress() {
    const progress = (gameData.completedContexts / 5) * 100;
    
    // Atualizar barra de progresso
    DOM.progressFill.style.width = `${progress}%`;
    DOM.progressText.textContent = `${gameData.completedContexts}/5`;
    
    // Atualizar pontuação
    gameData.score = gameData.completedContexts * 20;
    DOM.scoreValue.textContent = gameData.score;
}

// Enviar jogo
function submitGame() {
    // Calcular pontuação final
    const baseScore = 50; // Pontuação base
    const structureBonus = gameData.usedStructures.length === 5 ? 20 : 0;
    const variationBonus = gameData.contexts.every(c => c.variation.length > 50) ? 15 : 0;
    
    const totalScore = baseScore + structureBonus + variationBonus;
    gameData.score = totalScore;
    DOM.modalScore.textContent = totalScore;
    
    // Criar submissão
    const submission = {
        id: Date.now(),
        seed: `${gameData.currentSeed.x}, ${gameData.currentSeed.y}, ${gameData.currentSeed.z}`,
        variations: gameData.contexts.map(c => ({
            context: c.title,
            structure: gameData.structures.find(s => s.id === c.structureUsed)?.text,
            text: c.variation
        })),
        score: totalScore,
        timestamp: new Date().toLocaleString()
    };
    
    // Adicionar às submissões
    gameData.submissions.unshift(submission);
    saveSubmissions();
    
    // Mostrar modal de sucesso
    DOM.successModal.style.display = 'flex';
}

// Gerar nova semente aleatória
function generateNewSeed() {
    const xOptions = ["o amor", "o silêncio", "o protocolo", "a memória", "o corpo", "a verdade"];
    const yOptions = ["ruído", "linguagem", "proibição", "vazio", "eco", "caos", "ordem"];
    const zOptions = ["o ruído", "a linguagem", "a proibição", "o vazio", "o eco", "o caos"];
    
    gameData.currentSeed = {
        x: xOptions[Math.floor(Math.random() * xOptions.length)],
        y: yOptions[Math.floor(Math.random() * yOptions.length)],
        z: zOptions[Math.floor(Math.random() * zOptions.length)]
    };
    
    updateSeedDisplay();
    resetGame();
}

// Atualizar display da semente
function updateSeedDisplay() {
    const variables = DOM.seedText.querySelectorAll('.variable');
    variables[0].textContent = gameData.currentSeed.x;
    variables[1].textContent = gameData.currentSeed.y;
    variables[2].textContent = gameData.currentSeed.z;
}

// Resetar jogo
function resetGame() {
    // Resetar dados
    gameData.score = 0;
    gameData.completedContexts = 0;
    gameData.usedStructures = [];
    
    // Resetar estruturas
    gameData.structures.forEach(s => s.available = true);
    
    // Resetar contextos
    gameData.contexts.forEach(c => {
        c.completed = false;
        c.structureUsed = null;
        c.variation = "";
    });
    
    // Atualizar interface
    updateProgress();
    renderContexts();
    updateStructuresDisplay();
    DOM.submitButton.disabled = true;
}

// Carregar submissões
function loadSubmissions() {
    const saved = localStorage.getItem('protocoloErosSubmissions');
    if (saved) {
        gameData.submissions = JSON.parse(saved);
    }
}

// Salvar submissões
function saveSubmissions() {
    localStorage.setItem('protocoloErosSubmissions', JSON.stringify(gameData.submissions));
}

// Mostrar submissões
function showSubmissions() {
    DOM.submissionsList.innerHTML = '';
    
    if (gameData.submissions.length === 0) {
        DOM.submissionsList.innerHTML = '<p style="text-align: center; color: var(--gray-color);">Nenhuma contribuição ainda.</p>';
    } else {
        gameData.submissions.slice(0, 10).forEach(sub => {
            const submissionElement = document.createElement('div');
            submissionElement.className = 'submission-item';
            submissionElement.innerHTML = `
                <div class="submission-seed">Semente: ${sub.seed}</div>
                <div class="submission-author">Enviado em: ${sub.timestamp} | Pontuação: ${sub.score}</div>
                <div class="submission-variations">
                    <strong>Variações:</strong>
                    <ul style="margin-top: 0.5rem; padding-left: 1rem;">
                        ${sub.variations.map(v => `<li><em>${v.context}</em>: ${v.text.substring(0, 80)}...</li>`).join('')}
                    </ul>
                </div>
            `;
            DOM.submissionsList.appendChild(submissionElement);
        });
    }
    
    DOM.submissionsModal.style.display = 'flex';
}

// Anexar event listeners
function attachEventListeners() {
    // Botão de enviar
    DOM.submitButton.addEventListener('click', submitGame);
    
    // Botão de resetar semente
    DOM.resetSeedButton.addEventListener('click', () => {
        gameData.currentSeed = { x: "o amor", y: "ruído", z: "o ruído" };
        updateSeedDisplay();
        resetGame();
    });
    
    // Botão de gerar nova semente
    DOM.generateSeedButton.addEventListener('click', generateNewSeed);
    
    // Botão de ver submissões
    DOM.viewSubmissionsButton.addEventListener('click', showSubmissions);
    
    // Botão de jogar novamente
    DOM.playAgainButton.addEventListener('click', () => {
        DOM.successModal.style.display = 'none';
        resetGame();
    });
    
    // Botões de usar estrutura
    document.querySelectorAll('.use-btn').forEach(button => {
        button.addEventListener('click', function() {
            const structureId = parseInt(this.getAttribute('data-id'));
            // Encontrar primeiro contexto não completo
            const availableContext = gameData.contexts.find(c => !c.structureUsed);
            if (availableContext) {
                selectStructureForContext(availableContext.id, structureId);
            }
        });
    });
    
    // Fechar modais
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Permitir edição das variáveis da semente
    DOM.seedText.querySelectorAll('.variable').forEach(variable => {
        variable.addEventListener('blur', function() {
            const varType = this.getAttribute('data-var');
            if (varType === 'x1') gameData.currentSeed.x = this.textContent;
            if (varType === 'y1') gameData.currentSeed.y = this.textContent;
            if (varType === 'z1') gameData.currentSeed.z = this.textContent;
        });
    });
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initGame);
