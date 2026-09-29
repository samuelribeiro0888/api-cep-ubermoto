const buscarCep = document.getElementById("buscarCep");

const cepInput = document.getElementById("cep");

const loading = document.getElementById("loading");

const endereco = document.getElementById("endereco");

const resultado = document.getElementById("resultado");

const logradouro = document.getElementById("logradouro");

const bairro = document.getElementById("bairro");

const cidade = document.getElementById("cidade");

const distancia = document.getElementById("distancia");

const uber = document.getElementById("uber");

const frete = document.getElementById("frete");

    

const origem = {
    lat: -3.7768,
    lon: -38.5615
};


// Estes valores podem ser alterados.

const TARIFA_BASE = 5.00;

const VALOR_POR_KM = 1.80;


cepInput.addEventListener("input", function () {

    let valor = cepInput.value
        .replace(/\D/g, "")
        .substring(0, 8);


    if (valor.length > 5) {

        valor =
            valor.substring(0, 5)
            + "-"
            + valor.substring(5);

    }


    cepInput.value = valor;

});


buscarCep.addEventListener("click", consultarFrete);


cepInput.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {

        consultarFrete();

    }

});


async function consultarFrete() {

    const cep = cepInput.value
        .replace(/\D/g, "");



    if (cep.length !== 8) {

        alert("Digite um CEP válido com 8 números.");

        return;

    }



    loading.classList.remove("hidden");

    endereco.classList.add("hidden");

    resultado.classList.add("hidden");


    try {


        const respostaCep = await fetch(
            `https://viacep.com.br/ws/${cep}/json/`
        );


        if (!respostaCep.ok) {

            throw new Error("Erro ao consultar o CEP.");

        }


        const dadosCep = await respostaCep.json();


        if (dadosCep.erro) {

            throw new Error("CEP não encontrado.");

        }



        logradouro.textContent =
            `${dadosCep.logradouro}, ${dadosCep.complemento || ""}`;

        bairro.textContent =
            `Bairro: ${dadosCep.bairro}`;

        cidade.textContent =
            `${dadosCep.localidade} - ${dadosCep.uf}`;


        endereco.classList.remove("hidden");



        const enderecoCompleto = `
            ${dadosCep.logradouro},
            ${dadosCep.bairro},
            ${dadosCep.localidade},
            ${dadosCep.uf},
            Brasil
        `;


        const urlNominatim =
            `https://nominatim.openstreetmap.org/search?` +
            `format=jsonv2` +
            `&q=${encodeURIComponent(enderecoCompleto)}` +
            `&limit=1` +
            `&countrycodes=br`;


        const respostaGeo =
            await fetch(urlNominatim);


        if (!respostaGeo.ok) {

            throw new Error(
                "Não foi possível localizar o endereço."
            );

        }


        const locais =
            await respostaGeo.json();


        if (!locais.length) {

            throw new Error(
                "Não foi possível encontrar as coordenadas."
            );

        }


        const destino = {

            lat: Number(locais[0].lat),

            lon: Number(locais[0].lon)

        };



        const urlRota =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${origem.lon},${origem.lat};` +
            `${destino.lon},${destino.lat}` +
            `?overview=false`;


        const respostaRota =
            await fetch(urlRota);


        if (!respostaRota.ok) {

            throw new Error(
                "Não foi possível calcular a rota."
            );

        }


        const dadosRota =
            await respostaRota.json();


        if (
            dadosRota.code !== "Ok" ||
            !dadosRota.routes.length
        ) {

            throw new Error(
                "Rota não encontrada."
            );

        }


        // Distância vem em metros

        const distanciaKm =
            dadosRota.routes[0].distance / 1000;




        const valorMoto =
            TARIFA_BASE +
            (distanciaKm * VALOR_POR_KM);


        // Arredonda para 2 casas

        const valorFrete =
            Math.round(valorMoto * 100) / 100;


        // ==================================
        // 6. MOSTRAR RESULTADO
        // ==================================

        distancia.textContent =
            `${distanciaKm.toFixed(2)} km`;


        uber.textContent =
            formatarMoeda(valorFrete);


        frete.textContent =
            formatarMoeda(valorFrete);


        resultado.classList.remove("hidden");

    }


    catch (erro) {

        alert(
            erro.message ||
            "Ocorreu um erro ao consultar o endereço."
        );

    }


    finally {

        loading.classList.add("hidden");

    }

}



function formatarMoeda(valor) {

    return valor.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}



const darkMode =
    document.getElementById("darkMode");


darkMode.addEventListener("click", function () {

    document.body.classList.toggle("dark");


    if (
        document.body.classList.contains("dark")
    ) {

        darkMode.textContent = "☀️";

    } else {

        darkMode.textContent = "🌙";

    }

});