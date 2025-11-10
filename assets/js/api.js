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
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            resultado.innerHTML = `
                <div class="erro">
                    <p>Ops! Cidade não localizada. Tente vovamente.</p>
                </div>`;
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // Buscar temperatura atual
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
        );
        const weatherData = await weatherResponse.json();

        const temperatura = weatherData.current.temperature_2m;

        // Exibir resultado
        resultado.innerHTML = `
            <div class="resultado-clima">
                <h2>${Math.round(temperatura)}°</h2>
                <p>${name}, ${country}</p>
            </div>
        `;

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        resultado.innerHTML = `
            <div class="erro">
                <p>Ops! Cidade não localizada. Tente vovamente.</p>
            </div>`;
    }
});
