// Função para buscar coordenadas da cidade
async function buscarCoordenadas(cidade) {
    if (!cidade || cidade.trim() === "") {
        throw new Error("Nome da cidade não pode estar vazio");
    }

    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`
    );

    if (!response.ok) {
        throw new Error("Falha ao buscar coordenadas da cidade.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("Cidade não encontrada");
    }

    return data.results[0];
}

// Função para buscar dados do clima
async function buscarClima(latitude, longitude) {
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode`
    );

    if (!response.ok) {
        throw new Error("Falha ao buscar dados do clima.");
    }

    return await response.json();
}

// Função para obter descrição do clima
function obterDescricaoClima(codigoClima) {
    const descricoesClima = {
        0: "Céu limpo ☀️",
        1: "Parcialmente limpo 🌤️",
        2: "Parcialmente nublado ⛅",
        3: "Nublado ☁️",
        45: "Nevoeiro 🌫️",
        48: "Nevoeiro com gelo 🌫️",
        51: "Garoa leve 🌦️",
        53: "Garoa moderada 🌦️",
        55: "Garoa intensa 🌧️",
        61: "Chuva leve 🌦️",
        63: "Chuva moderada 🌧️",
        65: "Chuva forte ⛈️",
        71: "Neve leve ❄️",
        73: "Neve moderada ❄️",
        75: "Neve forte 🌨️",
        95: "Tempestade 🌩️",
        96: "Tempestade com granizo 🌩️",
        99: "Tempestade forte com granizo ⛈️"
    };

    return descricoesClima[codigoClima] || "Clima desconhecido";
}

// Função principal que busca o clima completo
async function buscarPrevisaoCompleta(cidade) {
    // Buscar coordenadas
    const coordenadas = await buscarCoordenadas(cidade);
    const { latitude, longitude, name, country, admin1 } = coordenadas;

    // Buscar clima
    const climaData = await buscarClima(latitude, longitude);
    const temperatura = climaData.current.temperature_2m;
    const codigoClima = climaData.current.weathercode;
    const descricao = obterDescricaoClima(codigoClima);

    // Obter data e hora
    const agora = new Date();
    const diaSemana = agora.toLocaleDateString("pt-BR", { weekday: "long" });
    const dataCompleta = agora.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
    const horaFormatada = agora.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });

    return {
        temperatura: Math.round(temperatura),
        descricao,
        cidade: name,
        estado: admin1 || "",
        pais: country,
        diaSemana,
        dataCompleta,
        hora: horaFormatada
    };
}

// Evento do formulário (mantém a funcionalidade do site)
if (typeof document !== 'undefined') {
    document.getElementById("form-clima").addEventListener("submit", async function (event) {
        event.preventDefault();

        const cidade = document.getElementById("cidade").value.trim();
        const resultado = document.getElementById("resultado");

        resultado.innerHTML = "<p>Carregando...</p>";

        try {
            const dados = await buscarPrevisaoCompleta(cidade);

            // Mudar cor do fundo conforme o horário
            const hora = new Date().getHours();
            const body = document.body;
            if (hora >= 6 && hora < 18) {
                body.classList.remove("noite");
                body.classList.add("dia");
            } else {
                body.classList.remove("dia");
                body.classList.add("noite");
            }

            // Exibir resultado
            resultado.innerHTML = `
                <div class="resultado-clima">
                    <h2>${dados.temperatura}°</h2>
                    <p>${dados.descricao}</p>
                    <p><span class="local">${dados.cidade}/${dados.estado}, ${dados.pais}</span></p>
                    <br>
                    <p>${dados.diaSemana}</p>
                    <p>${dados.dataCompleta}</p>
                    <p>hora ${dados.hora}</p>
                </div>
            `;

        } catch (error) {
            console.error("Erro ao buscar dados:", error);

            resultado.innerHTML = `
                <div class="erro">
                    <p>Verifique sua conexão e tente novamente!</p>
                </div>`;
        }
    });
}

// Exportar funções para testes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        buscarCoordenadas,
        buscarClima,
        obterDescricaoClima,
        buscarPrevisaoCompleta
    };
}