const API_URL = 'https://atividade1-code.onrender.com';
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let token = localStorage.getItem('token');
let activeCharacter = null;
let userCharacters = [];

let countries = [];
let correctCountry;

async function loadCountries() {
    try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,flags,translations,region,capital");
        countries = await response.json();
        newRound();
    } catch (error) {
        console.error("Erro ao carregar países:", error);
    }
}

function getRandomCountry() {
    return countries[Math.floor(Math.random() * countries.length)];
}

function newRound() {
    const country = getRandomCountry();
    correctCountry = country.translations?.por?.common || country.name.common;

    document.getElementById("flag").src = country.flags.png;
    document.getElementById("result").innerText = "";
    
    generateOptions();
    showCharacterHint(country);
}

function showCharacterHint(country) {
    const hintBox = document.getElementById("hint-box");
    if (!activeCharacter) {
        hintBox.innerText = "Selecione um personagem para ter dicas!";
        return;
    }

    if (activeCharacter.avatarStyle === 'estudioso') {
        const primeiraLetra = correctCountry.charAt(0).toUpperCase();
        hintBox.innerText = `Dica de Estudioso: Começa com a letra '${primeiraLetra}'`;
    } else if (activeCharacter.avatarStyle === 'viajante') {
        hintBox.innerText = `Dica de Viajante: Fica no continente '${country.region}'`;
    } else if (activeCharacter.avatarStyle === 'explorador') {
        const capital = country.capital && country.capital.length > 0 ? country.capital[0] : 'Desconhecida';
        hintBox.innerText = `Dica de Explorador: A capital é '${capital}'`;
    } else {
        hintBox.innerText = "";
    }
}

function generateOptions() {
    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    let options = [correctCountry];

    while (options.length < 4) {
        let randomC = getRandomCountry();
        let name = randomC.translations?.por?.common || randomC.name.common;

        if (!options.includes(name)) {
            options.push(name);
        }
    }

    // Embaralhar opções
    options.sort(() => Math.random() - 0.5);

    options.forEach(name => {
        let btn = document.createElement("button");
        btn.innerText = name;
        btn.onclick = () => checkAnswer(name);
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(answer) {
    const result = document.getElementById("result");
    if (answer === correctCountry) {
        result.style.color = "#27ae60";
        result.innerText = "Acertou!";
        if (activeCharacter) {
            updateCharacterScore();
        } else {
            alert("⚠️ Você acertou, mas está jogando sem um personagem selecionado! Os pontos não foram salvos.");
        }
    } else {
        result.style.color = "#e74c3c";
        result.innerText = "Errado! Era " + correctCountry;
    }
}

function getMyCountry() {
    const locationText = document.getElementById("user-location");

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
                const data = await response.json();
                
                
                const countryName = data.address.country;
                locationText.innerText = `Você está jogando de: ${countryName}`;
            } catch (error) {
                locationText.innerText = "Não foi possível detectar seu país.";
            }
        }, (error) => {
            console.error(error);
            locationText.innerText = "Acesso à localização negado.";
        });
    } else {
        locationText.innerText = "Geolocalização não suportada.";
    }
}


loadCountries();
getMyCountry();
checkAuthStatus();

// ======================= AUTH LOGIC =======================
let isLoginMode = true;

function checkAuthStatus() {
    if (currentUser && token) {
        document.getElementById('auth-modal').style.display = 'none';
        document.getElementById('user-panel').style.display = 'flex';
        updateUserInfoUI();
        if(!activeCharacter) {
            toggleCharacterPanel(); // Force open character panel on login to select character
            alert("⚠️ Selecione um Personagem na lista abaixo para você jogar!");
        }
    } else {
        document.getElementById('auth-modal').style.display = 'flex';
        document.getElementById('user-panel').style.display = 'none';
        activeCharacter = null;
    }
}

function updateUserInfoUI() {
    if (currentUser) {
        if(activeCharacter) {
            document.getElementById('user-info').innerText = `Dono: ${currentUser.username} | ${activeCharacter.name} - Nível: ${activeCharacter.level} | Pontos: ${activeCharacter.score}`;
        } else {
            document.getElementById('user-info').innerText = `Dono: ${currentUser.username} | Personagem Ativo: Nenhum!`;
        }
    }
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Entrar' : 'Registrar';
    document.getElementById('auth-btn').innerText = isLoginMode ? 'Entrar' : 'Registrar';
    document.getElementById('auth-toggle').innerText = isLoginMode ? 'Não tem conta? Registre-se' : 'Já tem conta? Entre';
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';

    try {
        const response = await fetch(API_URL + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            token = data.token;
            currentUser = data.user;
            checkAuthStatus();
        } else {
            alert("Erro: " + data.message);
        }
    } catch (err) {
        alert("Erro de conexão com o servidor!");
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    token = null;
    currentUser = null;
    activeCharacter = null;
    checkAuthStatus();
}

async function updateCharacterScore() {
    if(!activeCharacter) return;

    activeCharacter.score += 10;
    if (activeCharacter.score >= activeCharacter.level * 50) {
        activeCharacter.level += 1;
        alert(`⭐ Parabéns! Seu personagem ${activeCharacter.name} subiu para o nível ${activeCharacter.level}`);
    }
    updateUserInfoUI();

    try {
        await fetch(API_URL + `/characters/${activeCharacter._id}/score`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ score: activeCharacter.score, level: activeCharacter.level })
        });
    } catch (err) {
        console.error("Erro ao salvar pontuação");
    }
}

// ======================= CRUD PERSONAGENS =======================
function toggleCharacterPanel() {
    const panel = document.getElementById('character-modal');
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'flex';
        loadCharacters();
    } else {
        panel.style.display = 'none';
        clearCharForm();
    }
}

async function loadCharacters() {
    try {
        const response = await fetch(API_URL + '/characters', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const characters = await response.json();
        userCharacters = characters;
        const list = document.getElementById('character-list');
        list.innerHTML = '';
        
        characters.forEach(char => {
            const card = document.createElement('div');
            card.className = 'char-card';
            card.innerHTML = `
                <div style="flex-grow:1;">
                    <strong>${char.name}</strong> - ${char.avatarStyle} 
                    <span style="display:inline-block; width:15px; height:15px; background:${char.favoriteColor}; border-radius:50%; vertical-align:middle;"></span>
                    <br><small>Nível: ${char.level} | Pontos: ${char.score}</small>
                </div>
                <div class="char-actions" style="display:flex; gap:5px; flex-wrap:wrap; justify-content: flex-end;">
                    <button style="background:#27ae60;" onclick="selectCharacter('${char._id}')">Jogar</button>
                    <button style="background:#f39c12;" onclick="editCharacter('${char._id}', '${char.name}', '${char.avatarStyle}', '${char.favoriteColor}')">Editar</button>
                    <button style="background:#e74c3c;" onclick="deleteCharacter('${char._id}')">X</button>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar personagens");
    }
}

function selectCharacter(id) {
    const char = userCharacters.find(c => c._id === id);
    if(char) {
        activeCharacter = char;
        updateUserInfoUI();
        toggleCharacterPanel(); // cloe modal
        
        // update hint immediately if a country is loaded
        if (correctCountry) {
            showCharacterHint(countries.find(c => (c.translations?.por?.common || c.name.common) === correctCountry) || countries[0]);
        }
        
        alert(`O personagem ${char.name} foi selecionado! Suas habilidades já estão ativas.`);
    }
}

async function saveCharacter() {
    const id = document.getElementById('char-id').value;
    const name = document.getElementById('char-name').value;
    const style = document.getElementById('char-style').value;
    const color = document.getElementById('char-color').value;

    if (!name) return alert("Por favor, dê um nome ao personagem!");

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/characters/${id}` : `${API_URL}/characters`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, avatarStyle: style, favoriteColor: color })
        });
        if (res.ok) {
            clearCharForm();
            loadCharacters();
        } else {
            const data = await res.json();
            alert("Erro: " + data.message);
        }
    } catch (err) {
        alert("Erro ao salvar personagem");
    }
}

function editCharacter(id, name, style, color) {
    document.getElementById('char-id').value = id;
    document.getElementById('char-name').value = name;
    document.getElementById('char-style').value = style;
    document.getElementById('char-color').value = color;
}

function clearCharForm() {
    document.getElementById('char-id').value = '';
    document.getElementById('char-name').value = '';
    document.getElementById('char-style').value = 'explorador';
    document.getElementById('char-color').value = '#4facfe';
}

async function deleteCharacter(id) {
    if (!confirm("Tem certeza que deseja deletar este personagem?")) return;
    try {
        await fetch(`${API_URL}/characters/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadCharacters();
    } catch (err) {
        alert("Erro ao excluir");
    }
}