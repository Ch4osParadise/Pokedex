const nameContainer = document.getElementById('name-container');
const weightContainer = document.getElementById('weight-container');
const heightContainer = document.getElementById('height-container');
const nextButton = document.getElementById('next');
const prevButton = document.getElementById('prev');
const imageContainer = document.getElementById('image-container');
const typesContainer = document.getElementById('types-container');
const descriptionContainer = document.getElementById('description-container');
const evolutionChainContainer = document.getElementById('evolution-chain-container');

// let pokemonIndex = 1;

class Pokedex {
    constructor() {
        this.requestRoot = "https://pokeapi.co/api/v2/";
        this.id = 1;
        this.data = {}
        this.description = {};
        this.evolutionChain = {};
    }

    async getPokemonData(pokemon) {
        if(this.id < 1){
            this.id = 151;
            pokemon = 151;
        }

        if(this.id > 151){
            this.id = 1;
            pokemon = 1;
        }

        try {
            const response = await fetch(`${this.requestRoot}pokemon/${pokemon}`)
            this.data = await response.json();
        } catch (error) {
            console.log(error);
        }
    }

    async getPokemonDescription(pokemon) {
        try {
            const response = await fetch(`${this.requestRoot}pokemon-species/${pokemon}`)
            this.description = await response.json();
        } catch (error) {
            console.log(error);
        }
    }

    async getPokemonEvolutionChain() {
        try {
            const response = await fetch(`${this.description.evolution_chain.url}`)
            this.evolutionChain = await response.json();
        } catch (error) {
            console.log(error);
        }
    }

    async render() {
        this.setName();
        this.setWeight();
        this.setHeight();
        this.setImage(this.data.sprites.front_default, this.data.name, imageContainer);
        this.setTypes();
        this.setDescription();
        await this.setEvolutionChain();
    }

    setName() {
        nameContainer.innerText = this.data.name;
    }

    setWeight() {
        const weight = (Number(this.data.weight) * 0.1).toFixed(2);
        weightContainer.innerText = `Weight: ${weight}kg`;
    }

    setHeight() {
        const height = (Number(this.data.height) * 0.1).toFixed(1);
        heightContainer.innerText = `Height: ${height}m`;
    }

    setImage(src, alt, parent) {
        if(parent.classList.contains('evolution-photo')){
            parent.innerHTML = `<img src="${src}" alt="${alt}" class="evo-image image">`
        } else{
            parent.innerHTML = `<img src="${src}" alt="${alt}" class="main-image image">`
        }

    }

    setTypes() {
        typesContainer.innerHTML = '';

        this.data.types.forEach(type => {
            this.createContainer('div', type.type.name, typesContainer, type.type.name);
        });
    }

    setDescription() {
        descriptionContainer.innerText = this.randomDescription();
        descriptionContainer.innerText = descriptionContainer.innerHTML.replace(/\<br>/g," ");
    };

    async setEvolutionChain() {

        evolutionChainContainer.innerHTML = '';

        const evolutionChainArr = this.createEvolutionChainArray();

        for (const evolution of evolutionChainArr) {
            try {
                const response = await fetch(`${this.requestRoot}pokemon/${evolution}`)
                const data = await response.json();

                const evolutionDivContainer = this.createContainer('div', 'evolution-container',evolutionChainContainer,"")
                const photoDiv = this.createContainer('div',"evolution-photo", evolutionDivContainer, "")
                this.setImage(data.sprites.front_default, data.name, photoDiv);
                this.createContainer('div', 'evolution-name', evolutionDivContainer, evolution);

            } catch (error) {
                console.log(error);
            }
        }
    }

    createEvolutionChainArray() {
        const evolutionChainList = [];

        if (!this.evolutionChain.chain) return evolutionChainList;
        evolutionChainList.push(this.evolutionChain.chain.species.name);

        if (!this.evolutionChain.chain.evolves_to[0]) return evolutionChainList;
        evolutionChainList.push(this.evolutionChain.chain.evolves_to[0].species.name);

        if (!this.evolutionChain.chain.evolves_to[0].evolves_to[0]) return evolutionChainList;
        evolutionChainList.push(this.evolutionChain.chain.evolves_to[0].evolves_to[0].species.name);

        return evolutionChainList;
    }

    getDescriptionInEng() {
        return this.description.flavor_text_entries.filter(text => {
            return text.language.name === 'en';
        });
    }

    randomDescription() {
        const descriptions = this.getDescriptionInEng();
        return descriptions[Math.floor(Math.random() * (descriptions.length))].flavor_text;
    }

    createContainer(type, className, parent, value) {
        const container = document.createElement(`${type}`);
        container.classList.add(`${className}`)
        container.innerText = value;
        parent.appendChild(container);
        return container;
    }
}

const pokedex = new Pokedex();
await pokedex.getPokemonData(pokedex.id);
await pokedex.getPokemonDescription(pokedex.id);
await pokedex.getPokemonEvolutionChain();
await pokedex.render();

nextButton.addEventListener('click', showNext)
prevButton.addEventListener('click', showPrev)

async function showNext() {
    pokedex.id++;
    await pokedex.getPokemonData(pokedex.id);
    await pokedex.getPokemonDescription(pokedex.id);
    await pokedex.getPokemonEvolutionChain();
    await pokedex.render()
}

async function showPrev() {
    pokedex.id--;
    await pokedex.getPokemonData(pokedex.id);
    await pokedex.getPokemonDescription(pokedex.id);
    await pokedex.getPokemonEvolutionChain();
    await pokedex.render();
}



//zrobić oddzielne pliki dla pokedexu, i oddzielne dla rzeczy które robią coś na stronie, w main zostawić tylko listenery i pobieranie :)