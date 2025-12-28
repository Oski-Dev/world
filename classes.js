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
        
        // Licznik dla zmiany kierunku
        this.directionChangeCounter = 0;
        this.directionChangeInterval = 20 + Math.random() * 30; // Zmień kierunek co 20-50 frames
    }

    /**
     * Generuj losowy kolor dla creaturki
     */
    generateColor() {
        const hue = Math.random() * 360;
        const saturation = 70 + Math.random() * 30;
        const lightness = 50 + Math.random() * 20;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    /**
     * Aktualizuj stan stworzenia
     */
    update() {
        // Zmień kierunek losowo
        this.directionChangeCounter++;
        if (this.directionChangeCounter >= this.directionChangeInterval) {
            this.angle += (Math.random() - 0.5) * Math.PI / 4; // Zmień kierunek o ±22.5 stopni
            this.directionChangeCounter = 0;
            this.directionChangeInterval = 20 + Math.random() * 30;
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

        // Strata energii ze względu na ruch
        const energyLoss = 0.1;
        this.energy = Math.max(0, this.energy - energyLoss);

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
            maxAge: this.maxAge
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
