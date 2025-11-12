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
        const stateCode = geoData.results[0].admin1 || "";

        // Buscar previsão para 5 dias
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error("Falha ao buscar dados do clima.");
        }

        const weatherData = await weatherResponse.json();

        const dias = weatherData.daily.time; // array de datas
        const tempMax = weatherData.daily.temperature_2m_max;
        const tempMin = weatherData.daily.temperature_2m_min;
        const codigosClima = weatherData.daily.weathercode;

        // Mapeamento de código de clima para descrição e emoji
        const descricoesClima = {
            0: { texto: "Céu limpo", icone: "☀️" },
            1: { texto: "Parcialmente limpo", icone: "🌤️" },
            2: { texto: "Parcialmente nublado", icone: "⛅" },
            3: { texto: "Nublado", icone: "☁️" },
            45: { texto: "Nevoeiro", icone: "🌫️" },
            48: { texto: "Nevoeiro com gelo", icone: "🌫️" },
            51: { texto: "Garoa leve", icone: "🌦️" },
            53: { texto: "Garoa moderada", icone: "🌦️" },
            55: { texto: "Garoa intensa", icone: "🌧️" },
            61: { texto: "Chuva leve", icone: "🌦️" },
            63: { texto: "Chuva moderada", icone: "🌧️" },
            65: { texto: "Chuva forte", icone: "⛈️" },
            71: { texto: "Neve leve", icone: "❄️" },
            73: { texto: "Neve moderada", icone: "❄️" },
            75: { texto: "Neve forte", icone: "🌨️" },
            95: { texto: "Tempestade", icone: "🌩️" },
            96: { texto: "Tempestade com granizo", icone: "🌩️" },
            99: { texto: "Tempestade forte com granizo", icone: "⛈️" }
        };

        // 🔹 Obter hora atual para definir fundo
        const agora = new Date();
        const hora = agora.getHours();
        const body = document.body;
        if (hora >= 6 && hora < 18) {
            body.classList.remove("noite");
            body.classList.add("dia");
        } else {
            body.classList.remove("dia");
            body.classList.add("noite");
        }

        // 🔹 Primeiro dia (hoje) mantém layout original
        const hoje = new Date(dias[0]);
        const diaSemanaHoje = hoje.toLocaleDateString("pt-BR", { weekday: "long" });
        const dataCompletaHoje = hoje.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

        const climaHoje = descricoesClima[codigosClima[0]] || { texto: "Clima desconhecido", icone: "" };

        let previsaoHTML = `
            <div class="resultado-clima">
                <h2>${Math.round(tempMax[0])}°</h2>
                <p>${climaHoje.texto} ${climaHoje.icone}</p>
                <p><span class="local">${name}/${stateCode}, ${country}</span></p>
                <br>
                <p>${diaSemanaHoje}</p>
                <p>${dataCompletaHoje}</p>
            </div>
        `;

        // 🔹 Próximos 4 dias
        previsaoHTML += `<div class="previsao-dias">`;

        for (let i = 1; i < dias.length; i++) {
            const dataObj = new Date(dias[i]);
            const diaSemana = dataObj.toLocaleDateString("pt-BR", { weekday: "long" });
            const dataFormatada = dataObj.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });

            const clima = descricoesClima[codigosClima[i]] || { texto: "Clima desconhecido", icone: "" };

            previsaoHTML += `
                <div class="dia">
                    <div class="lado-esquerdo">
                        <p><strong>${diaSemana}</strong></p>
                        <p>${dataFormatada}</p>
                    </div>
                    <div class="centro">
                        <p>${clima.icone}</p>
                        <p>${clima.texto}</p>
                    </div>
                    <div class="lado-direito">
                        <p>Max: ${Math.round(tempMax[i])}°</p>
                        <p>Min: ${Math.round(tempMin[i])}°</p>
                    </div>
                </div>
            `;
        }

        previsaoHTML += `</div>`; // fecha previsao-dias

        resultado.innerHTML = previsaoHTML;

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        resultado.innerHTML = `
            <div class="erro">
                <p>Verifique sua conexão e tente novamente!</p>
            </div>`;
    }
});
