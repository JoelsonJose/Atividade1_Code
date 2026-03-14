let countries = [];
let correctCountry;

async function loadCountries() {
    try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,flags,translations");
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
    } else {
        result.style.color = "#e74c3c";
        result.innerText = "Errado! Era " + correctCountry;
    }
}

loadCountries();