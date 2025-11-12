// Importar as funções que vamos testar
const {
    buscarCoordenadas,
    buscarClima,
    obterDescricaoClima,
    buscarPrevisaoCompleta
} = require('../assets/js/api.js');

// Mock do fetch (simular requisições HTTP)
global.fetch = jest.fn();

// Limpar mocks antes de cada teste
beforeEach(() => {
    jest.clearAllMocks();
});

// ========== TESTES BÁSICOS ==========

describe('Testes Básicos - Função buscarCoordenadas', () => {
    
    test('Deve retornar coordenadas para uma cidade válida', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                results: [{
                    latitude: -22.9068,
                    longitude: -43.1729,
                    name: "Rio de Janeiro",
                    country: "Brasil",
                    admin1: "Rio de Janeiro"
                }]
            })
        });

        const resultado = await buscarCoordenadas("Rio de Janeiro");

        expect(resultado).toBeDefined();
        expect(resultado.name).toBe("Rio de Janeiro");
        expect(resultado.latitude).toBe(-22.9068);
        expect(resultado.longitude).toBe(-43.1729);
    });

    test('Deve lançar erro para cidade inexistente', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ results: [] })
        });

        await expect(buscarCoordenadas("CidadeQueNaoExiste123"))
            .rejects
            .toThrow("Cidade não encontrada");
    });

    test('Deve retornar erro para entrada vazia', async () => {
        await expect(buscarCoordenadas("")).rejects.toThrow("Nome da cidade não pode estar vazio");
        await expect(buscarCoordenadas("   ")).rejects.toThrow("Nome da cidade não pode estar vazio");
    });

    test('Deve tratar falha na API de geocodificação', async () => {
        fetch.mockResolvedValueOnce({ ok: false, status: 500 });
        await expect(buscarCoordenadas("São Paulo"))
            .rejects
            .toThrow("Falha ao buscar coordenadas da cidade.");
    });
});

describe('Testes Básicos - Função buscarClima', () => {
    
    test('Deve retornar dados meteorológicos válidos', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ current: { temperature_2m: 25.5, weathercode: 0 } })
        });

        const resultado = await buscarClima(-22.9068, -43.1729);

        expect(resultado).toBeDefined();
        expect(resultado.current.temperature_2m).toBe(25.5);
        expect(resultado.current.weathercode).toBe(0);
    });

    test('Deve tratar falha na API de clima', async () => {
        fetch.mockResolvedValueOnce({ ok: false, status: 503 });
        await expect(buscarClima(-22.9068, -43.1729))
            .rejects
            .toThrow("Falha ao buscar dados do clima.");
    });
});

describe('Testes Básicos - Função obterDescricaoClima', () => {
    
    test('Deve retornar descrição correta para códigos conhecidos', () => {
        expect(obterDescricaoClima(0)).toBe("Céu limpo ☀️");
        expect(obterDescricaoClima(61)).toBe("Chuva leve 🌦️");
        expect(obterDescricaoClima(95)).toBe("Tempestade 🌩️");
    });

    test('Deve retornar "Clima desconhecido" para código inválido', () => {
        expect(obterDescricaoClima(999)).toBe("Clima desconhecido");
        expect(obterDescricaoClima(-1)).toBe("Clima desconhecido");
    });
});

// ========== CASOS EXTREMOS ==========

describe('Casos Extremos', () => {
    
    test('Deve simular limite de requisições excedido (429)', async () => {
        fetch.mockResolvedValueOnce({ ok: false, status: 429 });
        await expect(buscarCoordenadas("São Paulo"))
            .rejects
            .toThrow("Falha ao buscar coordenadas da cidade.");
    });

    test('Deve tratar timeout de rede', async () => {
        fetch.mockRejectedValueOnce(new Error("Network timeout"));
        await expect(buscarCoordenadas("Campinas"))
            .rejects
            .toThrow("Network timeout");
    });

    test('Deve tratar mudança no formato JSON da resposta', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: [] })
        });
        await expect(buscarCoordenadas("Curitiba"))
            .rejects
            .toThrow("Cidade não encontrada");
    });

    test('Deve validar resposta com dados incompletos', async () => {
        fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ results: [{}] }) });
        const resultado = await buscarCoordenadas("Belo Horizonte");
        expect(resultado).toEqual({});
    });
});

// ========== TESTES INTEGRADOS COM PREVISÃO DE 5 DIAS ==========

describe('Testes Integrados - buscarPrevisaoCompleta', () => {
    
    test('Deve retornar previsão completa para cidade válida', async () => {
        // Mock para geocodificação
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                results: [{
                    latitude: -23.5505,
                    longitude: -46.6333,
                    name: "São Paulo",
                    country: "Brasil",
                    admin1: "São Paulo"
                }]
            })
        });

        // Mock para clima atual
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                current: { temperature_2m: 22.3, weathercode: 1 }
            })
        });

        const resultado = await buscarPrevisaoCompleta("São Paulo");

        expect(resultado).toBeDefined();
        expect(resultado.temperatura).toBe(22);
        expect(resultado.cidade).toBe("São Paulo");
        expect(resultado.descricao).toContain("Parcialmente limpo");
    });

    test('Deve retornar previsão diária para os próximos 5 dias', async () => {
        // Mock para geocodificação
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                results: [{
                    latitude: -23.5505,
                    longitude: -46.6333,
                    name: "São Paulo",
                    country: "Brasil",
                    admin1: "São Paulo"
                }]
            })
        });

        // Mock para forecast 5 dias
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                daily: {
                    time: ["2025-11-11","2025-11-12","2025-11-13","2025-11-14","2025-11-15"],
                    temperature_2m_max: [30,28,27,26,25],
                    temperature_2m_min: [20,18,17,16,15],
                    weathercode: [0,1,3,61,95]
                }
            })
        });

        const resultado = await buscarPrevisaoCompleta("São Paulo");

        expect(resultado).toBeDefined();
        expect(resultado.previsao.length).toBe(5); // 5 dias
        expect(resultado.previsao[0].max).toBe(30);
        expect(resultado.previsao[0].min).toBe(20);
        expect(resultado.previsao[0].codigoClima).toBe(0);
        expect(resultado.previsao[4].max).toBe(25);
        expect(resultado.previsao[4].min).toBe(15);
        expect(resultado.previsao[4].codigoClima).toBe(95);
    });
});
