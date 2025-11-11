/**
 * Manipula o envio do formulário de previsão do tempo.
 * 
 * - Evita o recarregamento da página.
 * - Obtém o valor da cidade digitada pelo usuário.
 * - Busca coordenadas da cidade usando a API de geocodificação.
 * - Busca dados do clima atual usando a API Open-Meteo.
 * - Atualiza a interface com o resultado ou mensagem de erro.
 * - Ajusta o fundo da página conforme horário (dia/noite).
 * 
 * @param {Event} event - O evento de submit do formulário.
 * @returns {Promise<void>} Não retorna valor, apenas atualiza a interface.
 */
document.getElementById("form-clima").addEventListener("submit", async function (event) {
    event.preventDefault(); // impede o recarregamento da página

    const cidade = document.getElementById("cidade").value.trim();
    const resultado = document.getElementById("resultado");

    resultado.innerHTML = "<p>Carregando...</p>";

    try {
        // Buscar coordenadas da cidade
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error("Falha ao buscar coordenadas da cidade.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            resultado.classList.add("erro");
            resultado.innerHTML = `<p>Ops! Cidade não localizada!</p> <p>Tente novamente.</p>`;
            return;
        }




        const { latitude, longitude, name, country } = geoData.results[0];

        // Buscar temperatura e condição atual
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode`
        );

        if (!weatherResponse.ok) {
            throw new Error("Falha ao buscar dados do clima.");
        }

        const weatherData = await weatherResponse.json();

        const temperatura = weatherData.current.temperature_2m;
        const codigoClima = weatherData.current.weathercode;

        // Mapeamento dos códigos de clima
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

        const descricao = descricoesClima[codigoClima] || "Clima desconhecido";

        // 🔹 Obter estado (caso exista)
        const stateCode = geoData.results[0].admin1 || "";

        // 🔹 Obter data e hora local formatadas
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

        // 🔹 Muda cor do fundo conforme o horário
        const hora = agora.getHours();
        const body = document.body;
        if (hora >= 6 && hora < 18) {
            body.classList.remove("noite");
            body.classList.add("dia");
        } else {
            body.classList.remove("dia");
            body.classList.add("noite");
        }

        // 🔹 Exibir resultado (agora com todas as quebras de linha)
        resultado.innerHTML = `
            <div class="resultado-clima">
                <h2>${Math.round(temperatura)}°</h2>
                <p>${descricao}</p>
                <p><span class="local">${name}/${stateCode}, ${country}</span></p>
                <br>
                <p>${diaSemana}</p>
                <p>${dataCompleta}</p>
                <p>hora ${horaFormatada}</p>
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
