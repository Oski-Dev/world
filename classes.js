/**
 * Creature - Klasa reprezentująca pojedyncze stworzenie w świecie
 */
class Creature {
    constructor(id, x, y, worldWidth, worldHeight) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        
        // Atrybuty ruchu
        this.angle = Math.random() * Math.PI * 2; // Kierunek w radianach (0-2π)
        this.maxSpeed = 2 + Math.random() * 2; // Maksymalna prędkość (2-4 px/frame)
        this.currentSpeed = this.maxSpeed; // Aktualna prędkość
        
        // Atrybuty energii
        this.energy = 100;
        this.maxEnergy = 100;
        
        // Atrybuty osobnicze
        this.gender = Math.random() > 0.5 ? 'male' : 'female';
        this.color = this.generateColor();
        this.age = 0;
        this.maxAge = 1000 + Math.random() * 500; // 1000-1500 frames
        
        // Atrybuty sensoryczne
        this.sightRange = 80 + Math.random() * 40; // Zasięg wzroku 80-120 px
        
        // Uczucia (0-1) - wpływają na decyzje creaturki
        this.libido = 0;      // Chęć do rozmnażania - rośnie powoli
        this.fear = 0;        // Strach - rośnie w sytuacjach kryzysowych
        this.hunger = 0;      // Głód - rośnie ze spadkiem energii
        
        // Licznik dla zmiany kierunku
        this.directionChangeCounter = 0;
        this.directionChangeInterval = 20 + Math.random() * 30; // Zmień kierunek co 20-50 frames
    }

    /**
     * Generuj losowy kolor dla creaturki - jasne, wyraźne kolory
     */
    generateColor() {
        const hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
        const hue = hues[Math.floor(Math.random() * hues.length)];
        const saturation = 80 + Math.random() * 20;    // 80-100% - nasycone kolory
        const lightness = 45 + Math.random() * 15;     // 45-60% - nie za jasne, nie za ciemne
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    /**
     * Aktualizuj stan stworzenia
     */
    update() {
        // Jeśli energia zerowa, creaturka się zatrzymuje
        if (this.energy <= 0) {
            this.currentSpeed = 0;
            
            // Licznik śmierci - 600 framów ≈ 10 sekund (60 FPS)
            this.deathCounter++;
            if (this.deathCounter >= 600 && !this.isDead) {
                this.isDead = true;
                this.deathCounter = 0; // Zresetuj licznik dla drugiej fazy
            }
        } else {
            // Uzależnij prędkość od energii
            this.currentSpeed = this.maxSpeed * (this.energy / this.maxEnergy);
            this.deathCounter = 0;
        }

        // Jeśli creaturka już martwa, czekaj 10 sekund zanim zniknie
        if (this.isDead) {
            this.deathCounter++;
            if (this.deathCounter >= 600) {
                this.isRemoved = true; // Oznacz do usunięcia
            }
        }

        // ===== UCZUCIA =====
        if (!this.isDead) {
            const energyPercent = this.energy / this.maxEnergy;
            
            // Libido - rośnie powoli (niezależnie od stanu)
            this.libido = Math.min(1, this.libido + 0.001);
            
            // Głód - rośnie wraz ze spadkiem energii
            // Maksymalnie 1 gdy energia = 0, minimalnie 0 gdy energia = maksymalna
            this.hunger = Math.max(0, 1 - energyPercent);
            
            // Strach - rośnie w sytuacjach kryzysowych (energia < 10%)
            if (energyPercent < 0.1) {
                // Szybko rośnie gdy energia krytyczna
                this.fear = Math.min(1, this.fear + 0.02);
            } else {
                // Powoli maleje gdy energia w normie
                this.fear = Math.max(0, this.fear - 0.01);
            }
            
            // Strach zwiększa prędkość
            const fearSpeedMultiplier = 1 + this.fear * 0.5; // 0% fear = 1x speed, 100% fear = 1.5x speed
            this.currentSpeed *= fearSpeedMultiplier;
        }

        // Zmień kierunek losowo
        if (!this.isDead) { // Martwa creaturka się nie porusza
            this.directionChangeCounter++;
            if (this.directionChangeCounter >= this.directionChangeInterval) {
                this.angle += (Math.random() - 0.5) * Math.PI / 4;
                this.directionChangeCounter = 0;
                this.directionChangeInterval = 20 + Math.random() * 30;
            }
        }

        // Oblicz nową pozycję
        const vx = Math.cos(this.angle) * this.currentSpeed;
        const vy = Math.sin(this.angle) * this.currentSpeed;

        this.x += vx;
        this.y += vy;

        // Odbicie od krawędzi mapy (bouncing)
        if (this.x < 10) {
            this.x = 10;
            this.angle = Math.PI - this.angle;
        } else if (this.x > this.worldWidth - 10) {
            this.x = this.worldWidth - 10;
            this.angle = Math.PI - this.angle;
        }

        if (this.y < 10) {
            this.y = 10;
            this.angle = -this.angle;
        } else if (this.y > this.worldHeight - 10) {
            this.y = this.worldHeight - 10;
            this.angle = -this.angle;
        }

        // Strata energii ze względu na ruch (tylko jeśli żywa)
        if (!this.isDead) {
            const energyLoss = 0.5; // Zwiększona strata energii dla szybszych zmian
            this.energy = Math.max(0, this.energy - energyLoss);
        }

        // Starzenie się
        this.age++;
    }

    /**
     * Czy creaturka żyje?
     */
    isAlive() {
        return this.energy > 0 && this.age < this.maxAge;
    }

    /**
     * Zwróć dane stworzenia do serializacji
     */
    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            angle: this.angle,
            maxSpeed: this.maxSpeed,
            currentSpeed: this.currentSpeed,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            gender: this.gender,
            color: this.color,
            age: this.age,
            maxAge: this.maxAge,
            isDead: this.isDead,
            deathCounter: this.deathCounter,
            sightRange: this.sightRange,
            libido: this.libido,
            fear: this.fear,
            hunger: this.hunger
        };
    }

    /**
     * Załaduj dane stworzenia
     */
    static fromJSON(data) {
        const creature = new Creature(data.id, data.x, data.y, data.worldWidth, data.worldHeight);
        creature.angle = data.angle;
        creature.maxSpeed = data.maxSpeed;
        creature.currentSpeed = data.currentSpeed;
        creature.energy = data.energy;
        creature.maxEnergy = data.maxEnergy;
        creature.gender = data.gender;
        creature.color = data.color;
        creature.age = data.age;
        creature.maxAge = data.maxAge;
        creature.isDead = data.isDead;
        creature.deathCounter = data.deathCounter;
        creature.sightRange = data.sightRange;
        creature.libido = data.libido;
        creature.fear = data.fear;
        creature.hunger = data.hunger;
        return creature;
    }
}

/**
 * World - Klasa reprezentująca świat z wszystkimi stworami
 */
class World {
    constructor(width = 800, height = 600) {
        this.width = width;
        this.height = height;
        this.creatures = new Map(); // Map<id, Creature>
        this.generation = 0;
        
        // Dodaj tutaj atrybuty w kolejnych krokach
    }

    /**
     * Dodaj nowe stworzenie do świata
     */
    addCreature(creature) {
        this.creatures.set(creature.id, creature);
    }

    /**
     * Usuń stworzenie ze świata
     */
    removeCreature(id) {
        this.creatures.delete(id);
    }

    /**
     * Aktualizuj cały świat - główna pętla symulacji
     */
    update() {
        // Aktualizuj wszystkie stworzenia
        for (const creature of this.creatures.values()) {
            creature.update();
        }
        
        // Usuń martwe creaturki, które się już rozkładają
        const toRemove = [];
        for (const [id, creature] of this.creatures) {
            if (creature.isRemoved) {
                toRemove.push(id);
            }
        }
        
        for (const id of toRemove) {
            this.creatures.delete(id);
        }
        
        this.generation++;
    }

    /**
     * Zwróć wszystkie stworzenia
     */
    getCreatures() {
        return Array.from(this.creatures.values());
    }

    /**
     * Zwróć dane świata do serializacji
     */
    toJSON() {
        return {
            width: this.width,
            height: this.height,
            generation: this.generation,
            creatures: this.getCreatures().map(c => c.toJSON())
        };
    }

    /**
     * Załaduj dane świata
     */
    static fromJSON(data) {
        const world = new World(data.width, data.height);
        world.generation = data.generation;
        
        for (const creatureData of data.creatures) {
            const creature = Creature.fromJSON(creatureData);
            world.addCreature(creature);
        }
        
        return world;
    }
}

// Eksportuj klasy dla web workera
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Creature, World };
}
